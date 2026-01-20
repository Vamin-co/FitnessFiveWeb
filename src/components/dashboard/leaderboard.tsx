"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";
import { Flame, Trophy } from "lucide-react";

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
}

export function Leaderboard({ entries, currentUserId = "me" }: LeaderboardProps) {
    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Trophy className="h-4 w-4 text-amber-400" />;
        if (rank === 2) return <span className="text-xs font-bold text-zinc-300">2nd</span>;
        if (rank === 3) return <span className="text-xs font-bold text-amber-600">3rd</span>;
        return <span className="text-xs text-zinc-500">{rank}th</span>;
    };

    return (
        <div className="flex flex-col gap-2">
            {entries.map((entry, index) => {
                const isCurrentUser = entry.userId === currentUserId;

                return (
                    <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className={cn(
                            "flex items-center gap-3 rounded-xl p-3 transition-colors",
                            isCurrentUser
                                ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
                                : "bg-zinc-800/30 hover:bg-zinc-800/50"
                        )}
                    >
                        <div className="flex h-8 w-8 items-center justify-center">
                            {getRankBadge(entry.rank)}
                        </div>
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className={cn(
                                "text-xs font-semibold",
                                isCurrentUser ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700"
                            )}>
                                {entry.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className={cn("font-medium", isCurrentUser && "text-emerald-400")}>
                                {entry.name}
                            </p>
                            <p className="text-xs text-zinc-500">{entry.score.toLocaleString()} pts</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-orange-400">
                            <Flame className="h-3.5 w-3.5" />
                            {entry.streak}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
