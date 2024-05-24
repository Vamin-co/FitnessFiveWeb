import React from 'react';
import "../CSS/Dashboard.css";
import VandanPhoto from "../Images/Vandan_Profile.jpeg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faDumbbell, faEnvelope, faQuestionCircle, faBullseye, faAppleAlt, faCog, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Importing Recharts components

const data = [
  { day: 'Sun', steps: 4000 },
  { day: 'Mon', steps: 3000 },
  { day: 'Tue', steps: 5000 },
  { day: 'Wed', steps: 9245 },
  { day: 'Thu', steps: 4800 },
  { day: 'Fri', steps: 6200 },
  { day: 'Sat', steps: 7300 },
];

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-icon top-icon">
          <img src={VandanPhoto} alt="Profile" className="profile-photo" />
        </div>
        <div className="sidebar-icon middle-icon">
          <FontAwesomeIcon icon={faHome} />
        </div>
        <div className="sidebar-icon">
          <FontAwesomeIcon icon={faDumbbell} />
        </div>
        <div className="sidebar-icon">
          <FontAwesomeIcon icon={faEnvelope} />
        </div>
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
            <h3>Cycling Hero</h3>
            <p>10 km / week</p>
            <div className="progress-bar">
              <span style={{ width: '55%' }}></span>
            </div>
            <p>Progress: 55%</p>
            <p>Target: 50km</p>
          </div>
          <div className="card">
            <h3>Daily Running</h3>
            <p>5 km / week</p>
            <div className="progress-bar">
              <span style={{ width: '75%' }}></span>
            </div>
            <p>Progress: 75%</p>
            <p>Target: 7km / week</p>
          </div>
          <div className="card">
            <h3>Daily Steps</h3>
            <p>10000 steps / week</p>
            <div className="progress-bar">
              <span style={{ width: '95%' }}></span>
            </div>
            <p>Progress: 95%</p>
            <p>Target: 12000 / week</p>
          </div>
        </div>
      </div>
      
      <div className="right-sidebar">
        <div className="profile-section">
          <img src={VandanPhoto} alt="Profile" className="profile-photo" />
          <div className="profile-info">
            <h4>Vandin Amin</h4>
            <p>Joined 4 months ago</p>
          </div>
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
