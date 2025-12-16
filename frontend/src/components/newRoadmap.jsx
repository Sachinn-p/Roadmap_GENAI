import React, { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const VideoSidebar = ({ video, onClose }) => {
  if (!video) return null;

  return (
    <div className="fixed right-0 top-0 w-[400px] h-screen bg-white shadow-lg p-4 overflow-y-auto">
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full"
      >
        ×
      </button>
      <div className="mt-8">
        <iframe
          width="100%"
          height="315"
          src={`https://www.youtube.com/embed/${video.id}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <h3 className="text-lg font-semibold mt-4">{video.title}</h3>
        <p className="text-sm text-gray-600 mt-2">{video.description}</p>
      </div>
    </div>
  );
};

const generateNodesAndEdges = (courseData) => {
  // ... (keeping the existing generateNodesAndEdges function unchanged)
};

export default function Roadmap() {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const searchYouTubeVideos = async (query) => {
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || '';
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          query
        )}&maxResults=1&type=video&key=${apiKey}`
      );
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const video = data.items[0];
        return {
          id: video.id.videoId,
          title: video.snippet.title,
          description: video.snippet.description,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching YouTube video:", error);
      return null;
    }
  };

  const onNodeClick = useCallback(async (event, node) => {
    // Don't search for videos when clicking the course or unit nodes
    if (node.id === 'course' || node.id.startsWith('unit-')) {
      setSelectedVideo(null);
      return;
    }

    const searchQuery = `${node.data.label} tutorial`;
    const video = await searchYouTubeVideos(searchQuery);
    setSelectedVideo(video);
  }, []);

  useEffect(() => {
    const fetchRoadmap = async () => {
      const name = localStorage.getItem("name");
      if (!name) {
        setError("Course name is not available");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/roadmap?name=${encodeURIComponent(name)}`
        );
        const data = await response.json();

        if (response.ok) {
          setCourseData(data.roadmap);
          const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges(data.roadmap);
          setNodes(newNodes);
          setEdges(newEdges);
        } else {
          setError(data.error || "No roadmap available");
        }
      } catch (error) {
        setError("Error fetching roadmap: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [setNodes, setEdges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading roadmap...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div style={{ width: selectedVideo ? "calc(100vw - 400px)" : "100vw", height: "100vh", border: "1px black solid" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          defaultZoom={1}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
      <VideoSidebar 
        video={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
      />
    </div>
  );
}