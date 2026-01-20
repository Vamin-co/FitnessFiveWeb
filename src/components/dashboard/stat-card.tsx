"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    accentColor?: "emerald" | "cyan" | "orange" | "violet" | "rose";
}

const accentColors = {
    emerald: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        glow: "shadow-emerald-500/20",
    },
    cyan: {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        glow: "shadow-cyan-500/20",
    },
    orange: {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        glow: "shadow-orange-500/20",
    },
    violet: {
        bg: "bg-violet-500/10",
        text: "text-violet-400",
        glow: "shadow-violet-500/20",
    },
    rose: {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        glow: "shadow-rose-500/20",
    },
};

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    accentColor = "emerald",
}: StatCardProps) {
    const colors = accentColors[accentColor];

    return (
        <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
                <div
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        colors.bg
                    )}
                >
                    <Icon className={cn("h-5 w-5", colors.text)} />
                </div>
                {trend && (
                    <span
                        className={cn(
                            "text-xs font-medium",
                            trend.isPositive ? "text-emerald-400" : "text-rose-400"
                        )}
                    >
                        {trend.isPositive ? "+" : "-"}
                        {Math.abs(trend.value)}%
                    </span>
                )}
            </div>

            <div className="mt-4">
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold tracking-tight text-white"
                >
                    {value}
                </motion.p>
                <p className="mt-1 text-sm text-zinc-400">{title}</p>
                {subtitle && (
                    <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
                )}
            </div>
        </div>
    );
}
