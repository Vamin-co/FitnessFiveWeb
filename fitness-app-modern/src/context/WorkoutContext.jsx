import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WorkoutContext = createContext(null);

// Sample workout templates
const SAMPLE_WORKOUTS = [
    {
        id: 1,
        title: 'Morning Power Routine',
        description: 'High-intensity morning workout to kickstart your day',
        createdAt: '2024-01-10',
        exercises: [
            { id: 1, name: 'Push-ups', sets: 3, targetSets: 4, reps: 12, targetReps: 15 },
            { id: 2, name: 'Squats', sets: 4, targetSets: 4, reps: 15, targetReps: 15 },
            { id: 3, name: 'Plank', sets: 3, targetSets: 3, reps: 60, targetReps: 60 },
        ],
        completed: false
    },
    {
        id: 2,
        title: 'Upper Body Blast',
        description: 'Focus on chest, shoulders, and arms',
        createdAt: '2024-01-12',
        exercises: [
            { id: 4, name: 'Bench Press', sets: 4, targetSets: 4, reps: 10, targetReps: 12 },
            { id: 5, name: 'Shoulder Press', sets: 3, targetSets: 4, reps: 10, targetReps: 12 },
            { id: 6, name: 'Bicep Curls', sets: 3, targetSets: 3, reps: 12, targetReps: 15 },
            { id: 7, name: 'Tricep Dips', sets: 3, targetSets: 3, reps: 10, targetReps: 12 },
        ],
        completed: true
    },
    {
        id: 3,
        title: 'Core Crusher',
        description: 'Strengthen your core with targeted exercises',
        createdAt: '2024-01-14',
        exercises: [
            { id: 8, name: 'Crunches', sets: 3, targetSets: 4, reps: 20, targetReps: 25 },
            { id: 9, name: 'Russian Twists', sets: 3, targetSets: 3, reps: 30, targetReps: 30 },
            { id: 10, name: 'Leg Raises', sets: 3, targetSets: 3, reps: 15, targetReps: 15 },
            { id: 11, name: 'Mountain Climbers', sets: 2, targetSets: 3, reps: 20, targetReps: 30 },
        ],
        completed: false
    }
];

// Sample weight progress data
const SAMPLE_WEIGHT_DATA = [
    { date: '2024-01-01', weight: 175 },
    { date: '2024-01-08', weight: 173 },
    { date: '2024-01-15', weight: 171 },
    { date: '2024-01-22', weight: 170 },
    { date: '2024-01-29', weight: 168 },
    { date: '2024-02-05', weight: 167 },
    { date: '2024-02-12', weight: 166 },
    { date: '2024-02-19', weight: 165 },
    { date: '2024-02-26', weight: 164 },
    { date: '2024-03-04', weight: 163 },
    { date: '2024-03-11', weight: 162 },
    { date: '2024-03-18', weight: 161 },
];

// Sample activity data for the week
const SAMPLE_ACTIVITY = [
    { day: 'Mon', calories: 420, minutes: 45 },
    { day: 'Tue', calories: 380, minutes: 40 },
    { day: 'Wed', calories: 520, minutes: 55 },
    { day: 'Thu', calories: 0, minutes: 0 },
    { day: 'Fri', calories: 450, minutes: 50 },
    { day: 'Sat', calories: 600, minutes: 65 },
    { day: 'Sun', calories: 280, minutes: 30 },
];

export function WorkoutProvider({ children }) {
    const { user } = useAuth();
    const [workouts, setWorkouts] = useState([]);
    const [weightData, setWeightData] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadUserData(user.id);
        } else {
            setWorkouts([]);
            setWeightData([]);
            setActivityData([]);
        }
        setIsLoading(false);
    }, [user]);

    const loadUserData = (userId) => {
        const storedWorkouts = localStorage.getItem(`fitness_workouts_${userId}`);
        const storedWeightData = localStorage.getItem(`fitness_weight_${userId}`);
        const storedActivity = localStorage.getItem(`fitness_activity_${userId}`);

        if (storedWorkouts) {
            setWorkouts(JSON.parse(storedWorkouts));
        } else {
            // Initialize with sample data for new users
            setWorkouts(SAMPLE_WORKOUTS);
            localStorage.setItem(`fitness_workouts_${userId}`, JSON.stringify(SAMPLE_WORKOUTS));
        }

        if (storedWeightData) {
            setWeightData(JSON.parse(storedWeightData));
        } else {
            setWeightData(SAMPLE_WEIGHT_DATA);
            localStorage.setItem(`fitness_weight_${userId}`, JSON.stringify(SAMPLE_WEIGHT_DATA));
        }

        if (storedActivity) {
            setActivityData(JSON.parse(storedActivity));
        } else {
            setActivityData(SAMPLE_ACTIVITY);
            localStorage.setItem(`fitness_activity_${userId}`, JSON.stringify(SAMPLE_ACTIVITY));
        }
    };

    const saveWorkouts = (newWorkouts) => {
        if (user) {
            localStorage.setItem(`fitness_workouts_${user.id}`, JSON.stringify(newWorkouts));
        }
        setWorkouts(newWorkouts);
    };

    const addWorkout = (workout) => {
        const newWorkout = {
            id: Date.now(),
            ...workout,
            createdAt: new Date().toISOString().split('T')[0],
            completed: false
        };
        const updatedWorkouts = [...workouts, newWorkout];
        saveWorkouts(updatedWorkouts);
        return newWorkout;
    };

    const updateWorkout = (id, updates) => {
        const updatedWorkouts = workouts.map(w =>
            w.id === id ? { ...w, ...updates } : w
        );
        saveWorkouts(updatedWorkouts);
    };

    const deleteWorkout = (id) => {
        const updatedWorkouts = workouts.filter(w => w.id !== id);
        saveWorkouts(updatedWorkouts);
    };

    const updateExerciseProgress = (workoutId, exerciseId, updates) => {
        const updatedWorkouts = workouts.map(w => {
            if (w.id === workoutId) {
                return {
                    ...w,
                    exercises: w.exercises.map(e =>
                        e.id === exerciseId ? { ...e, ...updates } : e
                    )
                };
            }
            return w;
        });
        saveWorkouts(updatedWorkouts);
    };

    const addWeightEntry = (weight) => {
        const newEntry = {
            date: new Date().toISOString().split('T')[0],
            weight: parseFloat(weight)
        };
        const updatedData = [...weightData, newEntry];
        setWeightData(updatedData);
        if (user) {
            localStorage.setItem(`fitness_weight_${user.id}`, JSON.stringify(updatedData));
        }
    };

    const calculateWorkoutProgress = (workout) => {
        if (!workout.exercises || workout.exercises.length === 0) return 0;

        const progress = workout.exercises.reduce((acc, ex) => {
            const setsProgress = (ex.sets / ex.targetSets) * 100;
            const repsProgress = (ex.reps / ex.targetReps) * 100;
            return acc + (setsProgress + repsProgress) / 2;
        }, 0);

        return Math.min(100, progress / workout.exercises.length);
    };

    const getStats = () => {
        const completedWorkouts = workouts.filter(w => w.completed).length;
        const totalExercises = workouts.reduce((acc, w) => acc + (w.exercises?.length || 0), 0);
        const totalCaloriesThisWeek = activityData.reduce((acc, d) => acc + d.calories, 0);
        const totalMinutesThisWeek = activityData.reduce((acc, d) => acc + d.minutes, 0);

        const latestWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : null;
        const startWeight = weightData.length > 0 ? weightData[0].weight : null;
        const weightChange = latestWeight && startWeight ? startWeight - latestWeight : 0;

        return {
            totalWorkouts: workouts.length,
            completedWorkouts,
            totalExercises,
            totalCaloriesThisWeek,
            totalMinutesThisWeek,
            currentWeight: latestWeight,
            weightChange,
            streak: user?.streak || 0
        };
    };

    const value = {
        workouts,
        weightData,
        activityData,
        isLoading,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        updateExerciseProgress,
        addWeightEntry,
        calculateWorkoutProgress,
        getStats
    };

    return (
        <WorkoutContext.Provider value={value}>
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkouts() {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkouts must be used within a WorkoutProvider');
    }
    return context;
}
