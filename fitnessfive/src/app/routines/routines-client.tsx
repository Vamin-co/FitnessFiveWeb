"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Plus, Trash2, Calendar, Dumbbell, Check, X,
    Loader2, PartyPopper, ChevronRight, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createRoutine, deleteRoutine, toggleDailyTask } from "@/lib/actions";
import type { Routine, DailyTask, Workout } from "@/types";

interface RoutinesPageClientProps {
    routines: Routine[];
    dailyTasks: DailyTask[];
    workouts: Workout[];
}

export function RoutinesPageClient({ routines, dailyTasks, workouts }: RoutinesPageClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isCreating, setIsCreating] = useState(false);
    const [routineName, setRoutineName] = useState("");
    const [description, setDescription] = useState("");
    const [frequencyDays, setFrequencyDays] = useState(1);
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);

    // Group tasks by routine for display
    const tasksByRoutine = dailyTasks.reduce((acc, task) => {
        if (!acc[task.routineId]) acc[task.routineId] = [];
        acc[task.routineId].push(task);
        return acc;
    }, {} as Record<string, DailyTask[]>);

    const selectedWorkout = workouts.find(w => w.id === selectedWorkoutId);
    const hasWorkouts = workouts.length > 0;

    const handleCreateRoutine = async () => {
        if (!routineName.trim() || !selectedWorkoutId) return;

        startTransition(async () => {
            await createRoutine({
                name: routineName,
                description: description || undefined,
                frequencyDays,
                workoutId: selectedWorkoutId,
            });

            setRoutineName("");
            setDescription("");
            setFrequencyDays(1);
            setSelectedWorkoutId(null);
            setIsCreating(false);
            router.refresh();
        });
    };

    const handleDeleteRoutine = async (routineId: string) => {
        setDeletingId(routineId);
        startTransition(async () => {
            await deleteRoutine(routineId);
            setDeletingId(null);
            router.refresh();
        });
    };

    const handleToggleTask = async (taskId: string) => {
        setTogglingTaskId(taskId);
        startTransition(async () => {
            const result = await toggleDailyTask(taskId);
            setTogglingTaskId(null);

            // Check if all tasks are now completed
            if (result.success && result.completed) {
                const allCompleted = dailyTasks.every(t =>
                    t.id === taskId ? true : t.completed
                );
                if (allCompleted && dailyTasks.length > 0) {
                    setShowCelebration(true);
                    setTimeout(() => setShowCelebration(false), 3000);
                }
            }

            router.refresh();
        });
    };

    const completedCount = dailyTasks.filter(t => t.completed).length;
    const totalCount = dailyTasks.length;

    return (
        <div className="flex min-h-screen bg-zinc-950">
            <Sidebar />

            <main className="flex-1 pl-64">
                <div className="p-8">
                    {/* Celebration Modal */}
                    <AnimatePresence>
                        {showCelebration && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                            >
                                <motion.div
                                    initial={{ y: 20 }}
                                    animate={{ y: 0 }}
                                    className="rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 p-12 text-center"
                                >
                                    <motion.div
                                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                                        transition={{ duration: 0.5, repeat: 2 }}
                                    >
                                        <PartyPopper className="mx-auto h-16 w-16 text-yellow-400" />
                                    </motion.div>
                                    <h2 className="mt-4 text-3xl font-bold text-white">🎉 BOOM!</h2>
                                    <p className="mt-2 text-xl text-emerald-400">You crushed it!</p>
                                    <p className="mt-1 text-zinc-400">All workouts complete • +1 Streak 🔥</p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Routines</h1>
                            <p className="mt-1 text-zinc-400">Schedule your workouts and track completion</p>
                        </div>
                        {!isCreating && (
                            <Button
                                onClick={() => setIsCreating(true)}
                                className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
                            >
                                <Plus className="h-4 w-4" />
                                New Routine
                            </Button>
                        )}
                    </motion.div>

                    {/* Today's Tasks Summary */}
                    {totalCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <Card className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-white">Today&apos;s Workout</h2>
                                    <Badge className={cn(
                                        "border-0",
                                        completedCount === totalCount
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-cyan-500/20 text-cyan-400"
                                    )}>
                                        {completedCount}/{totalCount} Complete
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    {dailyTasks.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            layout
                                            className={cn(
                                                "flex items-center gap-3 rounded-xl p-3 transition-all",
                                                task.completed
                                                    ? "bg-emerald-500/10 border border-emerald-500/20"
                                                    : "bg-zinc-800/50 border border-zinc-700"
                                            )}
                                        >
                                            <button
                                                onClick={() => handleToggleTask(task.id)}
                                                disabled={togglingTaskId === task.id}
                                                className={cn(
                                                    "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                                                    task.completed
                                                        ? "bg-emerald-500 border-emerald-500"
                                                        : "border-zinc-600 hover:border-emerald-500"
                                                )}
                                            >
                                                {togglingTaskId === task.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin text-white" />
                                                ) : task.completed ? (
                                                    <Check className="h-3 w-3 text-white" />
                                                ) : null}
                                            </button>
                                            <div className="flex-1">
                                                <span className={cn(
                                                    "font-medium",
                                                    task.completed ? "text-emerald-400 line-through" : "text-white"
                                                )}>
                                                    {task.name}
                                                </span>
                                                {task.targetSets && task.targetReps && (
                                                    <span className="ml-2 text-sm text-zinc-500">
                                                        {task.targetSets}×{task.targetReps}
                                                        {task.weight ? ` @ ${task.weight}lbs` : ""}
                                                    </span>
                                                )}
                                            </div>
                                            {task.completed && (
                                                <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">
                                                    Done!
                                                </Badge>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Create Routine Form */}
                    <AnimatePresence>
                        {isCreating && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8"
                            >
                                <Card className="border-zinc-800 bg-zinc-900/50 p-6">
                                    <div className="mb-6 flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-white">Create New Routine</h2>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsCreating(false)}
                                            className="text-zinc-400 hover:text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* No Workouts Warning */}
                                    {!hasWorkouts && (
                                        <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-yellow-400">No workouts found</p>
                                                    <p className="text-sm text-zinc-400 mt-1">
                                                        Create a workout first to link it to a routine.
                                                    </p>
                                                    <Button
                                                        onClick={() => router.push("/workout")}
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-3 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Create Workout First
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Basic Info */}
                                    <div className="mb-6 grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm text-zinc-400">Routine Name</label>
                                            <Input
                                                value={routineName}
                                                onChange={(e) => setRoutineName(e.target.value)}
                                                placeholder="e.g., Push Day Routine"
                                                className="bg-zinc-800 border-zinc-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm text-zinc-400">Frequency</label>
                                            <select
                                                value={frequencyDays}
                                                onChange={(e) => setFrequencyDays(parseInt(e.target.value))}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
                                            >
                                                <option value="1">Every day</option>
                                                <option value="2">Every 2 days</option>
                                                <option value="3">Every 3 days</option>
                                                <option value="7">Weekly</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Workout Picker */}
                                    {hasWorkouts && (
                                        <div className="mb-6">
                                            <label className="mb-3 block text-sm font-medium text-zinc-300">
                                                Select Workout
                                            </label>
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {workouts.map((workout) => (
                                                    <button
                                                        key={workout.id}
                                                        onClick={() => setSelectedWorkoutId(workout.id)}
                                                        className={cn(
                                                            "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                                                            selectedWorkoutId === workout.id
                                                                ? "border-emerald-500 bg-emerald-500/10"
                                                                : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "flex h-10 w-10 items-center justify-center rounded-xl",
                                                            selectedWorkoutId === workout.id
                                                                ? "bg-emerald-500/20"
                                                                : "bg-zinc-700"
                                                        )}>
                                                            <Dumbbell className={cn(
                                                                "h-5 w-5",
                                                                selectedWorkoutId === workout.id
                                                                    ? "text-emerald-400"
                                                                    : "text-zinc-400"
                                                            )} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={cn(
                                                                "font-medium truncate",
                                                                selectedWorkoutId === workout.id
                                                                    ? "text-emerald-400"
                                                                    : "text-white"
                                                            )}>
                                                                {workout.title}
                                                            </p>
                                                            <p className="text-xs text-zinc-500 truncate">
                                                                {workout.exercises.length} exercises
                                                            </p>
                                                        </div>
                                                        {selectedWorkoutId === workout.id && (
                                                            <Check className="h-5 w-5 text-emerald-400" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Selected Workout Preview */}
                                            {selectedWorkout && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4 rounded-xl border border-zinc-700 bg-zinc-800/30 p-4"
                                                >
                                                    <p className="text-xs uppercase text-zinc-500 mb-2">Exercises in this workout:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedWorkout.exercises.slice(0, 5).map((ex) => (
                                                            <Badge key={ex.id} variant="secondary" className="bg-zinc-700/50">
                                                                {ex.name}
                                                            </Badge>
                                                        ))}
                                                        {selectedWorkout.exercises.length > 5 && (
                                                            <Badge variant="secondary" className="bg-zinc-700/50">
                                                                +{selectedWorkout.exercises.length - 5} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsCreating(false)}
                                            className="border-zinc-700 text-zinc-300"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCreateRoutine}
                                            disabled={!routineName.trim() || !selectedWorkoutId || isPending}
                                            className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50"
                                        >
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4" />
                                                    Create Routine
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Existing Routines */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {routines.map((routine, index) => {
                            const routineTasks = tasksByRoutine[routine.id] || [];
                            const completedTasks = routineTasks.filter(t => t.completed).length;
                            const workoutName = routine.workout?.title || "No workout linked";
                            const exerciseCount = routine.workout?.exercises.length || routine.exercises?.length || 0;

                            return (
                                <motion.div
                                    key={routine.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="group border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-white">{routine.name}</h3>
                                                <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                                                    <Calendar className="h-3 w-3" />
                                                    Every {routine.frequencyDays === 1 ? "day" : `${routine.frequencyDays} days`}
                                                </div>
                                            </div>
                                            {routineTasks.length > 0 && (
                                                <Badge className={cn(
                                                    "border-0",
                                                    completedTasks === routineTasks.length
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : "bg-cyan-500/20 text-cyan-400"
                                                )}>
                                                    {completedTasks}/{routineTasks.length}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Linked Workout */}
                                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-zinc-800/50 p-2">
                                            <Dumbbell className="h-4 w-4 text-emerald-400" />
                                            <span className="text-sm text-zinc-300">{workoutName}</span>
                                            <span className="text-xs text-zinc-500">• {exerciseCount} exercises</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-zinc-500">
                                                Started {new Date(routine.startDate).toLocaleDateString()}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteRoutine(routine.id)}
                                                disabled={deletingId === routine.id}
                                                className="text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                                            >
                                                {deletingId === routine.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}

                        {routines.length === 0 && !isCreating && (
                            <div className="col-span-full rounded-xl border border-dashed border-zinc-700 p-12 text-center">
                                <Calendar className="mx-auto h-12 w-12 text-zinc-600" />
                                <h3 className="mt-4 text-lg font-semibold text-white">No routines yet</h3>
                                <p className="mt-1 text-zinc-400">
                                    {hasWorkouts
                                        ? "Create a routine to schedule your workouts"
                                        : "Create a workout first, then schedule it as a routine"
                                    }
                                </p>
                                <Button
                                    onClick={() => hasWorkouts ? setIsCreating(true) : router.push("/workout")}
                                    className="mt-4 gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
                                >
                                    <Plus className="h-4 w-4" />
                                    {hasWorkouts ? "Create Routine" : "Create Workout First"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
