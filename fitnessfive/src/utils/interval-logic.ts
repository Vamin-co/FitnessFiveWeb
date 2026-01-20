/**
 * Pure utility functions for interval scheduling logic.
 * These are separated from React/Supabase for easy testing.
 */

/**
 * Creates a Date object from a YYYY-MM-DD string in local timezone
 * This ensures consistent date handling throughout the app
 */
export function parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0); // Noon to avoid DST issues
}

/**
 * Formats a date to YYYY-MM-DD string
 */
export function formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Determines if a routine is due on a given date based on interval logic.
 * 
 * Formula: (checkDate - startDate) % frequencyDays === 0
 * 
 * @param startDate - The date the routine schedule began (ISO string or Date)
 * @param frequencyDays - How often the routine repeats (every N days)
 * @param checkDate - The date to check (defaults to today)
 * @returns true if the routine is due on checkDate
 */
export function isRoutineDue(
    startDate: string | Date,
    frequencyDays: number,
    checkDate: Date = new Date()
): boolean {
    // Parse start date - handle both string and Date inputs
    const start = typeof startDate === 'string'
        ? parseLocalDate(startDate)
        : normalizeToMidnight(new Date(startDate));

    const check = normalizeToMidnight(new Date(checkDate));

    // Calculate difference in days
    const diffTime = check.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // If check date is before start date, not due
    if (diffDays < 0) return false;

    // If frequency is 1 (daily), always due
    if (frequencyDays === 1) return true;

    // Check if diffDays is evenly divisible by frequencyDays
    return diffDays % frequencyDays === 0;
}

/**
 * Normalizes a date to midnight (00:00:00) for consistent day comparisons
 */
export function normalizeToMidnight(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

/**
 * Get all dates in a range
 */
export function getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const current = normalizeToMidnight(new Date(startDate));
    const end = normalizeToMidnight(new Date(endDate));

    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

/**
 * Gets the scheduled workout days for a routine within a date range
 */
export function getScheduledDays(
    startDate: string | Date,
    frequencyDays: number,
    rangeStart: Date,
    rangeEnd: Date
): Date[] {
    const scheduledDays: Date[] = [];
    const dates = getDateRange(rangeStart, rangeEnd);

    for (const date of dates) {
        if (isRoutineDue(startDate, frequencyDays, date)) {
            scheduledDays.push(date);
        }
    }

    return scheduledDays;
}
