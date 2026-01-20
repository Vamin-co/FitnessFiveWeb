import { describe, it, expect } from 'vitest';
import {
    isRoutineDue,
    normalizeToMidnight,
    getScheduledDays,
    parseLocalDate
} from '../interval-logic';

describe('Interval Logic', () => {

    // Helper to create a local date (avoids timezone issues)
    const localDate = (dateStr: string): Date => parseLocalDate(dateStr);

    describe('isRoutineDue', () => {

        describe('Scenario A: Daily frequency (1)', () => {
            const startDate = '2026-01-01';
            const frequency = 1;

            it('returns true for the start date itself', () => {
                const checkDate = localDate('2026-01-01');
                expect(isRoutineDue(startDate, frequency, checkDate)).toBe(true);
            });

            it('returns true for consecutive days', () => {
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-02'))).toBe(true);
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-03'))).toBe(true);
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-04'))).toBe(true);
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-05'))).toBe(true);
            });

            it('returns true even after many days', () => {
                expect(isRoutineDue(startDate, frequency, localDate('2026-06-15'))).toBe(true);
                expect(isRoutineDue(startDate, frequency, localDate('2027-01-01'))).toBe(true);
            });
        });

        describe('Scenario B: Every 3 days', () => {
            const startDate = '2026-01-01';
            const frequency = 3;

            it('Jan 1 (Day 0) -> True', () => {
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-01'))).toBe(true);
            });

            it('Jan 2 (Day 1) -> False', () => {
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-02'))).toBe(false);
            });

            it('Jan 3 (Day 2) -> False', () => {
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-03'))).toBe(false);
            });

            it('Jan 4 (Day 3) -> True', () => {
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-04'))).toBe(true);
            });

            it('Jan 7 (Day 6) -> True', () => {
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-07'))).toBe(true);
            });

            it('Jan 10 (Day 9) -> True', () => {
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-10'))).toBe(true);
            });

            it('continues pattern correctly through longer periods', () => {
                // Day 12 -> True
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-13'))).toBe(true);
                // Day 13 -> False
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-14'))).toBe(false);
            });
        });

        describe('Scenario C: Edge cases - Month boundaries', () => {
            it('handles Jan 31 to Feb 1 transition (every 2 days)', () => {
                const startDate = '2026-01-30';
                const frequency = 2;

                // Jan 30 (Day 0) -> True
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-30'))).toBe(true);
                // Jan 31 (Day 1) -> False
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-31'))).toBe(false);
                // Feb 1 (Day 2) -> True
                expect(isRoutineDue(startDate, frequency, localDate('2026-02-01'))).toBe(true);
                // Feb 2 (Day 3) -> False
                expect(isRoutineDue(startDate, frequency, localDate('2026-02-02'))).toBe(false);
            });

            it('handles Feb 28/29 to Mar 1 transition (non-leap year)', () => {
                const startDate = '2026-02-26';
                const frequency = 3;

                // Feb 26 (Day 0) -> True
                expect(isRoutineDue(startDate, frequency, localDate('2026-02-26'))).toBe(true);
                // Feb 27 -> False
                expect(isRoutineDue(startDate, frequency, localDate('2026-02-27'))).toBe(false);
                // Feb 28 -> False
                expect(isRoutineDue(startDate, frequency, localDate('2026-02-28'))).toBe(false);
                // Mar 1 (Day 3) -> True
                expect(isRoutineDue(startDate, frequency, localDate('2026-03-01'))).toBe(true);
            });

            it('handles Dec 31 to Jan 1 year transition', () => {
                const startDate = '2025-12-30';
                const frequency = 2;

                // Dec 30 -> True
                expect(isRoutineDue(startDate, frequency, localDate('2025-12-30'))).toBe(true);
                // Dec 31 -> False
                expect(isRoutineDue(startDate, frequency, localDate('2025-12-31'))).toBe(false);
                // Jan 1, 2026 -> True
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-01'))).toBe(true);
            });
        });

        describe('Edge cases - Before start date', () => {
            it('returns false if check date is before start date', () => {
                const startDate = '2026-01-15';
                const frequency = 1;

                expect(isRoutineDue(startDate, frequency, localDate('2026-01-14'))).toBe(false);
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-10'))).toBe(false);
                expect(isRoutineDue(startDate, frequency, localDate('2025-12-31'))).toBe(false);
            });
        });

        describe('Edge cases - Weekly (7 days)', () => {
            const startDate = '2026-01-01'; // Wednesday
            const frequency = 7;

            it('returns true only on the same weekday', () => {
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-01'))).toBe(true);
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-08'))).toBe(true);
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-15'))).toBe(true);
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-22'))).toBe(true);
            });

            it('returns false for other days of the week', () => {
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-02'))).toBe(false);
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-05'))).toBe(false);
                expect(isRoutineDue(startDate, frequency, localDate('2026-01-06'))).toBe(false);
            });
        });
    });

    describe('normalizeToMidnight', () => {
        it('sets time to 00:00:00.000', () => {
            const date = new Date(2026, 0, 15, 14, 30, 45, 123); // Local time
            const normalized = normalizeToMidnight(date);

            expect(normalized.getHours()).toBe(0);
            expect(normalized.getMinutes()).toBe(0);
            expect(normalized.getSeconds()).toBe(0);
            expect(normalized.getMilliseconds()).toBe(0);
        });

        it('preserves date correctly', () => {
            const date = new Date(2026, 2, 20, 23, 59, 59, 999); // March 20
            const normalized = normalizeToMidnight(date);

            expect(normalized.getFullYear()).toBe(2026);
            expect(normalized.getMonth()).toBe(2); // March is month 2
            expect(normalized.getDate()).toBe(20);
        });
    });

    describe('getScheduledDays', () => {
        it('returns correct scheduled days for every 3 days', () => {
            const startDate = '2026-01-01';
            const frequency = 3;
            const rangeStart = localDate('2026-01-01');
            const rangeEnd = localDate('2026-01-10');

            const scheduled = getScheduledDays(startDate, frequency, rangeStart, rangeEnd);

            expect(scheduled).toHaveLength(4);
            expect(scheduled[0].getDate()).toBe(1);
            expect(scheduled[1].getDate()).toBe(4);
            expect(scheduled[2].getDate()).toBe(7);
            expect(scheduled[3].getDate()).toBe(10);
        });
    });
});
