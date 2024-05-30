import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/About.css';
import aboutUsImage from '../Images/aboutphoto.jpg'; // Adjust the path as necessary
import axios from 'axios';

const About = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [profileBgColor, setProfileBgColor] = useState('');

  useEffect(() => {
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

        // Set a random background color for profile holder
        const colors = ['#FF5733', '#33FF57', '#3357FF', '#F39C12', '#8E44AD'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setProfileBgColor(randomColor);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleLogin = () => {
    navigate('/Login');
  };

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <div className="about-container">
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
              <button onClick={handleLogin} className="login-button">Log in</button>
            )}
          </ul>
        </nav>
      </header>
      <div className="about-content">
        <img className="about-image" src={aboutUsImage} alt="FitnessFive Image" />
        <div className="about-text-container">
          <h2 className="about-title">About FitnessFive</h2>
          <h3 className="about-subtitle">Empowering Your Fitness Journey</h3>
          <p className="about-description">
            At FitnessFive, we go beyond traditional workouts and weightlifting. Our mission is to empower individuals to transform their lifestyles through consistent and focused physical activity. We recognize that each fitness journey is unique, which is why our approach is carefully tailored to meet individual needs and goals. Whether you're just starting out or looking to elevate your training, we're here to support you every step of the way.<br /><br />
            Utilizing cutting-edge technology, FitnessFive offers a range of tools designed to enhance your training experience. Our app allows you to track workouts, visualize your progress, and compete in virtual leaderboards with participants across the country.
          </p>
        </div>
      </div>
      <footer className="footer">
        <ul className="footer-links">
          
        </ul>
      </footer>
    </div>
  );
};

export default About;
