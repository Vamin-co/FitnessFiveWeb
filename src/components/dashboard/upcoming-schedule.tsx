"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Routine } from "@/types";

interface UpcomingScheduleProps {
    routines: Routine[];
    className?: string;
}

// Check if a routine is due on a given date
function isRoutineDueOnDate(routine: Routine, checkDate: Date): boolean {
    const startDate = new Date(routine.startDate);
    const diffTime = checkDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays % routine.frequencyDays === 0;
}

// Get day name abbreviation
function getDayAbbrev(date: Date, today: Date): string {
    const dayDiff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff === 0) return "Today";
    if (dayDiff === 1) return "Tmrw";
    return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function UpcomingSchedule({ routines, className }: UpcomingScheduleProps) {
    const [selectedDay, setSelectedDay] = useState<number>(0); // Default to first day (today)

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeRoutines = routines.filter((r) => r.isActive);

    // Build next 7 days
    const weekDays: { date: Date; dayAbbrev: string; dayNum: number; routines: Routine[]; isToday: boolean }[] = [];

    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() + i);

        const dueRoutines = activeRoutines.filter((r) =>
            isRoutineDueOnDate(r, checkDate)
        );

        weekDays.push({
            date: checkDate,
            dayAbbrev: getDayAbbrev(checkDate, today),
            dayNum: checkDate.getDate(),
            routines: dueRoutines,
            isToday: i === 0,
        });
    }

    // Get the currently selected day's routines
    const currentDay = weekDays[selectedDay];
    const selectedRoutineNames = currentDay?.routines.map(r => r.name).join(", ") || "Rest day";

    return (
        <div className={cn("h-full flex flex-col", className)}>
            <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-cyan-400" />
                <h2 className="text-base font-semibold text-white">This Week</h2>
            </div>

            {/* Horizontal week view - uses click/tap instead of hover for mobile */}
            <div className="flex-1 flex flex-col">
                <div className="flex gap-1 w-full mb-2">
                    {weekDays.map((day, index) => {
                        const hasWorkout = day.routines.length > 0;
                        const isSelected = selectedDay === index;
                        return (
                            <motion.button
                                key={day.date.toISOString()}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => setSelectedDay(index)}
                                className={cn(
                                    "flex-1 flex flex-col items-center rounded-lg py-2 px-1 transition-all min-w-0",
                                    day.isToday && !isSelected
                                        ? "bg-cyan-500/10 border border-cyan-500/20"
                                        : isSelected
                                            ? "bg-cyan-500/20 border border-cyan-500/40 ring-1 ring-cyan-500/30"
                                            : hasWorkout
                                                ? "bg-zinc-800/50 hover:bg-zinc-700/50"
                                                : "bg-transparent hover:bg-zinc-800/30"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] font-medium uppercase tracking-wide transition-colors",
                                    isSelected ? "text-cyan-400" : day.isToday ? "text-cyan-300" : "text-zinc-500"
                                )}>
                                    {day.dayAbbrev}
                                </span>
                                <span className={cn(
                                    "text-sm font-bold mt-0.5 transition-colors",
                                    isSelected ? "text-white" : day.isToday ? "text-zinc-200" : "text-zinc-400"
                                )}>
                                    {day.dayNum}
                                </span>
                                {hasWorkout && (
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full mt-1 transition-colors",
                                        isSelected || day.isToday ? "bg-cyan-400" : "bg-emerald-400"
                                    )} />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Show routine info for selected day */}
                <motion.div
                    key={selectedDay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-auto pt-2 border-t border-zinc-800"
                >
                    <p className="text-xs text-zinc-400">
                        <span className="font-medium text-cyan-400">
                            {currentDay?.dayAbbrev}:
                        </span>{" "}
                        <span className={cn(
                            currentDay?.routines.length > 0 ? "text-emerald-400" : "text-zinc-500"
                        )}>
                            {selectedRoutineNames}
                        </span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
