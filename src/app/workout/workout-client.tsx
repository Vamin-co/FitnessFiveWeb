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
    Plus, Trash2, Save, Dumbbell, X,
    Search, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createWorkout, deleteWorkout } from "@/lib/actions";

// Common exercise suggestions
const EXERCISE_SUGGESTIONS = [
    "Push-ups", "Pull-ups", "Squats", "Deadlifts", "Bench Press",
    "Shoulder Press", "Bicep Curls", "Tricep Dips", "Lunges", "Plank",
    "Burpees", "Mountain Climbers", "Crunches", "Leg Raises", "Russian Twists",
    "Lat Pulldown", "Leg Press", "Calf Raises", "Hip Thrusts", "Row Machine"
];

interface Exercise {
    name: string;
    targetSets: number;
    targetReps: number;
    weight?: number;
}

interface WorkoutPageClientProps {
    initialWorkouts: {
        id: string;
        title: string;
        description: string | null;
        completed: boolean;
        exercises: { id: string; name: string; targetSets: number; targetReps: number }[];
        createdAt: string;
    }[];
}

export function WorkoutPageClient({ initialWorkouts }: WorkoutPageClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const filteredSuggestions = EXERCISE_SUGGESTIONS.filter(
        (s) => s.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addExercise = (name?: string) => {
        setExercises([
            ...exercises,
            {
                name: name || "",
                targetSets: 3,
                targetReps: 12,
                weight: undefined,
            },
        ]);
    };

    const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
        const updated = [...exercises];
        updated[index] = { ...updated[index], [field]: value };
        setExercises(updated);
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!title.trim() || exercises.length === 0) return;

        startTransition(async () => {
            const result = await createWorkout({
                title,
                description: description || undefined,
                exercises,
            });

            if (result.success) {
                setTitle("");
                setDescription("");
                setExercises([]);
                setIsCreating(false);
                router.refresh();
            }
        });
    };

    const handleDelete = async (workoutId: string) => {
        setDeletingId(workoutId);
        startTransition(async () => {
            await deleteWorkout(workoutId);
            setDeletingId(null);
            router.refresh();
        });
    };

    return (
        <div className="flex min-h-screen bg-zinc-950">
            <Sidebar />

            <main className="flex-1 pt-16 md:pt-0 md:pl-64">
                <div className="p-4 md:p-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Workouts</h1>
                            <p className="mt-1 text-zinc-400">Create and manage your workout routines</p>
                        </div>
                        {!isCreating && (
                            <Button
                                onClick={() => setIsCreating(true)}
                                className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
                            >
                                <Plus className="h-4 w-4" />
                                New Workout
                            </Button>
                        )}
                    </motion.div>

                    {/* Create Workout Form */}
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
                                        <h2 className="text-xl font-semibold text-white">Create New Workout</h2>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsCreating(false)}
                                            className="text-zinc-400 hover:text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Basic Info */}
                                    <div className="mb-6 grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm text-zinc-400">Workout Name</label>
                                            <Input
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="e.g., Morning Power Routine"
                                                className="bg-zinc-800 border-zinc-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm text-zinc-400">Description (optional)</label>
                                            <Input
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="e.g., High-intensity morning workout"
                                                className="bg-zinc-800 border-zinc-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Exercises */}
                                    <div className="mb-6">
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className="text-sm font-medium text-zinc-300">Exercises</label>
                                            <div className="relative">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                                        <Input
                                                            value={searchQuery}
                                                            onChange={(e) => {
                                                                setSearchQuery(e.target.value);
                                                                setShowSuggestions(true);
                                                            }}
                                                            onFocus={() => setShowSuggestions(true)}
                                                            placeholder="Search exercises..."
                                                            className="w-60 bg-zinc-800 border-zinc-700 pl-9"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addExercise()}
                                                        className="border-zinc-700 text-zinc-300"
                                                    >
                                                        <Plus className="mr-1 h-4 w-4" />
                                                        Add Empty
                                                    </Button>
                                                </div>

                                                {/* Suggestions Dropdown */}
                                                {showSuggestions && searchQuery && (
                                                    <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-60 overflow-auto rounded-lg border border-zinc-700 bg-zinc-800 shadow-xl">
                                                        {filteredSuggestions.length > 0 ? (
                                                            filteredSuggestions.map((suggestion) => (
                                                                <button
                                                                    key={suggestion}
                                                                    onClick={() => {
                                                                        addExercise(suggestion);
                                                                        setSearchQuery("");
                                                                        setShowSuggestions(false);
                                                                    }}
                                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700"
                                                                >
                                                                    <Dumbbell className="h-4 w-4 text-emerald-400" />
                                                                    {suggestion}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-3 py-2 text-sm text-zinc-500">No matches found</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Exercise List */}
                                        <div className="space-y-3">
                                            {exercises.map((exercise, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4"
                                                >
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-sm font-semibold text-emerald-400">
                                                        {index + 1}
                                                    </span>
                                                    <Input
                                                        value={exercise.name}
                                                        onChange={(e) => updateExercise(index, "name", e.target.value)}
                                                        placeholder="Exercise name"
                                                        className="flex-1 bg-zinc-800 border-zinc-700"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] uppercase text-zinc-500">Sets</span>
                                                            <Input
                                                                type="number"
                                                                value={exercise.targetSets}
                                                                onChange={(e) => updateExercise(index, "targetSets", parseInt(e.target.value) || 0)}
                                                                className="w-16 bg-zinc-800 border-zinc-700 text-center"
                                                            />
                                                        </div>
                                                        <span className="text-zinc-600">×</span>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] uppercase text-zinc-500">Reps</span>
                                                            <Input
                                                                type="number"
                                                                value={exercise.targetReps}
                                                                onChange={(e) => updateExercise(index, "targetReps", parseInt(e.target.value) || 0)}
                                                                className="w-16 bg-zinc-800 border-zinc-700 text-center"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] uppercase text-zinc-500">Weight</span>
                                                            <Input
                                                                type="number"
                                                                value={exercise.weight || ""}
                                                                onChange={(e) => updateExercise(index, "weight", parseInt(e.target.value) || 0)}
                                                                placeholder="lbs"
                                                                className="w-20 bg-zinc-800 border-zinc-700 text-center"
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeExercise(index)}
                                                        className="text-zinc-500 hover:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </motion.div>
                                            ))}

                                            {exercises.length === 0 && (
                                                <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
                                                    <Dumbbell className="mx-auto h-10 w-10 text-zinc-600" />
                                                    <p className="mt-2 text-sm text-zinc-500">No exercises added yet</p>
                                                    <p className="text-xs text-zinc-600">Search above or add an empty exercise</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

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
                                            onClick={handleSave}
                                            disabled={!title.trim() || exercises.length === 0 || isPending}
                                            className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50"
                                        >
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Save Workout
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Existing Workouts */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {initialWorkouts.map((workout, index) => (
                            <motion.div
                                key={workout.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="group border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-white">{workout.title}</h3>
                                            {workout.description && (
                                                <p className="mt-0.5 text-sm text-zinc-500">{workout.description}</p>
                                            )}
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "border-0",
                                                workout.completed
                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                    : "bg-cyan-500/10 text-cyan-400"
                                            )}
                                        >
                                            {workout.completed ? "Completed" : "Active"}
                                        </Badge>
                                    </div>

                                    <div className="mb-4 space-y-1">
                                        {workout.exercises.slice(0, 3).map((ex) => (
                                            <div key={ex.id} className="flex items-center gap-2 text-sm text-zinc-400">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                {ex.name} · {ex.targetSets}×{ex.targetReps}
                                            </div>
                                        ))}
                                        {workout.exercises.length > 3 && (
                                            <p className="text-xs text-zinc-500">
                                                +{workout.exercises.length - 3} more exercises
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">
                                            {new Date(workout.createdAt).toLocaleDateString()}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(workout.id)}
                                            disabled={deletingId === workout.id}
                                            className="text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                                        >
                                            {deletingId === workout.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}

                        {initialWorkouts.length === 0 && !isCreating && (
                            <div className="col-span-full rounded-xl border border-dashed border-zinc-700 p-12 text-center">
                                <Dumbbell className="mx-auto h-12 w-12 text-zinc-600" />
                                <h3 className="mt-4 text-lg font-semibold text-white">No workouts yet</h3>
                                <p className="mt-1 text-zinc-400">Create your first workout to get started</p>
                                <Button
                                    onClick={() => setIsCreating(true)}
                                    className="mt-4 gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Workout
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
