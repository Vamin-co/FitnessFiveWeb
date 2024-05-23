import React from 'react';
import '../CSS/LandingPage.css';
import fitnessImage from '../Images/fitnessImage.jpg'; // Adjust the path as necessary
import user1Image from '../Images/avatar1.jpg'; // Adjust the path as necessary
import user2Image from '../Images/avatar2.jpg'; // Adjust the path as necessary
import user3Image from '../Images/avatar3.jpg'; // Adjust the path as necessary

const LandingPage = () => {
  const handleLogin = () => {
    // Add the logic for login here
    window.location.href = '/Login';
  };

  return (
    <div>
      <header className="header">
        <h1>FitnessFive</h1>
        <nav>
          <ul className="nav-links">
            <li>
              <a href="#">About</a>
            </li>
            <li>
               <a href="#">Contact Us</a>
            </li>
            {/* <a href="/Login">Log in</a> */}
            <button onClick={handleLogin}>Log in</button>
          </ul>
        </nav>
      </header>

      <div className="welcome-section">
      <div class="main-wrapper">
        <section className="main-section">
          <div className="hero-content">
            <h2>Welcome to Your Fitness Journey</h2>
            <p>Track, Compete, and Celebrate Every Step of Your Progress</p>
            <button>Start Tracking</button>
          </div>
        </section>
        </div>
      </div>

      <div className="image-section">
        <section className="hero-section">
          <img className="hero-image" src={fitnessImage} alt="Fitness" />
        </section>
      </div>

      <div className="card-section">
        <section className="testimonials">
          <div className="testimonial">
            <img src={user1Image} alt="User 1" />
            <p>"A terrific piece of praise"</p>
            <h4>Max Gochenour</h4>
            <p>Pro Soccer Player</p>
          </div>
          <div className="testimonial">
            <img src={user2Image} alt="User 2" />
            <p>"A fantastic bit of feedback"</p>
            <h4>Chaker Baloch</h4>
            <p>Yoga Instructor</p>
          </div>
          <div className="testimonial">
            <img src={user3Image} alt="User 3" />
            <p>"A genuinely glowing review"</p>
            <h4>Dmytro Dovhalets</h4>
            <p>Subject-matter Expert</p>
          </div>
        </section>
      </div>

      <footer className="footer">
        <ul className="footer-links">
          <li>
            <a href="#">Page</a>
          </li>
          <li>
            <a href="#">Page</a>
          </li>
          <li>
            <a href="#">Page</a>
          </li>
        </ul>
        <div className="social-links">
          <i className="fab fa-facebook"></i>
          <i className="fab fa-twitter"></i>
          <i className="fab fa-instagram"></i>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
