import React from 'react';
import "../CSS/Dashboard.css";
import VandanPhoto from "../Images/Vandan_Profile.jpeg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faDumbbell, faEnvelope, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
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
      </div>
    </div>
  );
};

export default Dashboard;
