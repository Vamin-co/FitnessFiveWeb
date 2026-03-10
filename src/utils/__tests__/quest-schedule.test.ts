import { describe, expect, it } from "vitest";
import {
    formatDateInTimeZone,
    getDateRangeForTimeZone,
    getShortDateLabel,
    getWeekdayInTimeZone,
} from "@/utils/quest-schedule";

describe("quest-schedule utilities", () => {
    it("formats dates in the requested timezone", () => {
        const date = new Date("2026-03-10T23:30:00.000Z");
        expect(formatDateInTimeZone(date, "America/Los_Angeles")).toBe("2026-03-10");
        expect(formatDateInTimeZone(date, "Asia/Tokyo")).toBe("2026-03-11");
    });

    it("returns a stable weekday for the requested timezone", () => {
        const date = new Date("2026-03-10T23:30:00.000Z");
        expect(getWeekdayInTimeZone(date, "America/Los_Angeles")).toBe(2);
        expect(getWeekdayInTimeZone(date, "Asia/Tokyo")).toBe(3);
    });

    it("builds an ordered range of local dates", () => {
        const range = getDateRangeForTimeZone(new Date("2026-03-10T12:00:00.000Z"), 3, "America/Los_Angeles");

        expect(range.map((entry) => entry.dateString)).toEqual([
            "2026-03-10",
            "2026-03-11",
            "2026-03-12",
        ]);
    });

    it("labels the current day as Today", () => {
        const date = new Date("2026-03-10T12:00:00.000Z");
        expect(getShortDateLabel(date, "America/Los_Angeles", "2026-03-10")).toBe("Today");
    });
});
