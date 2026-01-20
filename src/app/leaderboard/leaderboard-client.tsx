"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
    Trophy, Flame, Ghost, ChartLine,
    ArrowUp, ArrowDown, Minus, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry, DashboardStats } from "@/types";

interface LeaderboardPageClientProps {
    leaderboard: (LeaderboardEntry & { isCurrentUser?: boolean })[];
    stats: DashboardStats;
    currentUserId: string;
}

export function LeaderboardPageClient({
    leaderboard,
    stats,
    currentUserId
}: LeaderboardPageClientProps) {
    const [ghostMode, setGhostMode] = useState(false);
    const [selectedGhost, setSelectedGhost] = useState<LeaderboardEntry | null>(null);

    const currentUser = leaderboard.find((e) => e.isCurrentUser);

    const compareStats = (mine: number, theirs: number) => {
        if (mine > theirs) return { direction: "up" as const, diff: mine - theirs };
        if (mine < theirs) return { direction: "down" as const, diff: theirs - mine };
        return { direction: "same" as const, diff: 0 };
    };

    return (
        <div className="flex min-h-screen bg-zinc-950">
            <Sidebar />

            <main className="flex-1 pl-64">
                <div className="p-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-white">Leaderboard</h1>
                                <p className="mt-1 text-zinc-400">Compete with friends and track your ranking</p>
                            </div>
                            <Button
                                onClick={() => setGhostMode(!ghostMode)}
                                variant={ghostMode ? "default" : "outline"}
                                className={cn(
                                    "gap-2",
                                    ghostMode
                                        ? "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border-violet-500/50"
                                        : "border-zinc-700 text-zinc-400 hover:text-white"
                                )}
                            >
                                <Ghost className="h-4 w-4" />
                                Ghost Mode
                            </Button>
                        </div>
                    </motion.div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Leaderboard */}
                        <div className="lg:col-span-2">
                            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
                                <div className="mb-6 flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-amber-400" />
                                    <h2 className="text-lg font-semibold text-white">Weekly Rankings</h2>
                                </div>

                                {leaderboard.length > 0 ? (
                                    <div className="space-y-2">
                                        {leaderboard.map((entry, index) => {
                                            const isCurrentUser = entry.isCurrentUser;
                                            const isTopThree = entry.rank <= 3;

                                            return (
                                                <motion.div
                                                    key={entry.userId}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={cn(
                                                        "group relative flex items-center gap-4 rounded-xl p-4 transition-all",
                                                        isCurrentUser
                                                            ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
                                                            : "bg-zinc-800/30 hover:bg-zinc-800/50",
                                                        ghostMode && !isCurrentUser && "cursor-pointer hover:ring-2 hover:ring-violet-500/50"
                                                    )}
                                                    onClick={() => {
                                                        if (ghostMode && !isCurrentUser) {
                                                            setSelectedGhost(entry);
                                                        }
                                                    }}
                                                >
                                                    {/* Rank */}
                                                    <div className={cn(
                                                        "flex h-10 w-10 items-center justify-center rounded-xl font-bold",
                                                        entry.rank === 1 && "bg-amber-500/20 text-amber-400",
                                                        entry.rank === 2 && "bg-zinc-400/20 text-zinc-300",
                                                        entry.rank === 3 && "bg-orange-600/20 text-orange-500",
                                                        entry.rank > 3 && "bg-zinc-700/50 text-zinc-400"
                                                    )}>
                                                        {entry.rank}
                                                    </div>

                                                    {/* Avatar & Name */}
                                                    <Avatar className="h-11 w-11">
                                                        <AvatarFallback className={cn(
                                                            "text-sm font-semibold",
                                                            isCurrentUser ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700"
                                                        )}>
                                                            {entry.name.split(" ").map((n) => n[0]).join("")}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("font-semibold", isCurrentUser && "text-emerald-400")}>
                                                                {entry.name}
                                                            </span>
                                                            {isCurrentUser && (
                                                                <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">
                                                                    You
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-zinc-500">
                                                            <span>{entry.score.toLocaleString()} pts</span>
                                                            <span className="flex items-center gap-1 text-orange-400">
                                                                <Flame className="h-3.5 w-3.5" />
                                                                {entry.streak} day streak
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Rank Badge for Top 3 */}
                                                    {isTopThree && (
                                                        <div className={cn(
                                                            "flex h-8 w-8 items-center justify-center rounded-full",
                                                            entry.rank === 1 && "bg-amber-500",
                                                            entry.rank === 2 && "bg-zinc-400",
                                                            entry.rank === 3 && "bg-orange-600"
                                                        )}>
                                                            <Trophy className="h-4 w-4 text-white" />
                                                        </div>
                                                    )}

                                                    {/* Ghost Mode Indicator */}
                                                    {ghostMode && !isCurrentUser && (
                                                        <Ghost className="h-5 w-5 text-violet-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <Trophy className="mx-auto h-12 w-12 text-zinc-600" />
                                        <h3 className="mt-4 text-lg font-semibold text-white">No rankings yet</h3>
                                        <p className="mt-1 text-zinc-400">Complete workouts to join the leaderboard</p>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Stats / Ghost Comparison Panel */}
                        <div className="space-y-6">
                            {/* Your Stats */}
                            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <ChartLine className="h-5 w-5 text-cyan-400" />
                                    <h2 className="text-lg font-semibold text-white">Your Stats</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400">Score</span>
                                        <span className="text-xl font-bold text-white">{currentUser?.score?.toLocaleString() || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400">Rank</span>
                                        <span className="text-xl font-bold text-white">#{currentUser?.rank || '--'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400">Streak</span>
                                        <span className="text-xl font-bold text-orange-400">{stats.streak} days</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400">Workouts</span>
                                        <span className="text-xl font-bold text-emerald-400">{stats.workoutsThisWeek}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Ghost Comparison */}
                            {selectedGhost && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Card className="border-violet-500/30 bg-violet-500/5 p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Ghost className="h-5 w-5 text-violet-400" />
                                                <h2 className="text-lg font-semibold text-violet-400">Ghost Compare</h2>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedGhost(null)}
                                                className="text-zinc-500 hover:text-white"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="mb-4 flex items-center gap-3 rounded-lg bg-zinc-800/50 p-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-violet-500/20 text-violet-400">
                                                    {selectedGhost.name.split(" ").map((n) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-white">{selectedGhost.name}</p>
                                                <p className="text-xs text-zinc-500">Rank #{selectedGhost.rank}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { label: "Score", yours: currentUser?.score || 0, theirs: selectedGhost.score },
                                                { label: "Streak", yours: stats.streak, theirs: selectedGhost.streak },
                                            ].map((stat) => {
                                                const comparison = compareStats(stat.yours, stat.theirs);
                                                return (
                                                    <div key={stat.label} className="flex items-center justify-between rounded-lg bg-zinc-800/30 p-3">
                                                        <span className="text-sm text-zinc-400">{stat.label}</span>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-sm text-zinc-300">{stat.yours}</span>
                                                            <div className={cn(
                                                                "flex items-center gap-1 text-xs font-medium",
                                                                comparison.direction === "up" && "text-emerald-400",
                                                                comparison.direction === "down" && "text-rose-400",
                                                                comparison.direction === "same" && "text-zinc-500"
                                                            )}>
                                                                {comparison.direction === "up" && <ArrowUp className="h-3 w-3" />}
                                                                {comparison.direction === "down" && <ArrowDown className="h-3 w-3" />}
                                                                {comparison.direction === "same" && <Minus className="h-3 w-3" />}
                                                                {comparison.diff}
                                                            </div>
                                                            <span className="text-sm text-violet-400">{stat.theirs}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Card>
                                </motion.div>
                            )}

                            {ghostMode && !selectedGhost && (
                                <Card className="border-dashed border-violet-500/30 bg-violet-500/5 p-6 text-center">
                                    <Ghost className="mx-auto h-10 w-10 text-violet-400/50" />
                                    <p className="mt-3 text-sm text-violet-400">Select a user to compare</p>
                                    <p className="text-xs text-zinc-500">Click on any name in the leaderboard</p>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
