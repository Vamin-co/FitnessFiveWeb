"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Scale, Check, Loader2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logWeight } from "@/lib/actions";

interface LogWeightCardProps {
    lastWeight: number | null;
    todayLogged: boolean;
    todayWeight: number | null;
    className?: string;
}

export function LogWeightCard({
    lastWeight,
    todayLogged,
    todayWeight,
    className
}: LogWeightCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [weight, setWeight] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(!todayLogged);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const weightNum = parseInt(weight, 10);
        if (isNaN(weightNum) || weightNum <= 0) return;

        startTransition(async () => {
            await logWeight(weightNum);
            setShowSuccess(true);
            setWeight("");
            setIsEditing(false);
            setTimeout(() => setShowSuccess(false), 2000);
            router.refresh();
        });
    };

    // If already logged today, show that weight with option to edit
    if (todayLogged && !isEditing) {
        return (
            <div className={cn("h-full flex flex-col", className)}>
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-violet-400" />
                        <h2 className="text-base font-semibold text-white">Today&apos;s Weight</h2>
                    </div>
                    {showSuccess && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-xs text-emerald-400 flex items-center gap-1"
                        >
                            <Check className="h-3 w-3" />
                            Saved
                        </motion.span>
                    )}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="text-center"
                    >
                        <p className="text-3xl font-bold text-white">{todayWeight}</p>
                        <p className="text-xs text-zinc-500">lbs</p>
                    </motion.div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="mt-3 text-xs text-zinc-400 hover:text-white gap-1"
                    >
                        <Edit3 className="h-3 w-3" />
                        Update
                    </Button>
                </div>
            </div>
        );
    }

    // Input mode
    return (
        <div className={cn("h-full flex flex-col", className)}>
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-violet-400" />
                    <h2 className="text-base font-semibold text-white">Log Weight</h2>
                </div>
                {todayLogged && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="text-xs text-zinc-500 hover:text-white h-6 px-2"
                    >
                        Cancel
                    </Button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center">
                <div className="relative mb-3">
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder={lastWeight ? `${lastWeight}` : "Enter weight"}
                        className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-center text-xl font-bold text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        min="50"
                        max="500"
                        disabled={isPending}
                        autoFocus={isEditing && todayLogged}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                        lbs
                    </span>
                </div>

                <Button
                    type="submit"
                    disabled={isPending || !weight}
                    className={cn(
                        "w-full gap-2 transition-all",
                        showSuccess
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-violet-500 hover:bg-violet-600"
                    )}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : showSuccess ? (
                        <>
                            <Check className="h-4 w-4" />
                            Saved!
                        </>
                    ) : todayLogged ? (
                        "Update Weight"
                    ) : (
                        "Log Today"
                    )}
                </Button>
            </form>
        </div>
    );
}
