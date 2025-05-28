import React from 'react';
import { useNavigate } from 'react-router-dom';
import Images1 from "../assets/Images1.jpg";  // Ensure the correct path to the images folder
import './Home.css';
const Home = () => {
  const navigate = useNavigate();

  const handleLearn = () => {
    navigate('/form');
  }
  return (
    <div className="home-container">
      <header className="hero-section">

        <div className='div'>

        <div className='content'>
        <h1 className="hero-title">Welcome to AI-Driven </h1>
        <h1 className='effect'>Smart Education</h1>
        <p className="hero-description">
          Transforming learning experiences with cutting-edge AI technology. Our platform empowers students and educators with personalized insights, intelligent tools, and adaptive resources.
        </p>
        <button className="cta-button" onClick={handleLearn}>Learn More</button>
        </div>

          <img src={Images1} alt="Image1" className='c-img'/>
        
        </div>

      </header>
      
      <section className="features-section">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <h3>Personalized Learning</h3>
            <p>
              Leverage AI to create tailored learning paths that adapt to each student's pace, style, and needs.
            </p>
          </div>
          <div className="feature-item">
            <h3>Smart Insights</h3>
            <p>
              Empower educators with actionable analytics to track progress and enhance teaching methods.
            </p>
          </div>
          <div className="feature-item">
            <h3>Interactive Tools</h3>
            <p>
              Engage students with AI-powered quizzes and simulations.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 AI-Driven Smart Education. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;