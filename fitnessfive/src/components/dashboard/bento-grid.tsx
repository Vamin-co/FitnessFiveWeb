"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    colSpan?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2;
    delay?: number;
}

export function BentoCard({
    children,
    className,
    colSpan = 1,
    rowSpan = 1,
    delay = 0,
}: BentoCardProps) {
    const colSpanClasses = {
        1: "col-span-1",
        2: "col-span-1 md:col-span-2",
        3: "col-span-1 md:col-span-2 lg:col-span-3",
        4: "col-span-1 md:col-span-2 lg:col-span-4",
    };

    const rowSpanClasses = {
        1: "row-span-1",
        2: "row-span-1 md:row-span-2",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.4,
                delay: delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className={cn(
                "group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm",
                "transition-colors duration-300 hover:border-zinc-700 hover:bg-zinc-900/80",
                colSpanClasses[colSpan],
                rowSpanClasses[rowSpan],
                className
            )}
        >
            {/* Subtle gradient glow on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
            </div>
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}

interface BentoGridProps {
    children: React.ReactNode;
    className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4",
                className
            )}
        >
            {children}
        </div>
    );
}
