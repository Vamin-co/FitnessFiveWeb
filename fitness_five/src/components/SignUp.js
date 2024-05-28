import React, { useState } from 'react';
import '../CSS/SignUp.css';
import axios from 'axios';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleInitial: '',
    lastName: '',
    birthDate: '',
    weight: '',
    height: '',
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/register', formData);
      alert('User registered successfully.');
    } catch (error) {
      console.error('Error registering new user:', error);
      alert('Error registering new user.');
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
        <input type="text" name="middleInitial" placeholder="Middle Initial" value={formData.middleInitial} onChange={handleChange} />
        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
        <input type="date" name="birthDate" placeholder="Birth Date" value={formData.birthDate} onChange={handleChange} required />
        <input type="number" name="weight" placeholder="Weight" value={formData.weight} onChange={handleChange} required />
        <input type="number" name="height" placeholder="Height" value={formData.height} onChange={handleChange} required />
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
