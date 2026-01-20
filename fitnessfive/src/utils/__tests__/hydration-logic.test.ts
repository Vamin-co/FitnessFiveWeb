import { describe, it, expect } from 'vitest';
import {
    generateDailyTasksPure,
    isRoutineDueForTasks,
    getExpectedTaskCount,
    type RoutineTemplate,
    type DailyTaskInstance,
    type ExerciseTemplate
} from '../hydration-logic';
import { parseLocalDate } from '../interval-logic';

describe('Hydration Logic (Task Generation)', () => {

    // Helper to create a local date (avoids timezone issues)
    const localDate = (dateStr: string): Date => parseLocalDate(dateStr);

    // Helpers to create test data
    const createExercise = (
        id: string,
        routineId: string,
        name: string,
        sets = 3,
        reps = 10
    ): ExerciseTemplate => ({
        id,
        routineId,
        name,
        targetSets: sets,
        targetReps: reps,
        weight: null,
    });

    const createRoutine = (
        id: string,
        startDate: string,
        frequencyDays: number,
        exercises: ExerciseTemplate[]
    ): RoutineTemplate => ({
        id,
        startDate,
        frequencyDays,
        exercises,
    });

    describe('generateDailyTasksPure', () => {

        it('generates tasks from routine exercises when routine is due', () => {
            const exercises = [
                createExercise('e1', 'r1', 'Bench Press', 3, 10),
                createExercise('e2', 'r1', 'Rows', 3, 12),
                createExercise('e3', 'r1', 'Shoulder Press', 3, 8),
            ];

            const routines = [
                createRoutine('r1', '2026-01-01', 1, exercises),
            ];

            const existingTasks: DailyTaskInstance[] = [];
            const date = localDate('2026-01-18');

            const newTasks = generateDailyTasksPure(routines, existingTasks, date);

            expect(newTasks).toHaveLength(3);
            expect(newTasks[0].name).toBe('Bench Press');
            expect(newTasks[1].name).toBe('Rows');
            expect(newTasks[2].name).toBe('Shoulder Press');
        });

        it('inherits sets, reps, and weight from template', () => {
            const exercises = [
                { ...createExercise('e1', 'r1', 'Deadlift', 5, 5), weight: 225 },
            ];

            const routines = [createRoutine('r1', '2026-01-01', 1, exercises)];
            const date = localDate('2026-01-18');

            const newTasks = generateDailyTasksPure(routines, [], date);

            expect(newTasks[0]).toMatchObject({
                name: 'Deadlift',
                targetSets: 5,
                targetReps: 5,
                weight: 225,
                taskDate: '2026-01-18',
                completed: false,
            });
        });

        it('does NOT generate duplicates if tasks already exist for the day', () => {
            const exercises = [
                createExercise('e1', 'r1', 'Bench Press'),
                createExercise('e2', 'r1', 'Rows'),
            ];

            const routines = [createRoutine('r1', '2026-01-01', 1, exercises)];

            // Tasks already exist for this routine today
            const existingTasks: DailyTaskInstance[] = [
                {
                    id: 'existing1',
                    routineId: 'r1',
                    exerciseTemplateId: 'e1',
                    name: 'Bench Press',
                    targetSets: 3,
                    targetReps: 10,
                    weight: null,
                    taskDate: '2026-01-18',
                    completed: true,
                },
            ];

            const date = localDate('2026-01-18');
            const newTasks = generateDailyTasksPure(routines, existingTasks, date);

            // Should not generate any new tasks since routine already has tasks
            expect(newTasks).toHaveLength(0);
        });

        it('generates tasks only for routines that are due today', () => {
            const exercises1 = [createExercise('e1', 'r1', 'Push-ups')];
            const exercises2 = [createExercise('e2', 'r2', 'Pull-ups')];

            const routines = [
                createRoutine('r1', '2026-01-01', 1, exercises1), // Daily - due
                createRoutine('r2', '2026-01-01', 100, exercises2), // Every 100 days - not due
            ];

            const date = localDate('2026-01-18');
            const newTasks = generateDailyTasksPure(routines, [], date);

            expect(newTasks).toHaveLength(1);
            expect(newTasks[0].name).toBe('Push-ups');
        });

        it('does NOT generate tasks if routine has no exercises', () => {
            const routines = [
                createRoutine('r1', '2026-01-01', 1, []), // No exercises
            ];

            const date = localDate('2026-01-18');
            const newTasks = generateDailyTasksPure(routines, [], date);

            expect(newTasks).toHaveLength(0);
        });

        it('generates tasks for multiple routines due on same day', () => {
            const upperExercises = [
                createExercise('e1', 'r1', 'Bench Press'),
                createExercise('e2', 'r1', 'Rows'),
            ];

            const lowerExercises = [
                createExercise('e3', 'r2', 'Squats'),
                createExercise('e4', 'r2', 'Lunges'),
            ];

            const routines = [
                createRoutine('r1', '2026-01-01', 1, upperExercises),
                createRoutine('r2', '2026-01-01', 1, lowerExercises),
            ];

            const date = localDate('2026-01-18');
            const newTasks = generateDailyTasksPure(routines, [], date);

            expect(newTasks).toHaveLength(4);
            expect(newTasks.map(t => t.name)).toEqual([
                'Bench Press', 'Rows', 'Squats', 'Lunges'
            ]);
        });

        it('correctly associates tasks with their routine', () => {
            const routines = [
                createRoutine('routine-abc', '2026-01-01', 1, [
                    createExercise('ex-1', 'routine-abc', 'Curls'),
                ]),
            ];

            const date = localDate('2026-01-18');
            const newTasks = generateDailyTasksPure(routines, [], date);

            expect(newTasks[0].routineId).toBe('routine-abc');
            expect(newTasks[0].exerciseTemplateId).toBe('ex-1');
        });

        it('sets the correct taskDate on generated tasks', () => {
            const routines = [
                createRoutine('r1', '2026-01-01', 1, [
                    createExercise('e1', 'r1', 'Exercise'),
                ]),
            ];

            const date = localDate('2026-03-15');
            const newTasks = generateDailyTasksPure(routines, [], date);

            expect(newTasks[0].taskDate).toBe('2026-03-15');
        });

        it('all generated tasks have completed = false', () => {
            const routines = [
                createRoutine('r1', '2026-01-01', 1, [
                    createExercise('e1', 'r1', 'A'),
                    createExercise('e2', 'r1', 'B'),
                    createExercise('e3', 'r1', 'C'),
                ]),
            ];

            const newTasks = generateDailyTasksPure(routines, [], localDate('2026-01-18'));

            expect(newTasks.every(t => t.completed === false)).toBe(true);
        });
    });

    describe('isRoutineDueForTasks', () => {
        it('returns true when routine is due', () => {
            const routine = createRoutine('r1', '2026-01-01', 1, []);
            expect(isRoutineDueForTasks(routine, localDate('2026-01-18'))).toBe(true);
        });

        it('returns false when routine is not due', () => {
            const routine = createRoutine('r1', '2026-01-01', 3, []);
            // Day 17 from Jan 1, 17 % 3 = 2, not 0
            expect(isRoutineDueForTasks(routine, localDate('2026-01-18'))).toBe(false);
        });
    });

    describe('getExpectedTaskCount', () => {
        it('returns the number of exercises in a routine', () => {
            const routine = createRoutine('r1', '2026-01-01', 1, [
                createExercise('e1', 'r1', 'A'),
                createExercise('e2', 'r1', 'B'),
                createExercise('e3', 'r1', 'C'),
                createExercise('e4', 'r1', 'D'),
            ]);

            expect(getExpectedTaskCount(routine)).toBe(4);
        });

        it('returns 0 for routine with no exercises', () => {
            const routine = createRoutine('r1', '2026-01-01', 1, []);
            expect(getExpectedTaskCount(routine)).toBe(0);
        });
    });
});
