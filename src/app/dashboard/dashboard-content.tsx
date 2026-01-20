"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { BentoGrid, BentoCard } from "@/components/dashboard/bento-grid";
import { WeightChart } from "@/components/charts/weight-chart";
import { HeatmapChart } from "@/components/charts/heatmap-chart";
import { RadarStatsChart } from "@/components/charts/radar-stats-chart";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { DailyAgendaCard } from "@/components/dashboard/daily-agenda-card";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, ChartLine, TrendingUp, Dumbbell, Plus } from "lucide-react";
import type { LeaderboardEntry, TodaysRoutine, DailyTask, HeatmapDay, PlayerStats } from "@/types";

interface DashboardContentProps {
    profile: {
        id: string;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        streak: number;
    } | null;
    weightHistory: { date: string; weight: number }[];
    todaysRoutines: TodaysRoutine[];
    dailyTasks: DailyTask[];
    heatmapData: HeatmapDay[];
    playerStats: PlayerStats;
    leaderboard: LeaderboardEntry[];
    streak: number;
    hasRoutines: boolean;
    today: string;
    systemDate: string; // YYYY-MM-DD for debugging
    routineStartDates: { name: string; startDate: string; frequencyDays: number }[];
}

export function DashboardContent({
    profile,
    weightHistory,
    todaysRoutines,
    dailyTasks,
    heatmapData,
    playerStats,
    leaderboard,
    streak,
    hasRoutines,
    today,
    systemDate,
    routineStartDates,
}: DashboardContentProps) {
    const userName = profile?.username || profile?.firstName || "Champion";

    const completedTasks = dailyTasks.filter(t => t.completed).length;
    const totalTasks = dailyTasks.length;
    const allComplete = completedTasks === totalTasks && totalTasks > 0;

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
                        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
                            {today}
                        </p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
                                    Welcome back, {userName}
                                </h1>
                                {totalTasks > 0 && (
                                    <p className="mt-1 text-zinc-400">
                                        {allComplete
                                            ? "All tasks complete! You're on fire 🔥"
                                            : `${completedTasks}/${totalTasks} exercises completed today`}
                                    </p>
                                )}
                            </div>
                            <Link href="/routines">
                                <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600">
                                    <Dumbbell className="h-4 w-4" />
                                    Manage Routines
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Zero State - No Routines */}
                    {!hasRoutines && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center"
                        >
                            <Dumbbell className="mx-auto h-16 w-16 text-zinc-600" />
                            <h2 className="mt-6 text-2xl font-bold text-white">No Routines Found</h2>
                            <p className="mt-2 text-zinc-400 max-w-md mx-auto">
                                Create your first routine to start building your workout plan.
                                Tasks will be automatically generated based on your schedule.
                            </p>
                            <Link href="/routines">
                                <Button className="mt-6 gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600">
                                    <Plus className="h-4 w-4" />
                                    Create Your First Routine
                                </Button>
                            </Link>
                        </motion.div>
                    )}

                    {/* Bento Grid - Player HUD */}
                    <BentoGrid>
                        {/* Streak Counter */}
                        <BentoCard delay={0.1}>
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500"
                                >
                                    <Flame className="h-8 w-8 text-white" />
                                </motion.div>
                                <p className="text-4xl font-bold text-white">{streak}</p>
                                <p className="text-sm text-zinc-400">Day Streak</p>
                            </div>
                        </BentoCard>

                        {/* Today's Agenda Card */}
                        <BentoCard colSpan={2} delay={0.15} className="p-0 overflow-hidden">
                            <DailyAgendaCard
                                dailyTasks={dailyTasks}
                                todaysRoutines={todaysRoutines}
                                hasRoutines={hasRoutines}
                                systemDate={systemDate}
                                routineStartDates={routineStartDates}
                            />
                        </BentoCard>

                        {/* Player Stats Radar */}
                        <BentoCard delay={0.2}>
                            <div className="mb-2 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-cyan-400" />
                                <h2 className="text-lg font-semibold text-white">Your Build</h2>
                            </div>
                            <RadarStatsChart stats={playerStats} />
                        </BentoCard>

                        {/* Consistency Heatmap */}
                        <BentoCard colSpan={3} delay={0.25}>
                            <div className="mb-4 flex items-center gap-2">
                                <ChartLine className="h-5 w-5 text-emerald-400" />
                                <h2 className="text-lg font-semibold text-white">Consistency</h2>
                            </div>
                            <HeatmapChart data={heatmapData} />
                        </BentoCard>

                        {/* Weight Progress */}
                        <BentoCard colSpan={2} rowSpan={1} delay={0.3} className="min-h-[250px]">
                            <div className="mb-4 flex items-center gap-2">
                                <ChartLine className="h-5 w-5 text-violet-400" />
                                <h2 className="text-lg font-semibold text-white">Weight Trend</h2>
                            </div>
                            <div className="h-[calc(100%-40px)]">
                                {weightHistory.length > 0 ? (
                                    <WeightChart data={weightHistory} />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-zinc-500">
                                        <p>Log your weight to see trends</p>
                                    </div>
                                )}
                            </div>
                        </BentoCard>

                        {/* Leaderboard */}
                        <BentoCard colSpan={2} delay={0.35}>
                            <div className="mb-4 flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-amber-400" />
                                <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
                            </div>
                            {leaderboard.length > 0 ? (
                                <Leaderboard entries={leaderboard.slice(0, 5)} />
                            ) : (
                                <div className="flex h-32 items-center justify-center text-zinc-500">
                                    <p>Complete tasks to join the leaderboard</p>
                                </div>
                            )}
                        </BentoCard>
                    </BentoGrid>
                </div>
            </main>
        </div>
    );
}
