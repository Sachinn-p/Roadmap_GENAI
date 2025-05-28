import React, { useState } from "react";
import "./Form.css";
import { useNavigate } from "react-router-dom";
function UploadForm() {
  const [name, setName] = useState("");
  const [careerInterest, setCareerInterest] = useState("");
  const [expertise, setExpertise] = useState("");
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [message, setMessage] = useState("");
  const [roadmap, setRoadmap] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !careerInterest || !expertise || !file1 || !file2) {
      setMessage("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("careerInterest", careerInterest);
    localStorage.setItem("name", name);
    formData.append("expertise", expertise);
    formData.append("file1", file1);
    formData.append("file2", file2);

    try {
      const response = await fetch("http://localhost:5000/submit-form", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Roadmap is being generated...");
        navigate("/road-map");
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Error submitting form.");
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h2>Upload PDF to Generate Roadmap</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Career Interest:</label>
        <input
          type="text"
          value={careerInterest}
          onChange={(e) => setCareerInterest(e.target.value)}
          required
        />

        <label>Expertise:</label>
        <input
          type="text"
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
          required
        />

        <label>Upload Objective PDF :</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile1(e.target.files[0])}
          required
        />
        <label>Upload Curriculum PDF :</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile2(e.target.files[0])}
          required
        />

        <button type="submit">Submit</button>
      </form>

      {message && <p>{message}</p>}
      {roadmap && (
        <div>
          <h3>Generated Roadmap</h3>
          <pre>{JSON.stringify(roadmap, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default UploadForm;
