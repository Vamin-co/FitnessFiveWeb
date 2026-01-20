import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useWorkouts } from '../context/WorkoutContext';
import {
    ArrowLeft, Plus, Trash2, Save, Check,
    Dumbbell, Target, Clock
} from 'lucide-react';
import './Workout.css';

export default function Workout() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { workouts, addWorkout, updateWorkout, updateExerciseProgress } = useWorkouts();

    const [workout, setWorkout] = useState({
        title: '',
        description: '',
        exercises: [{ id: Date.now(), name: '', sets: 0, targetSets: 3, reps: 0, targetReps: 12 }]
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id) {
            const existingWorkout = workouts.find(w => w.id === parseInt(id));
            if (existingWorkout) {
                setWorkout(existingWorkout);
                setIsEditing(true);
            }
        }
    }, [id, workouts]);

    const handleExerciseChange = (index, field, value) => {
        const updatedExercises = [...workout.exercises];
        updatedExercises[index] = {
            ...updatedExercises[index],
            [field]: field === 'name' ? value : parseInt(value) || 0
        };
        setWorkout({ ...workout, exercises: updatedExercises });
    };

    const addExercise = () => {
        setWorkout({
            ...workout,
            exercises: [
                ...workout.exercises,
                { id: Date.now(), name: '', sets: 0, targetSets: 3, reps: 0, targetReps: 12 }
            ]
        });
    };

    const removeExercise = (index) => {
        if (workout.exercises.length > 1) {
            const updatedExercises = workout.exercises.filter((_, i) => i !== index);
            setWorkout({ ...workout, exercises: updatedExercises });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!workout.title.trim()) {
            alert('Please enter a workout title');
            return;
        }

        if (workout.exercises.some(ex => !ex.name.trim())) {
            alert('Please name all exercises');
            return;
        }

        if (isEditing) {
            updateWorkout(workout.id, workout);
        } else {
            addWorkout(workout);
        }

        navigate('/dashboard');
    };

    const incrementProgress = (exerciseId, field) => {
        const exercise = workout.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        const maxValue = field === 'sets' ? exercise.targetSets : exercise.targetReps;
        const currentValue = exercise[field];

        if (currentValue < maxValue) {
            if (isEditing) {
                updateExerciseProgress(workout.id, exerciseId, { [field]: currentValue + 1 });
                setWorkout({
                    ...workout,
                    exercises: workout.exercises.map(e =>
                        e.id === exerciseId ? { ...e, [field]: currentValue + 1 } : e
                    )
                });
            } else {
                handleExerciseChange(
                    workout.exercises.findIndex(e => e.id === exerciseId),
                    field,
                    currentValue + 1
                );
            }
        }
    };

    const calculateProgress = (exercise) => {
        const setsProgress = (exercise.sets / exercise.targetSets) * 100;
        const repsProgress = (exercise.reps / exercise.targetReps) * 100;
        return Math.min(100, (setsProgress + repsProgress) / 2);
    };

    return (
        <div className="workout-page">
            <div className="workout-background">
                <div className="gradient-orb orb-workout-1" />
                <div className="gradient-orb orb-workout-2" />
            </div>

            <header className="workout-header">
                <Link to="/dashboard" className="back-button">
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </Link>
            </header>

            <main className="workout-main">
                <form onSubmit={handleSubmit} className="workout-form">
                    <div className="form-header">
                        <div className="form-icon gradient-primary">
                            <Dumbbell size={32} />
                        </div>
                        <h1>{isEditing ? 'Edit Workout' : 'Create New Workout'}</h1>
                        <p>Build your perfect training session</p>
                    </div>

                    <div className="form-section glass">
                        <h2>Workout Details</h2>

                        <div className="form-group">
                            <label htmlFor="title">Workout Name</label>
                            <input
                                id="title"
                                type="text"
                                placeholder="e.g., Morning Power Routine"
                                value={workout.title}
                                onChange={(e) => setWorkout({ ...workout, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description (Optional)</label>
                            <textarea
                                id="description"
                                placeholder="Describe your workout..."
                                value={workout.description}
                                onChange={(e) => setWorkout({ ...workout, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="form-section glass">
                        <div className="section-header">
                            <h2>Exercises</h2>
                            <button type="button" className="btn btn-outline btn-sm" onClick={addExercise}>
                                <Plus size={16} />
                                Add Exercise
                            </button>
                        </div>

                        <div className="exercises-list">
                            {workout.exercises.map((exercise, index) => (
                                <div key={exercise.id} className="exercise-card">
                                    <div className="exercise-header">
                                        <span className="exercise-number">{index + 1}</span>
                                        <input
                                            type="text"
                                            placeholder="Exercise name"
                                            value={exercise.name}
                                            onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                                            className="exercise-name-input"
                                        />
                                        {workout.exercises.length > 1 && (
                                            <button
                                                type="button"
                                                className="remove-exercise"
                                                onClick={() => removeExercise(index)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="exercise-stats">
                                        <div className="stat-group">
                                            <label>Sets</label>
                                            <div className="stat-controls">
                                                <button
                                                    type="button"
                                                    className={`progress-btn ${exercise.sets >= exercise.targetSets ? 'complete' : ''}`}
                                                    onClick={() => incrementProgress(exercise.id, 'sets')}
                                                >
                                                    {exercise.sets >= exercise.targetSets ? <Check size={16} /> : <Plus size={16} />}
                                                </button>
                                                <span className="stat-value">{exercise.sets}/{exercise.targetSets}</span>
                                                <input
                                                    type="number"
                                                    value={exercise.targetSets}
                                                    onChange={(e) => handleExerciseChange(index, 'targetSets', e.target.value)}
                                                    min="1"
                                                    className="target-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="stat-group">
                                            <label>Reps</label>
                                            <div className="stat-controls">
                                                <button
                                                    type="button"
                                                    className={`progress-btn ${exercise.reps >= exercise.targetReps ? 'complete' : ''}`}
                                                    onClick={() => incrementProgress(exercise.id, 'reps')}
                                                >
                                                    {exercise.reps >= exercise.targetReps ? <Check size={16} /> : <Plus size={16} />}
                                                </button>
                                                <span className="stat-value">{exercise.reps}/{exercise.targetReps}</span>
                                                <input
                                                    type="number"
                                                    value={exercise.targetReps}
                                                    onChange={(e) => handleExerciseChange(index, 'targetReps', e.target.value)}
                                                    min="1"
                                                    className="target-input"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="exercise-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${calculateProgress(exercise)}%` }}
                                            />
                                        </div>
                                        <span className="progress-percent">{Math.round(calculateProgress(exercise))}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={18} />
                            {isEditing ? 'Save Changes' : 'Create Workout'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
