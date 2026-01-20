/**
 * Pure utility functions for task hydration logic.
 * These are separated from React/Supabase for easy testing.
 */

import { isRoutineDue, formatDateLocal } from './interval-logic';

export interface RoutineTemplate {
    id: string;
    startDate: string;
    frequencyDays: number;
    exercises: ExerciseTemplate[];
}

export interface ExerciseTemplate {
    id: string;
    routineId: string;
    name: string;
    targetSets: number;
    targetReps: number;
    weight: number | null;
}

export interface DailyTaskInstance {
    id?: string;
    routineId: string;
    exerciseTemplateId: string;
    name: string;
    targetSets: number;
    targetReps: number;
    weight: number | null;
    taskDate: string;
    completed: boolean;
}

/**
 * Generates daily tasks from routine templates for a given date.
 * 
 * This is the core "auto-hydration" logic:
 * 1. Filter routines that are due on the given date
 * 2. For each due routine, generate task instances from exercises
 * 3. Exclude routines that already have tasks for this date
 * 
 * @param routines - All routine templates with their exercises
 * @param existingTasks - Tasks that already exist for the date
 * @param date - The date to generate tasks for
 * @returns Array of new daily tasks to be created
 */
export function generateDailyTasksPure(
    routines: RoutineTemplate[],
    existingTasks: DailyTaskInstance[],
    date: Date
): DailyTaskInstance[] {
    const dateStr = formatDateLocal(date);
    const newTasks: DailyTaskInstance[] = [];

    // Get set of routine IDs that already have tasks for this date
    const routinesWithExistingTasks = new Set(
        existingTasks
            .filter(t => t.taskDate === dateStr)
            .map(t => t.routineId)
    );

    for (const routine of routines) {
        // Check if routine is due today
        const isDue = isRoutineDue(routine.startDate, routine.frequencyDays, date);

        // Check if tasks already exist for this routine
        const hasExistingTasks = routinesWithExistingTasks.has(routine.id);

        // Only generate if due AND no existing tasks
        if (isDue && !hasExistingTasks && routine.exercises.length > 0) {
            // Generate a task for each exercise in the routine
            for (const exercise of routine.exercises) {
                newTasks.push({
                    routineId: routine.id,
                    exerciseTemplateId: exercise.id,
                    name: exercise.name,
                    targetSets: exercise.targetSets,
                    targetReps: exercise.targetReps,
                    weight: exercise.weight,
                    taskDate: dateStr,
                    completed: false,
                });
            }
        }
    }

    return newTasks;
}

/**
 * Checks if a routine is due for task generation
 */
export function isRoutineDueForTasks(
    routine: RoutineTemplate,
    date: Date
): boolean {
    return isRoutineDue(routine.startDate, routine.frequencyDays, date);
}

/**
 * Gets the count of exercises that would be generated for a routine
 */
export function getExpectedTaskCount(routine: RoutineTemplate): number {
    return routine.exercises.length;
}
