import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CSS/Myprofile.css';

const Myprofile = () => {
  const [user, setUser] = useState({
    firstName: '',
    middleInitial: '',
    lastName: '',
    birthDate: '',
    weight: '',
    height: '',
    username: '',
    email: '',
    profilePhoto: '',
    password: '' // Add this to avoid undefined
  });

  const [newPhoto, setNewPhoto] = useState(null);
  const [profilePhotoURL, setProfilePhotoURL] = useState('');
  const [error, setError] = useState('');
  const [profileBgColor, setProfileBgColor] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please log in.');
        return;
      }
      
      try {
        const response = await axios.get('http://localhost:4000/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Fetched user data:', response.data);
        setUser({
          firstName: response.data.FirstName || '',
          middleInitial: '', // Assuming the backend doesn't provide this, setting as empty
          lastName: response.data.LastName || '',
          birthDate: '', // Assuming the backend doesn't provide this, setting as empty
          weight: '', // Assuming the backend doesn't provide this, setting as empty
          height: '', // Assuming the backend doesn't provide this, setting as empty
          username: '', // Assuming the backend doesn't provide this, setting as empty
          email: response.data.Email || '',
          profilePhoto: response.data.ProfilePhotoURL || '',
          password: '' // Ensure it's an empty string initially
        });
        setProfilePhotoURL(response.data.ProfilePhotoURL);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Error fetching user data, please log in again.');
      }
    };

    fetchUserData();

    // Set a random background color for profile holder
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F39C12', '#8E44AD'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setProfileBgColor(randomColor);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value
    });
  };

  const handlePhotoChange = (e) => {
    setNewPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('firstName', user.firstName);
    formData.append('middleInitial', user.middleInitial);
    formData.append('lastName', user.lastName);
    formData.append('birthDate', user.birthDate);
    formData.append('weight', user.weight);
    formData.append('height', user.height);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('password', user.password); // Include password only if updating
    if (newPhoto) {
      formData.append('profilePhoto', newPhoto);
    }

    try {
      await axios.put('http://localhost:4000/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (newPhoto) {
        // Upload the new profile photo
        const photoFormData = new FormData();
        photoFormData.append('profilePhoto', newPhoto);

        await axios.post('http://localhost:4000/upload', photoFormData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <div className="profile-page">
      {error && <p className="error">{error}</p>}
      <div className="profile-header">
        <h1>Welcome, {user.firstName}</h1>
        <p>Tue, 07 June 2022</p>
        <img className="user-icon" src="https://via.placeholder.com/52x52" alt="User Icon" />
      </div>
      <div className="profile-card">
        <img className="profile-banner" src="https://via.placeholder.com/1282x100" alt="Profile Banner" />
        <div className="profile-details">
          <div 
            className="profile-photo-user" 
            style={{ backgroundColor: profileBgColor }}
          >
            {profilePhotoURL ? (
              <img 
                src={`http://localhost:4000/${profilePhotoURL}`} 
                alt="Profile" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/100?text=Profile'; // Provide a default image URL here
                }}
              />
            ) : (
              <span>{getInitials(user.firstName, user.lastName)}</span>
            )}
          </div>
          <div className="user-info">
            <h2>{user.firstName} {user.lastName}</h2>
            <p>{user.email}</p>
          </div>
          <button className="edit-button-profile">Edit</button>
        </div>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" value={user.firstName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" value={user.lastName} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Middle Initial</label>
              <input type="text" name="middleInitial" value={user.middleInitial} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Birth Date</label>
              <input type="date" name="birthDate" value={user.birthDate} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Weight</label>
              <input type="number" name="weight" value={user.weight} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Height</label>
              <input type="number" name="height" value={user.height} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input type="text" name="username" value={user.username} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={user.email} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={user.password} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Profile Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </div>
          </div>
          <button type="submit" className="save-button">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default Myprofile;
