"use client";

import { motion } from "framer-motion";
import { User, Scale, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

interface BodyStatsCardProps {
    weight: number | null;
    height: number | null;
    age: number | null;
    goals: string[];
    className?: string;
}

// Convert height in inches to feet and inches display
function formatHeight(inches: number | null): string {
    if (!inches) return "—";
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    return `${feet}'${remainingInches}"`;
}

export function BodyStatsCard({
    weight,
    height,
    age,
    goals,
    className,
}: BodyStatsCardProps) {
    return (
        <div className={cn("h-full flex flex-col", className)}>
            <div className="mb-2 flex items-center gap-2">
                <User className="h-5 w-5 text-rose-400" />
                <h2 className="text-base font-semibold text-white">Body Stats</h2>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-2">
                {/* Weight */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-xs text-zinc-400">Weight</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {weight ? `${weight} lbs` : "—"}
                    </span>
                </div>

                {/* Height */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Ruler className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-xs text-zinc-400">Height</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {formatHeight(height)}
                    </span>
                </div>

                {/* Age */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-violet-400" />
                        <span className="text-xs text-zinc-400">Age</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {age ? `${age} yrs` : "—"}
                    </span>
                </div>
            </div>
        </div>
    );
}
