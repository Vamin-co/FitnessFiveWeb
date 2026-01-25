/**
 * @fileoverview TypeScript Type Definitions for FitnessFive
 * 
 * This module contains all TypeScript interfaces and types used throughout
 * the application. Types are organized by feature area and match the
 * Supabase database schema with camelCase property names.
 * 
 * @module types
 */

// ============================================
// CORE USER TYPES
// ============================================

/**
 * User profile data extending Supabase auth.users.
 * Created automatically via database trigger on signup.
 */
export interface Profile {
    /** UUID matching auth.users.id */
    id: string;
    /** Unique username, set during onboarding */
    username: string | null;
    /** User's first name */
    firstName: string | null;
    /** User's last name */
    lastName: string | null;
    /** Current weight in pounds */
    weight: number | null;
    /** Height in inches */
    height: number | null;
    /** Age in years */
    age: number | null;
    /** Array of fitness goal strings */
    goals: string[];
    /** URL to avatar image */
    avatarUrl: string | null;
    /** Current workout streak count */
    streak: number;
    /** Daily water intake target in ounces */
    waterTargetOz: number | null;
    /** Account creation timestamp */
    createdAt: string;
    /** Last profile update timestamp */
    updatedAt: string;
}

// ============================================
// GAMIFICATION TYPES
// ============================================

/**
 * Recurring workout routine with scheduling configuration.
 * Routines generate daily tasks based on their frequency.
 */
export interface Routine {
    /** UUID of the routine */
    id: string;
    /** User who owns this routine */
    userId: string;
    /** Display name of the routine */
    name: string;
    /** Optional description */
    description: string | null;
    /** Repeat every N days (1 = daily, 7 = weekly) */
    frequencyDays: number;
    /** Start date for scheduling (ISO date string) */
    startDate: string;
    /** Whether routine is currently active */
    isActive: boolean;
    /** When routine was created */
    createdAt: string;
    /** Optional link to a workout template */
    workoutId: string | null;
    /** The linked workout with its exercises (populated on fetch) */
    workout?: Workout | null;
    /** @deprecated Legacy template exercises - use workout.exercises instead */
    exercises?: RoutineExercise[];
}

/**
 * Exercise template stored in a routine.
 * @deprecated Use workout exercises via routine.workout instead
 */
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
