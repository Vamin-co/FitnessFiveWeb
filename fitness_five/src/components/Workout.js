import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from "../CSS/Workout.module.css";
import axios from 'axios';
import { useCards } from "../components/CardContext";
import { useLocation } from 'react-router-dom';

/**
 * Workout component for creating and editing workouts.
 * Provides a form for users to add exercises and manage their workouts.
 *
 * @component
 * @returns {JSX.Element} The rendered Workout component.
 */
const Workout = () => {
  const [workout, setWorkout] = useState({
    id: null,  // To track if we are editing an existing workout
    title: '',
    exercises: [],
  });

  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { cards, addCard, updateCard, removeCard } = useCards();
  const location = useLocation();

  useEffect(() => {
    // Check if state exists and contains a card object
    if (location.state && location.state.card) {
      setWorkout({
        id: location.state.card.id,
        title: location.state.card.title,
        exercises: location.state.card.exercises
      });
    }
  }, [location]);

  /**
   * Handle input change for exercise details.
   * @param {number} index - The index of the exercise in the exercises array.
   * @param {string} field - The field to update (name, sets, reps, targetSets, targetReps).
   * @param {string|number} value - The new value for the field.
   */
  const handleExerciseChange = (index, field, value) => {
    let newExercises = [...workout.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setWorkout({ ...workout, exercises: newExercises });
  };

  /**
   * Add a new exercise to the workout.
   */
  const addExercise = () => {
    setWorkout({
      ...workout,
      exercises: [...workout.exercises, { name: '', sets: 0, reps: 0, targetSets: 0, targetReps: 0 }]
    });
  };

  /**
   * Handle login navigation.
   */
  const handleLogin = () => {
    navigate('/Login');
  };

  /**
   * Handle form submission for adding or updating a workout.
   * @param {Object} e - The form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (workout.id) {
      // Update existing workout
      updateCard(workout.id, workout);
    } else {
      // Add a new workout
      addCard({ ...workout, id: Date.now() });
    }
    // Reset form or navigate away
    setWorkout({ id: null, title: '', exercises: [] });
  };

  /**
   * Handle user data fetch on component mount.
   */
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
        <Link to="/" className={styles.siteTitle}><h1>FitnessFive</h1></Link>
        <nav>
          <ul className={styles.navLinks}>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact Us</a></li>
            {user ? (
              <Link to="/dashboard">
                <img src={`http://localhost:4000/${user.ProfilePhotoURL}`} alt="Profile" className={styles.profilePhotoHeader} onError={(e) => { e.target.onerror = null; e.target.src = 'default-image-url'; }} />
              </Link>
            ) : (
              <button onClick={handleLogin} className={styles.button}>Log in</button>
            )}
          </ul>
        </nav>
      </header>
      <div className={styles.workoutContainer}>
        <h2>{workout.id ? 'Edit Your Workout' : 'Create Your Workout'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Workout Title</label>
            <input type="text" placeholder="Title" value={workout.title} onChange={(e) => setWorkout({ ...workout, title: e.target.value })} />
          </div>
          {workout.exercises.map((exercise, index) => (
            <div key={index} className={styles.formGroup}>
              <input type="text" placeholder="Exercise Name" value={exercise.name} onChange={(e) => handleExerciseChange(index, 'name', e.target.value)} />
              <input type="number" placeholder="Target Sets" value={exercise.targetSets} onChange={(e) => handleExerciseChange(index, 'targetSets', e.target.value)} />
              <input type="number" placeholder="Target Reps" value={exercise.targetReps} onChange={(e) => handleExerciseChange(index, 'targetReps', e.target.value)} />
              <input type="number" placeholder="Completed Sets" value={exercise.sets} onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)} />
              <input type="number" placeholder="Completed Reps" value={exercise.reps} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={addExercise} className={styles.button}>Add Exercise</button>
          <button type="submit" className={styles.button}>{workout.id ? 'Update Workout' : 'Add Workout'}</button>
          {workout.id && <button type="button" onClick={() => setWorkout({ id: null, title: '', exercises: [] })} className={styles.button}>Cancel Edit</button>}
        </form>
      </div>
    </div>
  );
};

export default Workout;
