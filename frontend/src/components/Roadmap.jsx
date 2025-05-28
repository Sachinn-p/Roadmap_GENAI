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
import { useNavigate } from "react-router-dom";

export default function Roadmap() {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const generateNodesAndEdges = useCallback((courseData) => {
    if (!courseData) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];

    // Enhanced spacing configuration
    const unitSpacing = 100;
    const topicSpacing = 300;
    const topicsPerRow = 6;
    const baseX = 800;
    const baseY = 50;
    const topicVerticalSpacing = 100;

    // Calculate the maximum number of topics in any unit
    const maxTopics = Math.max(
      ...courseData.roadmap.map((unit) => unit.topics.length)
    );
    const maxRows = Math.ceil(maxTopics / topicsPerRow);

    // Add course node
    nodes.push({
      id: "course",
      position: { x: baseX, y: baseY },
      data: { label: courseData.course_name },
      style: {
        background: "#6ede87",
        padding: 10,
        borderRadius: 5,
        width: 200,
      },
    });

    // Add units and topics
    courseData.roadmap.forEach((unit, unitIndex) => {
      const unitId = `unit-${unit.unit_number}`;
      const unitY =
        baseY +
        (unitIndex + 1) * (unitSpacing + maxRows * topicVerticalSpacing);

      // Add unit node
      nodes.push({
        id: unitId,
        position: { x: baseX, y: unitY },
        data: { label: `Unit ${unit.unit_number}: ${unit.unit_title}` },
        style: {
          background: "#ff0072",
          padding: 10,
          borderRadius: 5,
          width: 250,
        },
      });

      // Connect course to unit
      edges.push({
        id: `course-${unitId}`,
        source: "course",
        target: unitId,
        type: "smoothstep",
      });

      // Add topics for this unit
      unit.topics.forEach((topic, topicIndex) => {
        const topicId = `${unitId}-topic-${topicIndex}`;
        const column = topicIndex % topicsPerRow;
        const row = Math.floor(topicIndex / topicsPerRow);

        const topicX =
          baseX -
          (topicSpacing * (topicsPerRow - 1)) / 2 +
          column * topicSpacing;
        const topicY = unitY + 100 + row * topicVerticalSpacing;

        nodes.push({
          id: topicId,
          position: { x: topicX, y: topicY },
          data: { label: topic },
          style: {
            background: "#4895ef",
            padding: 8,
            borderRadius: 4,
            fontSize: "12px",
            width: 180,
          },
        });

        edges.push({
          id: `${unitId}-${topicId}`,
          source: unitId,
          target: topicId,
          type: "smoothstep",
          style: { stroke: "#4895ef" },
          animated: true,
        });
      });
    });

    return { nodes, edges };
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const navigate = useNavigate();

  const onNodeClick = useCallback(async (event, node) => {
    const topicName = node.data.label;
    localStorage.setItem("title", topicName);

    navigate("/content");
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
          const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges(
            data.roadmap
          );
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
  }, [setNodes, setEdges, generateNodesAndEdges]);

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
    <div className="flex w-full h-screen">
      <div
        className="border border-black"
        style={{ height: "100vh", width: "100vh" }}
      >
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

      <div className=" p-4 border-l border-gray-200">
        {selectedVideo ? (
          <div className="aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Click on a topic to view its video
          </div>
        )}
      </div>
    </div>
  );
}
