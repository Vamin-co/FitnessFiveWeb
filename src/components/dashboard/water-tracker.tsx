"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { Droplets, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addWater } from "@/lib/actions";

interface WaterTrackerProps {
    currentOz: number;
    targetOz: number;
    className?: string;
}

const QUICK_ADD_OPTIONS = [
    { label: "+8", value: 8 },
    { label: "+16", value: 16 },
    { label: "+32", value: 32 },
];

export function WaterTracker({
    currentOz,
    targetOz,
    className,
}: WaterTrackerProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [displayOz, setDisplayOz] = useState(currentOz);
    const [lastAdded, setLastAdded] = useState<number | null>(null);

    // Sync with server data when it changes
    useEffect(() => {
        setDisplayOz(currentOz);
    }, [currentOz]);

    const percentage = Math.min((displayOz / targetOz) * 100, 100);
    const isComplete = displayOz >= targetOz;

    const handleAddWater = (amount: number) => {
        // Optimistic update
        setDisplayOz((prev) => prev + amount);
        setLastAdded(amount);

        startTransition(async () => {
            await addWater(amount);
            router.refresh();
            // Clear the "added" indicator after a short delay
            setTimeout(() => setLastAdded(null), 1500);
        });
    };

    // SVG circle parameters
    const size = 60;
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className={cn("h-full flex flex-col", className)}>
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-400" />
                    <h2 className="text-base font-semibold text-white">Hydration</h2>
                </div>
                {lastAdded && (
                    <motion.span
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-emerald-400 flex items-center gap-1"
                    >
                        <Check className="h-3 w-3" />
                        +{lastAdded}oz
                    </motion.span>
                )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                {/* Progress Ring */}
                <div className="relative">
                    <svg width={size} height={size} className="transform -rotate-90">
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="#27272a"
                            strokeWidth={strokeWidth}
                        />
                        <motion.circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={isComplete ? "#10b981" : "#3b82f6"}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                            {Math.round(percentage)}%
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="text-center">
                    <motion.p
                        key={displayOz}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-lg font-bold text-white"
                    >
                        {displayOz}
                        <span className="text-zinc-500 text-xs font-normal"> / {targetOz}oz</span>
                    </motion.p>
                    {isComplete && (
                        <p className="text-[10px] text-emerald-400">🎉 Goal reached!</p>
                    )}
                </div>

                {/* Quick add buttons */}
                <div className="flex gap-1.5">
                    {QUICK_ADD_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddWater(option.value)}
                            disabled={isPending}
                            className="h-6 px-2 text-[10px] border-zinc-700 hover:border-blue-500 hover:bg-blue-500/10 text-zinc-300"
                        >
                            {isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                option.label
                            )}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
