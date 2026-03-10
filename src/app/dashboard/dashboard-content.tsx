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
import type { QuestDashboardData } from "@/types";

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
        preferredWeightUnit?: string;
    } | null;
    questDashboard: QuestDashboardData;
    hasPlan: boolean;
    today: string;
    waterIntake: { total: number; target: number };
    todayWeightLog: { logged: boolean; weight: number | null };
}

export function DashboardContent({
    profile,
    questDashboard,
    hasPlan,
    today,
    waterIntake,
    todayWeightLog,
}: DashboardContentProps) {
    const userName = profile?.username || profile?.firstName || "Champion";
    const completedQuests = questDashboard.todayQuests.filter((quest) => quest.status === "completed").length;
    const totalQuests = questDashboard.todayQuests.length;
    const allComplete = completedQuests === totalQuests && totalQuests > 0;

    return (
        <div className="flex h-screen bg-zinc-950">
            <Sidebar />

            {/* Main content: no left padding on mobile, pt-16 for mobile header */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0 md:pl-64 bg-zinc-950">
                <div className="p-4 md:p-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                    >
                        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
                            {today}
                        </p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
                                    Welcome back, {userName}
                                </h1>
                                {questDashboard.plan?.focusSummary && (
                                    <p className="mt-1 text-sm text-emerald-300/80">
                                        {questDashboard.plan.focusSummary}
                                    </p>
                                )}
                                {totalQuests > 0 && (
                                    <p className="mt-1 text-zinc-400">
                                        {allComplete
                                            ? "All quests complete. Keep the streak alive."
                                            : `${completedQuests}/${totalQuests} quests cleared today`}
                                    </p>
                                )}
                            </div>
                            <Link href="/plan">
                                <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600">
                                    <Dumbbell className="h-4 w-4" />
                                    Manage Plan
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Zero State - No Plan */}
                    {!hasPlan && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center"
                        >
                            <Dumbbell className="mx-auto h-16 w-16 text-zinc-600" />
                            <h2 className="mt-6 text-2xl font-bold text-white">No Active Plan</h2>
                            <p className="mt-2 text-zinc-400 max-w-md mx-auto">
                                Build a weekly plan from your saved workouts. FitnessFive will convert each scheduled day
                                into a quest with streak credit and progression events.
                            </p>
                            <Link href="/plan">
                                <Button className="mt-6 gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600">
                                    <Plus className="h-4 w-4" />
                                    Create Your First Plan
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
                                quests={questDashboard.todayQuests}
                                hasPlan={hasPlan}
                                planName={questDashboard.plan?.name || null}
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
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <p className="text-6xl font-black tracking-tight text-white mb-2">
                                    {questDashboard.streak}
                                </p>
                                <div className="flex items-center justify-center gap-1.5 text-zinc-400">
                                    <Flame className="h-4 w-4 text-orange-500" fill="currentColor" />
                                    <p className="text-[11px] font-bold uppercase tracking-widest">
                                        Day Streak
                                    </p>
                                </div>
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
                            <UpcomingSchedule weekSchedule={questDashboard.weekSchedule} />
                        </BentoCard>
                    </BentoGrid>
                </div>
            </main>
        </div>
    );
}
