import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../CSS/ContactUs.css';
import contactUsImage from '../Images/contactus.jpg';

/**
 * ContactUs component that provides a contact form for users to send messages.
 * Fetches user data if a token is available in local storage.
 * Displays user profile information and a contact form.
 *
 * @component
 * @returns {JSX.Element} The rendered ContactUs component.
 */
const ContactUs = () => {
  const [user, setUser] = useState(null);
  const [profileBgColor, setProfileBgColor] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

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

        const colors = ['#FF5733', '#33FF57', '#3357FF', '#F39C12', '#8E44AD'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setProfileBgColor(randomColor);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  /**
   * Navigate to the Login page.
   */
  const handleLogin = () => {
    navigate('/Login');
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

  /**
   * Handle the form submission.
   * Sends the contact message to the server.
   * @param {Object} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/messages', {
        email,
        message,
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="contact-us-container">
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
                        e.target.src = 'default-image-url';
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

      <div className="contact-us-header">
        <h1 className="contact-us-header-title">Contact us</h1>
        <p className="contact-us-header-subtitle">Let's Talk! Your Questions, Our Answers</p>
      </div>

      <div className="contact-us-form-container">
        <form className="contact-us-form" onSubmit={handleSubmit}>
          <div className="contact-us-form-group">
            <label className="contact-us-label">First name</label>
            <input type="text" className="contact-us-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="contact-us-form-group">
            <label className="contact-us-label">Last name</label>
            <input type="text" className="contact-us-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="contact-us-form-group">
            <label className="contact-us-label">Email address</label>
            <input type="email" className="contact-us-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="contact-us-form-group">
            <label className="contact-us-label">Your message</label>
            <textarea className="contact-us-textarea" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter your question or message"></textarea>
          </div>
          <button type="submit" className="contact-us-submit-button" disabled={isSubmitted}>
            <span className="contact-us-submit-text">{isSubmitted ? 'Message Sent' : 'Submit'}</span>
          </button>
        </form>
        <img className="contact-us-image" src={contactUsImage} alt="Contact Us" />
      </div>

      <footer className="footer">
        <ul className="footer-links">
        </ul>
      </footer>
    </div>
  );
};

export default ContactUs;
