import { describe, it, expect } from 'vitest';
import {
    calculateStreakPure,
    getDayStatus,
    isDayScheduled,
    formatDate,
    parseLocalDate,
    type RoutineSchedule,
    type CompletionRecord
} from '../streak-logic';

describe('Streak Calculation Logic', () => {

    // Helper to create routine schedules
    const createRoutine = (
        id: string,
        startDate: string,
        frequencyDays: number
    ): RoutineSchedule => ({
        id,
        startDate,
        frequencyDays,
    });

    // Helper to create completions
    const createCompletion = (
        routineId: string,
        completedDate: string
    ): CompletionRecord => ({
        routineId,
        completedDate,
    });

    // Helper to create a local date (avoids timezone issues)
    const localDate = (dateStr: string): Date => parseLocalDate(dateStr);

    describe('Test 1: Standard Increment', () => {
        it('increments streak when user completed yesterday and today', () => {
            // Routine: Every day starting Jan 1
            const routines = [createRoutine('r1', '2026-01-01', 1)];

            // Completed yesterday and today (Jan 17 and Jan 18)
            const completions = [
                createCompletion('r1', '2026-01-17'),
                createCompletion('r1', '2026-01-18'),
            ];

            const today = localDate('2026-01-18');
            const streak = calculateStreakPure(routines, completions, today);

            expect(streak).toBe(2);
        });

        it('increments streak for multiple consecutive days', () => {
            const routines = [createRoutine('r1', '2026-01-01', 1)];

            // 5 consecutive days of completions
            const completions = [
                createCompletion('r1', '2026-01-14'),
                createCompletion('r1', '2026-01-15'),
                createCompletion('r1', '2026-01-16'),
                createCompletion('r1', '2026-01-17'),
                createCompletion('r1', '2026-01-18'),
            ];

            const today = localDate('2026-01-18');
            const streak = calculateStreakPure(routines, completions, today);

            expect(streak).toBe(5);
        });
    });

    describe('Test 2: Valid Rest Days (streak preserved)', () => {
        it('does NOT break streak when rest days are in between', () => {
            // Routine: Every 3 days starting Jan 1
            // Jan 1 -> workout, Jan 4 -> workout, Jan 7 -> workout
            // Jan 2, 3, 5, 6 are REST days (not scheduled)
            const routines = [createRoutine('r1', '2026-01-01', 3)];

            // User completed on scheduled days
            const completions = [
                createCompletion('r1', '2026-01-01'),
                createCompletion('r1', '2026-01-04'),
                createCompletion('r1', '2026-01-07'),
            ];

            const today = localDate('2026-01-07');
            const streak = calculateStreakPure(routines, completions, today);

            // Should be 3 (three completed workout days)
            // Rest days don't break the streak
            expect(streak).toBe(3);
        });

        it('preserves streak when checking from a rest day that follows completions', () => {
            // Every 2 days starting Jan 1
            // Jan 1 (workout), Jan 2 (rest), Jan 3 (workout), etc.
            const routines = [createRoutine('r1', '2026-01-01', 2)];

            const completions = [
                createCompletion('r1', '2026-01-01'),
                createCompletion('r1', '2026-01-03'),
                createCompletion('r1', '2026-01-05'),
            ];

            // Today is Jan 6 (rest day after workout on Jan 5)
            const today = localDate('2026-01-06');
            const streak = calculateStreakPure(routines, completions, today);

            expect(streak).toBe(3);
        });
    });

    describe('Test 3: Broken Streak (missed workout)', () => {
        it('resets streak when a scheduled workout day was missed', () => {
            // Daily routine
            const routines = [createRoutine('r1', '2026-01-01', 1)];

            // Missed Jan 16, completed Jan 17, 18
            const completions = [
                createCompletion('r1', '2026-01-15'),
                // Jan 16 MISSED
                createCompletion('r1', '2026-01-17'),
                createCompletion('r1', '2026-01-18'),
            ];

            const today = localDate('2026-01-18');
            const streak = calculateStreakPure(routines, completions, today);

            // Only 2 days since the miss
            expect(streak).toBe(2);
        });

        it('streak is 1 when today is the first completion after a break', () => {
            const routines = [createRoutine('r1', '2026-01-01', 1)];

            // Completed a week ago, nothing since until today
            const completions = [
                createCompletion('r1', '2026-01-10'),
                createCompletion('r1', '2026-01-18'), // Today
            ];

            const today = localDate('2026-01-18');
            const streak = calculateStreakPure(routines, completions, today);

            // Many missed days in between, so streak is just today
            expect(streak).toBe(1);
        });

        it('streak breaks when one routine is missed but another is completed', () => {
            // Both routines are daily
            const routines = [
                createRoutine('r1', '2026-01-01', 1),
                createRoutine('r2', '2026-01-01', 1),
            ];

            // Both completed Jan 16, only r1 completed Jan 17, both completed Jan 18
            const completions = [
                createCompletion('r1', '2026-01-16'),
                createCompletion('r2', '2026-01-16'),
                createCompletion('r1', '2026-01-17'), // r2 MISSED on Jan 17
                createCompletion('r1', '2026-01-18'),
                createCompletion('r2', '2026-01-18'),
            ];

            const today = localDate('2026-01-18');
            const streak = calculateStreakPure(routines, completions, today);

            // Jan 17 had a miss (r2), so streak breaks there
            expect(streak).toBe(1);
        });
    });

    describe('getDayStatus', () => {
        it('returns "rest" for non-scheduled days', () => {
            const routines = [createRoutine('r1', '2026-01-01', 3)];
            const completions: CompletionRecord[] = [];

            // Jan 2 is not scheduled (every 3 days from Jan 1)
            const status = getDayStatus(localDate('2026-01-02'), routines, completions);
            expect(status).toBe('rest');
        });

        it('returns "completed" for scheduled days with completion', () => {
            const routines = [createRoutine('r1', '2026-01-01', 1)];
            const completions = [createCompletion('r1', '2026-01-15')];

            const status = getDayStatus(localDate('2026-01-15'), routines, completions);
            expect(status).toBe('completed');
        });

        it('returns "missed" for scheduled days without completion', () => {
            const routines = [createRoutine('r1', '2026-01-01', 1)];
            const completions: CompletionRecord[] = [];

            const status = getDayStatus(localDate('2026-01-15'), routines, completions);
            expect(status).toBe('missed');
        });
    });

    describe('formatDate', () => {
        it('formats date as YYYY-MM-DD', () => {
            // Use parseLocalDate to avoid timezone issues
            expect(formatDate(localDate('2026-01-05'))).toBe('2026-01-05');
            expect(formatDate(localDate('2026-12-25'))).toBe('2026-12-25');
        });

        it('pads single digit months and days', () => {
            expect(formatDate(localDate('2026-03-09'))).toBe('2026-03-09');
        });
    });

    describe('Edge Cases', () => {
        it('returns 0 streak when no routines exist', () => {
            const streak = calculateStreakPure([], [], localDate('2026-01-18'));
            expect(streak).toBe(0);
        });

        it('returns 0 streak when no completions exist', () => {
            const routines = [createRoutine('r1', '2026-01-01', 1)];
            const streak = calculateStreakPure(routines, [], localDate('2026-01-18'));
            expect(streak).toBe(0);
        });

        it('handles routine that starts today', () => {
            const routines = [createRoutine('r1', '2026-01-18', 1)];
            const completions = [createCompletion('r1', '2026-01-18')];

            const today = localDate('2026-01-18');
            const streak = calculateStreakPure(routines, completions, today);

            expect(streak).toBe(1);
        });
    });
});
