import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../CSS/SignUp.css';
import axios from 'axios';

/**
 * SignUp component for user registration.
 * Provides a form for users to sign up with personal and account details.
 *
 * @component
 * @returns {JSX.Element} The rendered SignUp component.
 */
const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleInitial: '',
    lastName: '',
    birthDate: '',
    weight: '',
    heightFeet: '',
    heightInches: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  /**
   * Handle input change for form data.
   * @param {Object} e - The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * Handle form submission for sign-up.
   * Sends user data to the server for registration.
   *
   * @param {Object} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    
    // Combine heightFeet and heightInches
    const height = `${formData.heightFeet}'${formData.heightInches}"`;

    const dataToSend = {
      ...formData,
      height
    };

    try {
      const response = await axios.post('http://localhost:4000/register', dataToSend);
      alert('User registered successfully.');
    } catch (error) {
      console.error('Error registering new user:', error);
      alert('Error registering new user.');
    }
  };

  return (
    <div className="signup-container">
      <header className="header">
        <Link to="/" className="site-title">
          <h1>FitnessFive</h1>
        </Link>
      </header>
      
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="section">
          <h3>Personal Information</h3>
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input type="date" name="birthDate" placeholder="Birth Date" value={formData.birthDate} onChange={handleChange} required />
          <input type="number" name="weight" placeholder="Weight (lbs)" value={formData.weight} onChange={handleChange} required />
          <div className="height-input">
            <select name="heightFeet" value={formData.heightFeet} onChange={handleChange} required>
              <option value="">Height</option>
              {[...Array(36)].map((_, i) => {
                const feet = 4 + Math.floor(i / 12);
                const inches = i % 12;
                return (
                  <option key={i} value={`${feet}'${inches}"`}>
                    {feet}'{inches}"
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className="section">
          <h3>Account Details</h3>
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
