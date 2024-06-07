import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/LandingPage.css';
import fitnessImage from '../Images/fitnessImage.jpg';
import axios from 'axios';


/**
 * LandingPage component that serves as the main entry point for the application.
 * Displays a welcome message, navigation links, and user profile information if logged in.
 *
 * @component
 * @returns {JSX.Element} The rendered LandingPage component.
 */
const LandingPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [profileBgColor, setProfileBgColor] = useState('');

  useEffect(() => {
    /**
     * Fetch user data from the server.
     * Sets user state and profile background color.
     */
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await axios.get('http://localhost:4000/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();

    // Set a random background color for profile holder
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F39C12', '#8E44AD'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setProfileBgColor(randomColor);
  }, []);

  /**
   * Navigate to the Login page.
   */
  const handleLogin = () => {
    navigate('/Login');
  };

  /**
   * Navigate to the Dashboard page if user is logged in, otherwise navigate to Login page.
   */
  const handleStartTracking = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/Login');
    }
  };

  /**
   * Get the initials of the user's name.
   * @param {string} firstName - The first name of the user.
   * @param {string} lastName - The last name of the user.
   * @returns {string} The initials of the user's name.
   */
  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <div>
      <header className="header">
        <Link to="/" className="site-title">
          <h1>FitnessFive</h1>
        </Link>
        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/about" className="nav-link">About</Link>
            </li>
            <li>
              <Link to="/contact" className="nav-link">Contact Us</Link>
            </li>
            {user ? (
              <Link to="/dashboard">
                <div className="profile-photo-header" style={{ backgroundColor: profileBgColor }}>
                  {user.ProfilePhotoURL ? (
                    <img
                      src={`http://localhost:4000/${user.ProfilePhotoURL}`}
                      alt="Profile"
                      className="profile-photo"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'default-image-url'; // Provide a default image URL here
                      }}
                    />
                  ) : (
                    <span>{getInitials(user.FirstName, user.LastName)}</span>
                  )}
                </div>
              </Link>
            ) : (
              <button onClick={handleLogin}>Log in</button>
            )}
          </ul>
        </nav>
      </header>

      <div className="welcome-section">
        <div className="main-wrapper">
          <section className="main-section">
            <div className="hero-content">
              <h2>Welcome to Your Fitness Journey</h2>
              <p>Track, Compete, and Celebrate Every Step of Your Progress</p>
              <button onClick={handleStartTracking}>Start Tracking</button>
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
        <section className="features">
          <div className="feature-card">
            <i className="fas fa-chart-line feature-icon"></i>
            <h4>Comprehensive Tracking</h4>
            <p>Monitor every aspect of your fitness journey with detailed analytics and real-time updates.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-dumbbell feature-icon"></i>
            <h4>Personalized Workouts</h4>
            <p>Receive customized workout plans tailored to your specific goals and progress.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-users feature-icon"></i>
            <h4>Community Support</h4>
            <p>Join a community of like-minded individuals to share your journey and motivate each other.</p>
          </div>
        </section>
      </div>



      <footer className="footer">
        <div className="social-media">
          <i className="fab fa-facebook"></i>
          <i className="fab fa-twitter"></i>
          <i className="fab fa-instagram"></i>
          <i className="fab fa-linkedin"></i>
          <i className="fab fa-youtube"></i>
        </div>
        <p>&copy; 2024 FitnessFive. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
