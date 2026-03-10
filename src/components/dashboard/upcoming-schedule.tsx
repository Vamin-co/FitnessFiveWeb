"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeekScheduleDay } from "@/types";

interface UpcomingScheduleProps {
    weekSchedule: WeekScheduleDay[];
    className?: string;
}

export function UpcomingSchedule({ weekSchedule, className }: UpcomingScheduleProps) {
    const [selectedDay, setSelectedDay] = useState(0);
    const currentDay = weekSchedule[selectedDay];

    return (
        <div className={cn("flex h-full flex-col", className)}>
            <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-cyan-400" />
                <h2 className="text-base font-semibold text-white">Quest Horizon</h2>
            </div>

            <div className="flex flex-1 flex-col">
                <div className="mb-3 flex gap-1">
                    {weekSchedule.map((day, index) => {
                        const hasQuests = day.quests.length > 0;
                        const isSelected = selectedDay === index;

                        return (
                            <motion.button
                                key={day.date}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => setSelectedDay(index)}
                                className={cn(
                                    "flex flex-1 flex-col items-center rounded-lg px-1 py-2 transition-all",
                                    day.isToday && !isSelected
                                        ? "border border-cyan-500/20 bg-cyan-500/10"
                                        : isSelected
                                            ? "border border-cyan-500/40 bg-cyan-500/20 ring-1 ring-cyan-500/30"
                                            : hasQuests
                                                ? "bg-zinc-800/50 hover:bg-zinc-700/50"
                                                : "bg-transparent hover:bg-zinc-800/30"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] font-medium uppercase tracking-wide",
                                    isSelected ? "text-cyan-300" : day.isToday ? "text-cyan-300" : "text-zinc-500"
                                )}>
                                    {day.shortLabel}
                                </span>
                                <span className={cn(
                                    "mt-1 text-sm font-bold",
                                    isSelected ? "text-white" : "text-zinc-400"
                                )}>
                                    {day.quests.length}
                                </span>
                                {hasQuests && (
                                    <div className={cn(
                                        "mt-1 h-1.5 w-1.5 rounded-full",
                                        isSelected || day.isToday ? "bg-cyan-400" : "bg-emerald-400"
                                    )} />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                <motion.div
                    key={currentDay?.date}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-auto rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
                >
                    <p className="text-sm font-medium text-white">{currentDay?.label}</p>
                    {currentDay?.quests.length ? (
                        <div className="mt-3 space-y-2">
                            {currentDay.quests.map((quest) => (
                                <div key={quest.id} className="flex items-center justify-between rounded-xl bg-zinc-900/70 px-3 py-2 text-sm">
                                    <span className="text-zinc-200">{quest.title}</span>
                                    <span className={cn(
                                        "rounded-full px-2 py-1 text-xs",
                                        quest.status === "completed"
                                            ? "bg-emerald-500/15 text-emerald-300"
                                            : "bg-cyan-500/15 text-cyan-300"
                                    )}>
                                        {quest.status === "completed" ? "done" : `${quest.xp} XP`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-zinc-500">No quests scheduled.</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
