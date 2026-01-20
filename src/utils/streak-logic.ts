/**
 * Pure utility functions for streak calculation logic.
 * These are separated from React/Supabase for easy testing.
 */

import { isRoutineDue, normalizeToMidnight, parseLocalDate } from './interval-logic';

export interface RoutineSchedule {
    id: string;
    startDate: string;
    frequencyDays: number;
}

export interface CompletionRecord {
    routineId: string;
    completedDate: string; // ISO date string (YYYY-MM-DD)
}

/**
 * Formats a date to YYYY-MM-DD string
 * Uses local time to match how dates are typically displayed to users
 */
export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Determines if a specific day was a scheduled workout day for any routine
 */
export function isDayScheduled(
    date: Date,
    routines: RoutineSchedule[]
): boolean {
    return routines.some(routine =>
        isRoutineDue(routine.startDate, routine.frequencyDays, date)
    );
}

/**
 * Determines if a specific day was completed (at least one completion for a scheduled routine)
 */
export function isDayCompleted(
    date: Date,
    routines: RoutineSchedule[],
    completions: CompletionRecord[]
): boolean {
    const dateStr = formatDate(date);
    const dayCompletions = completions.filter(c => c.completedDate === dateStr);

    // Check if any scheduled routine was completed on this day
    return routines.some(routine => {
        const isScheduled = isRoutineDue(routine.startDate, routine.frequencyDays, date);
        const wasCompleted = dayCompletions.some(c => c.routineId === routine.id);
        return isScheduled && wasCompleted;
    });
}

/**
 * Determines the status of a day for streak purposes
 * 
 * @returns 'completed' | 'missed' | 'rest'
 */
export function getDayStatus(
    date: Date,
    routines: RoutineSchedule[],
    completions: CompletionRecord[]
): 'completed' | 'missed' | 'rest' {
    const isScheduled = isDayScheduled(date, routines);

    if (!isScheduled) {
        return 'rest';
    }

    // Check if all scheduled routines for this day were completed
    const dateStr = formatDate(date);
    const dayCompletions = new Set(
        completions
            .filter(c => c.completedDate === dateStr)
            .map(c => c.routineId)
    );

    const allScheduledCompleted = routines.every(routine => {
        const wasScheduled = isRoutineDue(routine.startDate, routine.frequencyDays, date);
        if (!wasScheduled) return true; // Not scheduled, so doesn't count
        return dayCompletions.has(routine.id);
    });

    return allScheduledCompleted ? 'completed' : 'missed';
}

/**
 * Calculate the current streak based on completion history.
 * 
 * Rules:
 * 1. Streak increments for each consecutive day with all scheduled routines completed
 * 2. Rest days (no routines scheduled) do NOT break the streak
 * 3. Missed days (routine scheduled but not completed) BREAK the streak
 * 4. Streak resets to 0 (or current day count) on a missed day
 * 
 * @param routines - All active routines with their schedules
 * @param completions - All completion records
 * @param today - The current date (for testing, defaults to now)
 * @returns The current streak count
 */
export function calculateStreakPure(
    routines: RoutineSchedule[],
    completions: CompletionRecord[],
    today: Date = new Date()
): number {
    if (routines.length === 0) {
        return 0;
    }

    let streak = 0;
    const checkDate = normalizeToMidnight(new Date(today));

    // Get earliest routine start for stopping condition
    const earliestStart = normalizeToMidnight(
        new Date(Math.min(...routines.map(r => parseLocalDate(r.startDate).getTime())))
    );

    // Start from today and work backwards
    const currentDate = new Date(checkDate);
    let maxIterations = 365; // Safety limit

    while (maxIterations > 0) {
        maxIterations--;

        // Check if we're before the earliest start date
        if (currentDate.getTime() < earliestStart.getTime()) {
            break;
        }

        const status = getDayStatus(currentDate, routines, completions);

        if (status === 'missed') {
            // Streak broken - return what we have
            break;
        }

        if (status === 'completed') {
            // Increment streak
            streak++;
        }
        // If 'rest', streak stays the same (rest days don't affect streak)

        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
}

// Re-export parseLocalDate for use in tests
export { parseLocalDate } from './interval-logic';
