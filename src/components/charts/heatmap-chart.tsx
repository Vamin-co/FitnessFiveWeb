"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HeatmapDay } from "@/types";

interface HeatmapChartProps {
    data: HeatmapDay[];
    className?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function HeatmapChart({ data, className }: HeatmapChartProps) {
    // Organize data into weeks
    const weeks = useMemo(() => {
        const result: HeatmapDay[][] = [];
        let currentWeek: HeatmapDay[] = [];

        // Pad the first week if needed
        if (data.length > 0) {
            const firstDate = new Date(data[0].date);
            const firstDay = firstDate.getDay();
            for (let i = 0; i < firstDay; i++) {
                currentWeek.push({ date: '', status: 'future', count: 0 });
            }
        }

        data.forEach((day) => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                result.push(currentWeek);
                currentWeek = [];
            }
        });

        // Add remaining days
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push({ date: '', status: 'future', count: 0 });
            }
            result.push(currentWeek);
        }

        return result;
    }, [data]);

    // Get month labels
    const monthLabels = useMemo(() => {
        const labels: { month: string; index: number }[] = [];
        let lastMonth = -1;

        weeks.forEach((week, weekIndex) => {
            const validDay = week.find(d => d.date);
            if (validDay) {
                const date = new Date(validDay.date);
                const month = date.getMonth();
                if (month !== lastMonth) {
                    labels.push({ month: MONTHS[month], index: weekIndex });
                    lastMonth = month;
                }
            }
        });

        return labels;
    }, [weeks]);

    const getStatusColor = (status: HeatmapDay['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500';
            case 'missed':
                return 'bg-red-500/60';
            case 'rest':
                return 'bg-zinc-800';
            case 'future':
            default:
                return 'bg-zinc-800/30';
        }
    };

    const getTooltip = (day: HeatmapDay) => {
        if (!day.date) return '';
        const date = new Date(day.date);
        const formatted = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        switch (day.status) {
            case 'completed':
                return `${formatted}: Completed!`;
            case 'missed':
                return `${formatted}: Missed`;
            case 'rest':
                return `${formatted}: Rest day`;
            default:
                return formatted;
        }
    };

    // Calculate stats
    const stats = useMemo(() => {
        const completed = data.filter(d => d.status === 'completed').length;
        const missed = data.filter(d => d.status === 'missed').length;
        const total = completed + missed;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, missed, rate };
    }, [data]);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                    <span className="text-zinc-400">{stats.completed} completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-red-500/60" />
                    <span className="text-zinc-400">{stats.missed} missed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-zinc-800" />
                    <span className="text-zinc-400">Rest days</span>
                </div>
                <div className="ml-auto">
                    <span className="text-emerald-400 font-medium">{stats.rate}%</span>
                    <span className="text-zinc-500"> completion rate</span>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto pb-2">
                <div className="inline-block">
                    {/* Month labels */}
                    <div className="flex mb-1 ml-8">
                        {monthLabels.map((label, i) => (
                            <div
                                key={i}
                                className="text-[10px] text-zinc-500"
                                style={{
                                    marginLeft: i === 0 ? 0 : `${(label.index - (monthLabels[i - 1]?.index || 0)) * 13 - 20}px`,
                                }}
                            >
                                {label.month}
                            </div>
                        ))}
                    </div>

                    <div className="flex">
                        {/* Day labels */}
                        <div className="flex flex-col gap-[2px] mr-1.5 text-[10px] text-zinc-500">
                            {DAYS.map((day, i) => (
                                <div key={i} className="h-[11px] flex items-center">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="flex gap-[2px]">
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-[2px]">
                                    {week.map((day, dayIndex) => (
                                        <motion.div
                                            key={`${weekIndex}-${dayIndex}`}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: weekIndex * 0.005 + dayIndex * 0.002 }}
                                            className={cn(
                                                "h-[11px] w-[11px] rounded-sm transition-all cursor-default",
                                                getStatusColor(day.status),
                                                day.date && "hover:ring-2 hover:ring-white/30"
                                            )}
                                            title={getTooltip(day)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
