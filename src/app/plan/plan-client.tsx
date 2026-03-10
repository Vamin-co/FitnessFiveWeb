"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { saveTrainingPlan } from "@/lib/actions";
import { cn } from "@/lib/utils";
import type { Profile, TrainingPlan, Workout } from "@/types";
import { CalendarDays, Loader2, Swords, Target, Zap } from "lucide-react";

const WEEKDAY_OPTIONS = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
];

interface PlanPageClientProps {
    activePlan: TrainingPlan | null;
    workouts: Workout[];
    profile: Profile | null;
}

interface WorkoutAssignmentDraft {
    workoutId: string;
    weekdays: number[];
}

function inferAssignments(activePlan: TrainingPlan | null, workouts: Workout[]): WorkoutAssignmentDraft[] {
    if (!activePlan) {
        return [];
    }

    return activePlan.templates
        .map((template) => {
            const matchingWorkout = workouts.find((workout) => workout.title === template.name);
            if (!matchingWorkout) {
                return null;
            }

            return {
                workoutId: matchingWorkout.id,
                weekdays: template.scheduleSlots.map((slot) => slot.weekday).sort((a, b) => a - b),
            };
        })
        .filter(Boolean) as WorkoutAssignmentDraft[];
}

export function PlanPageClient({ activePlan, workouts, profile }: PlanPageClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState(activePlan?.name || "Consistency Quest");
    const [focusSummary, setFocusSummary] = useState(activePlan?.focusSummary || "");
    const [weeklyTarget, setWeeklyTarget] = useState(activePlan?.weeklyTarget || 4);
    const [assignments, setAssignments] = useState<WorkoutAssignmentDraft[]>(
        inferAssignments(activePlan, workouts)
    );

    const hasWorkouts = workouts.length > 0;
    const selectedCount = assignments.length;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const getAssignment = (workoutId: string) => assignments.find((assignment) => assignment.workoutId === workoutId);

    const toggleWorkout = (workoutId: string) => {
        setAssignments((current) => {
            const existing = current.find((assignment) => assignment.workoutId === workoutId);
            if (existing) {
                return current.filter((assignment) => assignment.workoutId !== workoutId);
            }

            return [...current, { workoutId, weekdays: [] }];
        });
    };

    const toggleWeekday = (workoutId: string, weekday: number) => {
        setAssignments((current) =>
            current.map((assignment) => {
                if (assignment.workoutId !== workoutId) {
                    return assignment;
                }

                const weekdays = assignment.weekdays.includes(weekday)
                    ? assignment.weekdays.filter((value) => value !== weekday)
                    : [...assignment.weekdays, weekday].sort((a, b) => a - b);

                return {
                    ...assignment,
                    weekdays,
                };
            })
        );
    };

    const handleSave = () => {
        setError(null);

        startTransition(async () => {
            const result = await saveTrainingPlan({
                name: name.trim() || "Consistency Quest",
                focusSummary: focusSummary.trim() || undefined,
                weeklyTarget,
                timeZone,
                assignments,
            });

            if (!result.success) {
                setError(result.error || "Unable to save your training plan.");
                return;
            }

            router.push("/dashboard");
            router.refresh();
        });
    };

    return (
        <div className="flex min-h-screen bg-zinc-950">
            <Sidebar />

            <main className="flex-1 pt-16 md:pt-0 md:pl-64">
                <div className="p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
                    >
                        <div>
                            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-400/80">
                                Quest Builder
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Build Your Training Plan</h1>
                            <p className="mt-2 max-w-2xl text-zinc-400">
                                Pick the workouts you actually want to repeat, place them on the week, and FitnessFive
                                turns them into daily quests.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-400">
                            Time zone: <span className="font-medium text-white">{timeZone}</span>
                        </div>
                    </motion.div>

                    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        <Card className="border-zinc-800 bg-zinc-900/60 p-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-300">Plan name</label>
                                    <Input
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="Consistency Quest"
                                        className="border-zinc-700 bg-zinc-800"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-300">Weekly target</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={14}
                                        value={weeklyTarget}
                                        onChange={(event) => setWeeklyTarget(Math.max(1, Math.min(14, Number(event.target.value) || 1)))}
                                        className="border-zinc-700 bg-zinc-800"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-medium text-zinc-300">Focus summary</label>
                                <textarea
                                    value={focusSummary}
                                    onChange={(event) => setFocusSummary(event.target.value)}
                                    placeholder="Example: build a 4-day habit around upper/lower strength and one conditioning day."
                                    rows={4}
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-emerald-500"
                                />
                            </div>

                            {error && (
                                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                                    {error}
                                </div>
                            )}

                            <div className="mt-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white">Workout schedule</p>
                                    <p className="text-sm text-zinc-500">Choose the workouts that should become repeatable quests.</p>
                                </div>
                                <Badge className="border-0 bg-cyan-500/10 text-cyan-300">
                                    {selectedCount} selected
                                </Badge>
                            </div>

                            {!hasWorkouts && (
                                <div className="mt-6 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/70 p-8 text-center">
                                    <Swords className="mx-auto h-10 w-10 text-zinc-500" />
                                    <h2 className="mt-4 text-lg font-semibold text-white">Create workouts first</h2>
                                    <p className="mt-2 text-sm text-zinc-400">
                                        Your plan uses your saved workouts as templates. Build at least one workout before you create quests.
                                    </p>
                                    <Button
                                        onClick={() => router.push("/workout")}
                                        className="mt-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
                                    >
                                        Go to Workouts
                                    </Button>
                                </div>
                            )}

                            <div className="mt-6 space-y-4">
                                {workouts.map((workout, index) => {
                                    const assignment = getAssignment(workout.id);
                                    const selected = Boolean(assignment);

                                    return (
                                        <motion.div
                                            key={workout.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={cn(
                                                "rounded-2xl border p-4 transition-colors",
                                                selected
                                                    ? "border-emerald-500/40 bg-emerald-500/5"
                                                    : "border-zinc-800 bg-zinc-900/50"
                                            )}
                                        >
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleWorkout(workout.id)}
                                                            className={cn(
                                                                "flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-semibold transition-colors",
                                                                selected
                                                                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                                                                    : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                                                            )}
                                                        >
                                                            {selected ? "On" : "Off"}
                                                        </button>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-white">{workout.title}</h3>
                                                            <p className="text-sm text-zinc-500">
                                                                {workout.exercises.length} exercises
                                                                {workout.description ? ` • ${workout.description}` : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {selected && (
                                                    <Badge className="border-0 bg-emerald-500/10 text-emerald-300">
                                                        Quest-enabled
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="mt-4">
                                                <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                                                    Weekly slots
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {WEEKDAY_OPTIONS.map((day) => (
                                                        <button
                                                            key={day.value}
                                                            type="button"
                                                            disabled={!selected}
                                                            onClick={() => toggleWeekday(workout.id, day.value)}
                                                            className={cn(
                                                                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                                                                !selected && "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-600",
                                                                selected && assignment?.weekdays.includes(day.value)
                                                                    ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                                                                    : selected
                                                                        ? "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                                                                        : ""
                                                            )}
                                                        >
                                                            {day.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-zinc-800 bg-zinc-900/60 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-emerald-500/10 p-3">
                                        <CalendarDays className="h-6 w-6 text-emerald-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">Active Plan Summary</h2>
                                        <p className="text-sm text-zinc-500">
                                            {activePlan ? "Saving creates a new active plan and preserves your history." : "Your first plan turns the dashboard into a quest board."}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                                        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Target</p>
                                        <p className="mt-2 text-2xl font-bold text-white">{weeklyTarget} sessions / week</p>
                                    </div>
                                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-cyan-300" />
                                            <p className="text-sm font-medium text-white">Profile context</p>
                                        </div>
                                        <p className="mt-3 text-sm text-zinc-400">
                                            {profile?.firstName ? `${profile.firstName}, ` : ""}
                                            {profile?.preferredWeightUnit === "kg" ? "metric" : "imperial"} tracking
                                            {profile?.timezone ? ` • ${profile.timezone}` : ""}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-amber-300" />
                                            <p className="text-sm font-medium text-white">Quest engine</p>
                                        </div>
                                        <p className="mt-3 text-sm text-zinc-400">
                                            Scheduled workouts become daily quests with XP, streak credit, and progression events the moment you save.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSave}
                                    disabled={isPending || !hasWorkouts}
                                    className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50"
                                >
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save Active Plan
                                </Button>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
