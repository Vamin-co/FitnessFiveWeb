const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function getDateParts(date: Date, timeZone: string): { year: number; month: number; day: number } {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const parts = formatter.formatToParts(date);
    const year = Number(parts.find((part) => part.type === 'year')?.value);
    const month = Number(parts.find((part) => part.type === 'month')?.value);
    const day = Number(parts.find((part) => part.type === 'day')?.value);

    return { year, month, day };
}

export function formatDateInTimeZone(date: Date, timeZone: string): string {
    const { year, month, day } = getDateParts(date, timeZone);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getWeekdayInTimeZone(date: Date, timeZone: string): number {
    const weekday = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'short',
    }).format(date);

    return SHORT_WEEKDAYS.indexOf(weekday as (typeof SHORT_WEEKDAYS)[number]);
}

export function getReadableDateLabel(date: Date, timeZone: string): string {
    return new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

export function getShortDateLabel(date: Date, timeZone: string, todayDate: string): string {
    const dateString = formatDateInTimeZone(date, timeZone);
    if (dateString === todayDate) {
        return 'Today';
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'short',
    });

    return formatter.format(date);
}

export function getDateRangeForTimeZone(
    startDate: Date,
    numberOfDays: number,
    timeZone: string
): Array<{ date: Date; dateString: string; weekday: number }> {
    const cursor = new Date(startDate);
    cursor.setUTCHours(12, 0, 0, 0);

    return Array.from({ length: numberOfDays }, (_, index) => {
        const current = new Date(cursor);
        current.setUTCDate(cursor.getUTCDate() + index);

        return {
            date: current,
            dateString: formatDateInTimeZone(current, timeZone),
            weekday: getWeekdayInTimeZone(current, timeZone),
        };
    });
}
