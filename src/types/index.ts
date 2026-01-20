// Core Data Types (matching Supabase schema)

export interface Profile {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    weight: number | null;
    height: number | null;
    age: number | null;
    goals: string[];
    avatarUrl: string | null;
    streak: number;
    createdAt: string;
    updatedAt: string;
}

// Gamification Types
export interface Routine {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    frequencyDays: number; // Every N days
    startDate: string; // ISO date string
    isActive: boolean;
    createdAt: string;
    workoutId: string | null; // Link to existing workout
    workout?: Workout | null; // The linked workout with exercises
    exercises?: RoutineExercise[]; // Legacy: Template exercises (deprecated)
}

// Exercise Template (stored in routine_exercises)
export interface RoutineExercise {
    id: string;
    routineId: string;
    name: string;
    targetSets: number;
    targetReps: number;
    weight: number | null;
    orderIndex: number;
}

// Daily Task Instance (auto-generated from template)
export interface DailyTask {
    id: string;
    userId: string;
    routineId: string;
    exerciseTemplateId: string | null;
    name: string;
    targetSets: number | null;
    targetReps: number | null;
    weight: number | null;
    completed: boolean;
    taskDate: string;
    routineName?: string; // For display
}

export interface RoutineCompletion {
    id: string;
    routineId: string;
    userId: string;
    completedDate: string;
    notes: string | null;
    durationMinutes: number | null;
    createdAt: string;
}

// Today's routines with their tasks
export interface TodaysRoutine {
    routine: Routine;
    tasks: DailyTask[];
    allCompleted: boolean;
}

export interface HeatmapDay {
    date: string;
    status: 'completed' | 'missed' | 'rest' | 'future';
    count: number;
}

export interface PlayerStats {
    consistency: number; // 0-100, streak percentage
    volume: number; // 0-100, total weight lifted normalized
    frequency: number; // 0-100, workouts per week normalized
    experience: number; // 0-100, days active normalized
}

// Legacy Workout Types (keeping for backward compatibility)
export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    targetSets: number;
    targetReps: number;
    weight?: number;
    orderIndex: number;
}

export interface Workout {
    id: string;
    title: string;
    description?: string | null;
    exercises: Exercise[];
    completed: boolean;
    createdAt: Date | string;
    completedAt?: string | null;
    duration?: number | null;
    caloriesBurned?: number | null;
}

export interface WeightEntry {
    date: string;
    weight: number;
}

export interface ActivityDay {
    date: string;
    calories: number;
    minutes: number;
    workoutsCompleted: number;
}

export interface LeaderboardEntry {
    userId: string;
    name: string;
    avatar?: string | null;
    score: number;
    streak: number;
    rank: number;
    totalCompletions?: number;
    isCurrentUser?: boolean;
}

// Dashboard Stats
export interface DashboardStats {
    currentWeight: number;
    weightChange: number;
    streak: number;
    workoutsThisWeek: number;
    totalMinutesThisWeek: number;
    caloriesBurnedThisWeek: number;
}

// Legacy User type for backward compatibility
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    weight: number;
    height: number;
    age: number;
    profilePhotoUrl?: string;
    goals: string[];
    createdAt: Date;
}
