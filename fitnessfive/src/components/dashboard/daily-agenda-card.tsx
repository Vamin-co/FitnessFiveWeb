"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Target, Check, Circle, Dumbbell, Loader2,
    BedDouble, AlertTriangle, RefreshCw, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleDailyTask, triggerTaskGeneration } from "@/lib/actions";
import type { DailyTask, Routine } from "@/types";

interface DailyAgendaCardProps {
    dailyTasks: DailyTask[];
    todaysRoutines: { routine: Routine; tasks: DailyTask[]; allCompleted: boolean }[];
    hasRoutines: boolean;
    systemDate: string; // YYYY-MM-DD format for debugging
    routineStartDates: { name: string; startDate: string; frequencyDays: number }[];
}

export function DailyAgendaCard({
    dailyTasks,
    todaysRoutines,
    hasRoutines,
    systemDate,
    routineStartDates,
}: DailyAgendaCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isGenerating, setIsGenerating] = useState(false);

    const totalTasks = dailyTasks.length;
    const completedTasks = dailyTasks.filter(t => t.completed).length;
    const allComplete = totalTasks > 0 && completedTasks === totalTasks;

    // Determine which state to show
    const isRestDay = hasRoutines && todaysRoutines.length === 0;
    const isScheduledButMissing = hasRoutines && todaysRoutines.length > 0 && totalTasks === 0;
    const isScheduledAndReady = totalTasks > 0;

    const handleToggleTask = (taskId: string) => {
        startTransition(async () => {
            await toggleDailyTask(taskId);
            router.refresh();
        });
    };

    const handleInitializeWorkout = async () => {
        setIsGenerating(true);
        startTransition(async () => {
            await triggerTaskGeneration();
            setIsGenerating(false);
            router.refresh();
        });
    };

    return (
        <Card className="border-zinc-800 bg-zinc-900/50 p-5 h-full">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-400" />
                    <h2 className="text-lg font-semibold text-white">
                        Today&apos;s Agenda
                    </h2>
                </div>
                {isScheduledAndReady && (
                    <Badge className={cn(
                        "border-0",
                        allComplete
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-cyan-500/20 text-cyan-400"
                    )}>
                        {completedTasks}/{totalTasks} Complete
                    </Badge>
                )}
            </div>

            {/* State A: Scheduled & Ready */}
            {isScheduledAndReady && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                >
                    {/* Show routine name if available */}
                    {todaysRoutines.length > 0 && (
                        <div className="mb-3 flex items-center gap-2">
                            <Dumbbell className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-400">
                                Target: {todaysRoutines.map(r => r.routine.name).join(", ")}
                            </span>
                        </div>
                    )}

                    {/* Task list */}
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {dailyTasks.map((task) => (
                            <button
                                key={task.id}
                                onClick={() => handleToggleTask(task.id)}
                                disabled={isPending}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all",
                                    task.completed
                                        ? "bg-emerald-500/10 border border-emerald-500/20"
                                        : "bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600"
                                )}
                            >
                                <div className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-full border-2 flex-shrink-0 transition-all",
                                    task.completed
                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                        : "border-zinc-600 hover:border-emerald-500"
                                )}>
                                    {task.completed ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <Circle className="h-3.5 w-3.5 text-zinc-600" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className={cn(
                                        "text-sm font-medium truncate block",
                                        task.completed ? "text-emerald-400 line-through" : "text-white"
                                    )}>
                                        {task.name}
                                    </span>
                                </div>
                                <span className="text-xs text-zinc-500 flex-shrink-0">
                                    {task.targetSets}×{task.targetReps}
                                    {task.weight ? ` @ ${task.weight}lbs` : ""}
                                </span>
                                {task.completed && (
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">
                                        ✓
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* State B: Scheduled but Missing (Debug State) */}
            {isScheduledButMissing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-6 text-center"
                >
                    <div className="rounded-2xl bg-yellow-500/10 p-4 mb-4">
                        <AlertTriangle className="h-10 w-10 text-yellow-400" />
                    </div>
                    <div className="mb-2 text-sm font-medium text-yellow-400">
                        Target: {todaysRoutines.map(r => r.routine.name).join(", ")}
                    </div>
                    <p className="text-zinc-400 mb-4">Tasks not yet generated.</p>
                    <Button
                        onClick={handleInitializeWorkout}
                        disabled={isGenerating}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-4 w-4" />
                                Initialize Workout
                            </>
                        )}
                    </Button>
                </motion.div>
            )}

            {/* State C: Rest Day */}
            {isRestDay && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-6 text-center"
                >
                    <div className="rounded-2xl bg-indigo-500/10 p-4 mb-4">
                        <BedDouble className="h-10 w-10 text-indigo-400" />
                    </div>
                    <p className="text-lg font-medium text-white mb-1">No Routines Scheduled</p>
                    <p className="text-zinc-400">Recovery Mode Active</p>
                    <p className="text-xs text-zinc-500 mt-2">Take time to rest and recover 💪</p>
                </motion.div>
            )}

            {/* No routines at all */}
            {!hasRoutines && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-6 text-center"
                >
                    <div className="rounded-2xl bg-zinc-800 p-4 mb-4">
                        <Dumbbell className="h-10 w-10 text-zinc-600" />
                    </div>
                    <p className="text-zinc-400 mb-3">Create a routine to get started</p>
                    <Button
                        onClick={() => router.push("/routines")}
                        variant="outline"
                        className="border-zinc-700 text-zinc-300"
                    >
                        Go to Routines
                    </Button>
                </motion.div>
            )}

            {/* Date Debugger */}
            <div className="mt-4 pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                    <Calendar className="h-3 w-3" />
                    <span>System Date: <code className="text-zinc-500">{systemDate}</code></span>
                    {routineStartDates.length > 0 && (
                        <>
                            <span className="mx-1">|</span>
                            <span>
                                Routines: {routineStartDates.map(r =>
                                    `${r.name} (start: ${r.startDate}, every ${r.frequencyDays}d)`
                                ).join(", ")}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}
