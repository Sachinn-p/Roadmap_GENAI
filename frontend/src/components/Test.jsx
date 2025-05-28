import React, { useEffect, useState } from "react";

function Test() {
  const [roadmap, setRoadmap] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/roadmap")
      .then((res) => res.json())
      .then((data) => setRoadmap(data))
      .catch((err) => console.error("Error fetching roadmap:", err));
  }, []);

  return (
    <div>
      <h1>Generated Roadmap</h1>
      {roadmap ? (
        <pre>{JSON.stringify(roadmap, null, 2)}</pre>
      ) : (
        <p>Loading roadmap...</p>
      )}
    </div>
  );
}

export default Test;
