import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from "../CSS/Workout.module.css";
import axios from 'axios';

const Workout = ({ onWorkoutUpdate }) => {
  const [workout, setWorkout] = useState({
    plan: '',
    completed: 0,
    calories: 0,
    squat: 0,
  });

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/Login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorkout({
      ...workout,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onWorkoutUpdate(workout);
  };

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
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div>
      <header className={styles.header}>
        <Link to="/" className={styles.siteTitle}>
          <h1>FitnessFive</h1>
        </Link>
        <nav>
          <ul className={styles.navLinks}>
            <li>
              <a href="#">About</a>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
            {user ? (
              <Link to="/dashboard">
                <img
                  src={`http://localhost:4000/${user.ProfilePhotoURL}`}
                  alt="Profile"
                  className={styles.profilePhotoHeader}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'default-image-url'; // Provide a default image URL here
                  }}
                />
              </Link>
            ) : (
              <button onClick={handleLogin} className={styles.button}>Log in</button>
            )}
          </ul>
        </nav>
      </header>

      <div className={styles.workoutContainer}>
        <h2>Edit Your Workout</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Workout Plan</label>
            <input type="text" name="plan" value={workout.plan} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label>Workouts Completed</label>
            <input type="number" name="completed" value={workout.completed} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label>Calories Consumed</label>
            <input type="number" name="calories" value={workout.calories} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label>Squat (kg)</label>
            <input type="number" name="squat" value={workout.squat} onChange={handleChange} />
          </div>
          <button type="submit" className={styles.button}>Update Workout</button>
        </form>
      </div>
    </div>
  );
};

export default Workout;
