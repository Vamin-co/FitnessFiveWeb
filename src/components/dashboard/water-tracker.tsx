"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Droplets, Check } from "lucide-react";
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
    const [displayOz, setDisplayOz] = useState(currentOz);
    const [lastAdded, setLastAdded] = useState<number | null>(null);
    const [lastAddedKey, setLastAddedKey] = useState(0);

    // Debounced batch sync refs
    const pendingDeltaRef = useRef(0);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isSyncingRef = useRef(false);

    // Sync with server data when it changes (and we're not mid-sync)
    useEffect(() => {
        if (!isSyncingRef.current && pendingDeltaRef.current === 0) {
            setDisplayOz(currentOz);
        }
    }, [currentOz]);

    const flushToServer = useCallback(async () => {
        const delta = pendingDeltaRef.current;
        if (delta <= 0) return;

        pendingDeltaRef.current = 0;
        isSyncingRef.current = true;

        try {
            await addWater(delta);
            router.refresh();
        } catch {
            // Rollback on failure
            setDisplayOz((prev) => Math.max(0, prev - delta));
        } finally {
            isSyncingRef.current = false;
        }
    }, [router]);

    const handleAddWater = useCallback((amount: number) => {
        // Instant optimistic update
        setDisplayOz((prev) => prev + amount);
        setLastAdded(amount);
        setLastAddedKey((k) => k + 1);

        // Accumulate pending delta
        pendingDeltaRef.current += amount;

        // Reset debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Flush after 800ms of inactivity
        debounceTimerRef.current = setTimeout(() => {
            flushToServer();
        }, 800);

        // Clear the "added" indicator after a short delay
        setTimeout(() => setLastAdded(null), 1500);
    }, [flushToServer]);

    // Cleanup on unmount — flush any remaining delta
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            if (pendingDeltaRef.current > 0) {
                flushToServer();
            }
        };
    }, [flushToServer]);

    const percentage = Math.min((displayOz / targetOz) * 100, 100);
    const isComplete = displayOz >= targetOz;
    const remaining = Math.max(0, targetOz - displayOz);

    // SVG circle parameters
    const size = 100;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className={cn("h-full flex flex-col", className)}>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-400" />
                    <h2 className="text-base font-semibold text-white">Hydration</h2>
                </div>
                <AnimatePresence mode="wait">
                    {lastAdded && (
                        <motion.span
                            key={lastAddedKey}
                            initial={{ opacity: 0, y: -5, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -3 }}
                            className="text-xs text-emerald-400 flex items-center gap-1"
                        >
                            <Check className="h-3 w-3" />
                            +{lastAdded}oz
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-3">
                {/* Progress Ring */}
                <div className="relative flex justify-center items-center my-2">
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
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-white tracking-tight">
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
                        className="text-2xl font-bold tracking-tight text-white mb-0.5"
                    >
                        {displayOz}
                        <span className="text-zinc-500 font-medium text-xs tracking-normal ml-0.5"> / {targetOz}oz</span>
                    </motion.p>
                    {isComplete ? (
                        <p className="text-xs font-medium text-emerald-400 mt-1">🎉 Goal reached!</p>
                    ) : (
                        <p className="text-xs font-medium text-zinc-500 mt-1">{remaining}oz remaining</p>
                    )}
                </div>

                {/* Quick add buttons — never disabled, tactile press feedback */}
                <div className="flex gap-2 mt-2">
                    {QUICK_ADD_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleAddWater(option.value)}
                            className={cn(
                                "h-8 px-4 text-xs font-semibold rounded-md",
                                "bg-zinc-800 text-zinc-300 transition-all duration-150",
                                "hover:bg-blue-500/10 hover:text-blue-400 hover:ring-1 hover:ring-blue-500/50",
                                "active:scale-95 active:bg-blue-500/20 active:ring-blue-500",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
