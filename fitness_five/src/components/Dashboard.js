import React, { useEffect, useState, useRef } from 'react';
import { useCards } from './CardContext';  // If in the same directory
import "../CSS/Dashboard.css";
import { useNavigate, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faDumbbell, faEnvelope, faQuestionCircle, faBullseye, faAppleAlt, faCog, faArrowRight, faUser, faSignOutAlt, faUserEdit, faCogs } from '@fortawesome/free-solid-svg-icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const data = [
  { month: 'Jan', weight: 154.32 },
  { month: 'Feb', weight: 152.12 },
  { month: 'Mar', weight: 151.02 },
  { month: 'Apr', weight: 147.71 },
  { month: 'May', weight: 146.61 },
  { month: 'Jun', weight: 144.40 },
  { month: 'Jul', weight: 141.09 },
  { month: 'Aug', weight: 139.94 },
  { month: 'Sep', weight: 137.67 },
  { month: 'Oct', weight: 134.48 },
  { month: 'Nov', weight: 133.37 },
  { month: 'Dec', weight: 132.28 },
];

/**
 * Dashboard component displaying user data, weight progress chart, and cards.
 * Fetches user data and provides functions to update, delete, and edit cards.
 *
 * @component
 * @returns {JSX.Element} The rendered Dashboard component.
 */
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Reference for the dropdown menu
  const { cards, updateCard, removeCard } = useCards();
  const [profileBgColor, setProfileBgColor] = useState('');

  useEffect(() => {
    /**
     * Fetch user data from the server.
     * Sets user state and profile background color.
     */
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

    // Set a random background color for profile holder
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F39C12', '#8E44AD'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setProfileBgColor(randomColor);
  }, [navigate]);

  useEffect(() => {
    /**
     * Handle clicks outside of the dropdown to close it.
     * @param {Object} event - The click event.
     */
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

  /**
   * Handle user sign-out by removing token and redirecting to home.
   */
  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  /**
   * Toggle the visibility of the dropdown menu.
   */
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  /**
   * Calculate exercise progress as a percentage.
   * @param {Array} exercises - The list of exercises.
   * @returns {number} The average progress of all exercises.
   */
  const calculateExerciseProgress = (exercises) => {
    const progress = exercises.reduce((acc, cur) => {
      const setsProgress = (cur.sets / cur.targetSets) * 100;
      const repsProgress = (cur.reps / cur.targetReps) * 100;
      return acc + (setsProgress + repsProgress) / 2;
    }, 0);
    return progress / exercises.length;
  };

  /**
   * Handle the deletion of a card.
   * @param {number} id - The ID of the card to delete.
   */
  const handleDelete = (id) => {
    removeCard(id);
  };

  /**
   * Handle the editing of a card.
   * @param {Object} card - The card to edit.
   */
  const handleEdit = (card) => {
    navigate('/workout', { state: { card } });
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
              <h3>Weight Progress</h3>
              <select className="timeframe-selector">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="chart-background">
              <div className="chart-border">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#ff6b6b" dot={{ r: 6 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="cards-container">
          {cards.map(card => (
            <div key={card.id} className="card">
              <div className="card-actions">
                <button onClick={() => handleEdit(card)} className="edit-button">Update</button>
                <button onClick={() => handleDelete(card.id)} className="delete-button">Remove</button>
              </div>
              <h3>{card.title}</h3>
              {card.exercises.map((ex, idx) => (
                <p key={idx}>{ex.name} - {ex.sets}/{ex.targetSets} Sets, {ex.reps}/{ex.targetReps} Reps</p>
              ))}
              <div className="progress-bar">
                <span style={{ width: `${calculateExerciseProgress(card.exercises)}%` }}></span>
              </div>
              <p>Progress: {calculateExerciseProgress(card.exercises).toFixed(2)}%</p>
            </div>
          ))}
        </div>
        <div className="right-sidebar">
          <div className="profile-section" onClick={toggleDropdown} ref={dropdownRef}>
            <div className="profile-photo" style={{ backgroundColor: profileBgColor }}>
              {user.ProfilePhotoURL ? (
                <img
                  src={`http://localhost:4000/${user.ProfilePhotoURL}`}
                  alt="Profile"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/100?text=Profile';
                  }}
                />
              ) : (
                <span>{getInitials(user.FirstName, user.LastName)}</span>
              )}
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
