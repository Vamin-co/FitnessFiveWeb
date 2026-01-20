"use client";

import { motion } from "framer-motion";
import { ChevronRight, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkoutListItem {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    duration?: number;
    exercises: { id: string; name: string }[];
    createdAt: Date | string;
}

interface WorkoutListProps {
    workouts: WorkoutListItem[];
    onSelectWorkout?: (id: string) => void;
}

export function WorkoutList({ workouts, onSelectWorkout }: WorkoutListProps) {
    if (workouts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <Dumbbell className="h-10 w-10 text-zinc-600" />
                <p className="mt-3 text-sm text-zinc-400">No workouts yet</p>
                <p className="text-xs text-zinc-500">Start your first workout today!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {workouts.map((workout, index) => (
                <motion.button
                    key={workout.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelectWorkout?.(workout.id)}
                    className="group flex items-center gap-3 rounded-xl bg-zinc-800/50 p-3 text-left transition-colors hover:bg-zinc-800"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700/50 transition-colors group-hover:bg-emerald-500/20">
                        <Dumbbell className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-white">{workout.title}</p>
                        <p className="text-xs text-zinc-500">
                            {workout.exercises.length} exercises · {workout.duration || "--"} min
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {workout.completed ? (
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0">
                                Done
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-0">
                                Active
                            </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-zinc-500 transition-transform group-hover:translate-x-1" />
                    </div>
                </motion.button>
            ))}
        </div>
    );
}
