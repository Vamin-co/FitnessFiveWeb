import React, { useEffect, useState, useRef } from 'react';
import "../CSS/Dashboard.css";
import { useNavigate, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faDumbbell, faEnvelope, faQuestionCircle, faBullseye, faAppleAlt, faCog, faArrowRight, faUser, faSignOutAlt, faUserEdit, faCogs } from '@fortawesome/free-solid-svg-icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const data = [
  { day: 'Sun', steps: 1000 },
  { day: 'Mon', steps: 2000 },
  { day: 'Tue', steps: 4000 },
  { day: 'Wed', steps: 9245 },
  { day: 'Thu', steps: 4800 },
  { day: 'Fri', steps: 6200 },
  { day: 'Sat', steps: 7300 },
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Reference for the dropdown menu

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please log in.');
        navigate('/'); // Redirect to login if no token is present
        return;
      }
      
      try {
        const response = await axios.get('http://localhost:4000/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Fetched user data:', response.data); // Debugging line
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Error fetching user data, please log in again.');
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <NavLink to="/" className={({ isActive }) => "sidebar-icon middle-icon" + (isActive ? " active" : "")}>
          <FontAwesomeIcon icon={faHome} />
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => "sidebar-icon" + (isActive ? " active" : "")}>
          <FontAwesomeIcon icon={faDumbbell} />
        </NavLink>
        <NavLink to="/mailing" className={({ isActive }) => "sidebar-icon" + (isActive ? " active" : "")}>
          <FontAwesomeIcon icon={faEnvelope} />
        </NavLink>
        <div className="sidebar-icon bottom-icon">
          <FontAwesomeIcon icon={faQuestionCircle} />
      </div>
      </div>
      <div className="main-content">
        <div className="activity-section">
          <div className="activity-graph-container">
            <div className="activity-header">
              <h3>Activity</h3>
              <select className="timeframe-selector">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="chart-background">
              <div className="chart-border">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="steps" stroke="#ff6b6b" dot={{ r: 6 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="cards-container">
          <div className="card">
            <h3>Workout Plan</h3>
            <p>4/5 Workouts completed</p>
            <div className="progress-bar">
              <span style={{ width: '80%' }}></span>
            </div>
            <p>Progress: 80%</p>
            <p>Target: Complete all workouts</p>
          </div>
          <div className="card">
            <h3>Nutrition Plan</h3>
            <p>1800/2000 Calories consumed</p>
            <div className="progress-bar">
              <span style={{ width: '90%' }}></span>
            </div>
            <p>Progress: 90%</p>
            <p>Target: Stay within 2000 Calories</p>
          </div>
          <div className="card">
            <h3>Personal Bests</h3>
            <p>Squat: 150kg (new record)</p>
            <div className="progress-bar">
              <span style={{ width: '100%' }}></span>
            </div>
            <p>Progress: 100%</p>
            <p>Target: Beat personal bests</p>
          </div>
        </div>
      </div>
      
      <div className="right-sidebar">
        <div className="profile-section" onClick={toggleDropdown} ref={dropdownRef}>
          <img
            src={`http://localhost:4000/${user.ProfilePhotoURL}`}
            alt="Profile"
            className="profile-photo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'default-image-url'; // Provide a default image URL here
            }}
          />
          <div className="profile-info">
            <h4>{user.FirstName} {user.LastName}</h4>
          </div>
          {dropdownVisible && (
            <div className="dropdown-menu">
              <button onClick={() => navigate('/myprofile')}><FontAwesomeIcon icon={faUser} /> My Profile</button>
              <button onClick={() => navigate('/workout')}><FontAwesomeIcon icon={faUserEdit} /> Edit Workout</button>
              <button onClick={() => navigate('/settings')}><FontAwesomeIcon icon={faCogs} /> Settings</button>
              <button onClick={() => navigate('/help')}><FontAwesomeIcon icon={faQuestionCircle} /> Help</button>
              <button onClick={handleSignOut}><FontAwesomeIcon icon={faSignOutAlt} /> Sign Out</button>
            </div>
          )}
        </div>
        <div className="navigation-section">
          <div className="nav-item">
            <FontAwesomeIcon icon={faBullseye} />
            <span>Goals</span>
            <FontAwesomeIcon icon={faArrowRight} className="arrow-icon" />
          </div>
          <div className="nav-item">
            <FontAwesomeIcon icon={faAppleAlt} />
            <span>Diet</span>
            <FontAwesomeIcon icon={faArrowRight} className="arrow-icon" />
          </div>
          <div className="nav-item">
            <FontAwesomeIcon icon={faCog} />
            <span>Settings</span>
            <FontAwesomeIcon icon={faArrowRight} className="arrow-icon" />
          </div>
        </div>
        <div className="goal-section">
          <h4>Weight loss Goal</h4>
          <p>Loss: 5kg / Month</p>
          <div className="goal-progress">
            <div className="progress-circle">
              <div className="circle-background">
                <div className="circle-progress"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
