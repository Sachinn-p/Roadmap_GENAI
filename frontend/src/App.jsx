import Form from "./components/Form";
import { Routes, Route } from "react-router-dom";
import Roadmap from "./components/Roadmap";
import Content from "./components/Content";
import Home from "./components/Home";
// import './index.css';
function App() {
  return (
    <>
    
      <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/form" element={<Form/>} />
        <Route path="/road-map" element={<Roadmap />} />
        <Route path="/content" element={<Content />} />
      </Routes>
    </>
  );
}

export default App;
