import React from 'react';
import '../CSS/LandingPage.css';

const LandingPage = () => {
    return (
      <header className="app-header">
        <h1>FitnessPro</h1>
        <nav>
          <a href="#features">Features</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>
    );
  };

export default LandingPage;