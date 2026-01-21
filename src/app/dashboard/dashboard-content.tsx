"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { BentoGrid, BentoCard } from "@/components/dashboard/bento-grid";
import { DailyAgendaCard } from "@/components/dashboard/daily-agenda-card";
import { WaterTracker } from "@/components/dashboard/water-tracker";
import { BodyStatsCard } from "@/components/dashboard/body-stats-card";
import { LogWeightCard } from "@/components/dashboard/log-weight-card";
import { MotivationalQuote } from "@/components/dashboard/motivational-quote";
import { UpcomingSchedule } from "@/components/dashboard/upcoming-schedule";
import { Button } from "@/components/ui/button";
import { Flame, Dumbbell, Plus } from "lucide-react";
import type { LeaderboardEntry, TodaysRoutine, DailyTask, HeatmapDay, Routine } from "@/types";

interface DashboardContentProps {
    profile: {
        id: string;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        weight: number | null;
        height: number | null;
        age: number | null;
        goals: string[];
        streak: number;
    } | null;
    weightHistory: { date: string; weight: number }[];
    todaysRoutines: TodaysRoutine[];
    dailyTasks: DailyTask[];
    heatmapData: HeatmapDay[];
    leaderboard: LeaderboardEntry[];
    streak: number;
    hasRoutines: boolean;
    today: string;
    systemDate: string;
    routineStartDates: { name: string; startDate: string; frequencyDays: number }[];
    allRoutines: Routine[];
    waterIntake: { total: number; target: number };
    todayWeightLog: { logged: boolean; weight: number | null };
}

export function DashboardContent({
    profile,
    todaysRoutines,
    dailyTasks,
    streak,
    hasRoutines,
    today,
    systemDate,
    routineStartDates,
    allRoutines,
    waterIntake,
    todayWeightLog,
}: DashboardContentProps) {
    const userName = profile?.username || profile?.firstName || "Champion";

    const completedTasks = dailyTasks.filter(t => t.completed).length;
    const totalTasks = dailyTasks.length;
    const allComplete = completedTasks === totalTasks && totalTasks > 0;

    return (
        <div className="flex min-h-screen bg-zinc-950">
            <Sidebar />

            {/* Main content: no left padding on mobile, pt-16 for mobile header */}
            <main className="flex-1 pt-16 md:pt-0 md:pl-64">
                <div className="p-4 md:p-8">
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

                    {/* Main Dashboard Grid - 4 columns */}
                    <BentoGrid>
                        {/* Row 1: Today's Agenda (2x2) | Hydration (1x1) | Streaks (1x1) */}

                        {/* Today's Agenda - 2 cols, 2 rows */}
                        <BentoCard colSpan={2} rowSpan={2} delay={0.1} className="p-0 overflow-hidden">
                            <DailyAgendaCard
                                dailyTasks={dailyTasks}
                                todaysRoutines={todaysRoutines}
                                hasRoutines={hasRoutines}
                                systemDate={systemDate}
                                routineStartDates={routineStartDates}
                            />
                        </BentoCard>

                        {/* Hydration - 1x1 */}
                        <BentoCard delay={0.15}>
                            <WaterTracker
                                currentOz={waterIntake.total}
                                targetOz={waterIntake.target}
                            />
                        </BentoCard>

                        {/* Streak Counter - 1x1 */}
                        <BentoCard delay={0.2}>
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500"
                                >
                                    <Flame className="h-7 w-7 text-white" />
                                </motion.div>
                                <p className="text-3xl font-bold text-white">{streak}</p>
                                <p className="text-xs text-zinc-400">Day Streak</p>
                            </div>
                        </BentoCard>

                        {/* Row 2 (right side): Log Weight (1x1) | Body Stats (1x1) */}

                        {/* Log Today's Weight - 1x1 */}
                        <BentoCard delay={0.25}>
                            <LogWeightCard
                                lastWeight={profile?.weight ?? null}
                                todayLogged={todayWeightLog.logged}
                                todayWeight={todayWeightLog.weight}
                            />
                        </BentoCard>

                        {/* Body Stats - 1x1 */}
                        <BentoCard delay={0.3}>
                            <BodyStatsCard
                                weight={profile?.weight ?? null}
                                height={profile?.height ?? null}
                                age={profile?.age ?? null}
                                goals={profile?.goals ?? []}
                            />
                        </BentoCard>

                        {/* Row 3: Motivational Quote (2x1) | Upcoming Schedule (2x1) */}

                        {/* Motivational Quote - 2 cols wide */}
                        <BentoCard colSpan={2} delay={0.35}>
                            <MotivationalQuote />
                        </BentoCard>

                        {/* Upcoming Schedule - 2 cols wide, horizontal week view */}
                        <BentoCard colSpan={2} delay={0.4}>
                            <UpcomingSchedule routines={allRoutines} />
                        </BentoCard>
                    </BentoGrid>
                </div>
            </main>
        </div>
    );
}
