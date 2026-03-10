"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { completeQuest, rescheduleQuest } from "@/lib/actions";
import { cn } from "@/lib/utils";
import type { ScheduledQuest } from "@/types";
import {
    ArrowRightLeft,
    CalendarCheck2,
    CheckCircle2,
    Dumbbell,
    Loader2,
    Sparkles,
    Swords,
    Target,
} from "lucide-react";

interface DailyAgendaCardProps {
    quests: ScheduledQuest[];
    hasPlan: boolean;
    planName: string | null;
}

export function DailyAgendaCard({ quests, hasPlan, planName }: DailyAgendaCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [completingQuestId, setCompletingQuestId] = useState<string | null>(null);
    const [movingQuestId, setMovingQuestId] = useState<string | null>(null);

    const completedCount = quests.filter((quest) => quest.status === "completed").length;
    const allComplete = quests.length > 0 && completedCount === quests.length;

    const handleComplete = (questId: string) => {
        setCompletingQuestId(questId);
        startTransition(async () => {
            await completeQuest(questId);
            setCompletingQuestId(null);
            router.refresh();
        });
    };

    const handleReschedule = (questId: string) => {
        setMovingQuestId(questId);
        startTransition(async () => {
            await rescheduleQuest(questId);
            setMovingQuestId(null);
            router.refresh();
        });
    };

    if (!hasPlan) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="rounded-2xl bg-zinc-800/80 p-4 shadow-inner">
                    <Target className="h-10 w-10 text-zinc-400" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">No quests yet</h2>
                <p className="mt-2 max-w-sm text-sm text-zinc-400">
                    Your dashboard becomes a quest board once you save an active training plan.
                </p>
            </div>
        );
    }

    if (quests.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="rounded-2xl bg-indigo-500/10 p-4 shadow-inner">
                    <CalendarCheck2 className="h-10 w-10 text-indigo-400 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white tracking-tight">Recovery day</h2>
                <p className="mt-2 text-sm text-zinc-400">
                    {planName ? `${planName} has no quests due today.` : "No quests are due today."}
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col p-5 md:p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Swords className="h-6 w-6 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                        <h2 className="text-xl font-bold text-white tracking-tight">Today&apos;s Quests</h2>
                    </div>
                    {planName && (
                        <p className="mt-1 text-sm font-medium text-zinc-400">{planName}</p>
                    )}
                </div>
                <Badge className={cn(
                    "border-0 shadow-sm px-2.5 py-1 text-xs font-bold",
                    allComplete ? "bg-emerald-500/15 text-emerald-300" : "bg-cyan-500/15 text-cyan-300"
                )}>
                    {completedCount} / {quests.length}
                </Badge>
            </div>

            <div className="space-y-3">
                {quests.map((quest, index) => {
                    const isCompleted = quest.status === "completed";
                    const isCompleting = completingQuestId === quest.id;
                    const isMoving = movingQuestId === quest.id;

                    return (
                        <motion.div
                            key={quest.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className={cn(
                                "rounded-2xl border p-4 transition-colors",
                                isCompleted
                                    ? "border-emerald-500/30 bg-emerald-500/5"
                                    : "border-zinc-800 bg-zinc-950/60"
                            )}
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Dumbbell className={cn(
                                            "h-4 w-4",
                                            isCompleted ? "text-emerald-300" : "text-cyan-300"
                                        )} />
                                        <h3 className="truncate text-base font-semibold text-white">{quest.templateName}</h3>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                                        <Badge className="border-0 bg-zinc-800 text-zinc-300">
                                            {quest.exerciseCount} exercises
                                        </Badge>
                                        <Badge className="border-0 bg-amber-500/10 text-amber-300">
                                            {quest.rewardXp} XP
                                        </Badge>
                                        {quest.scheduleLabel && (
                                            <Badge className="border-0 bg-cyan-500/10 text-cyan-300">
                                                {quest.scheduleLabel}
                                            </Badge>
                                        )}
                                        {quest.focusArea && (
                                            <span className="truncate text-zinc-500">{quest.focusArea}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {!isCompleted && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isPending || isMoving || isCompleting}
                                            onClick={() => handleReschedule(quest.id)}
                                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                        >
                                            {isMoving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
                                            Tomorrow
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        disabled={isPending || isMoving || isCompleting || isCompleted}
                                        onClick={() => handleComplete(quest.id)}
                                        className={cn(
                                            "min-w-[144px]",
                                            isCompleted
                                                ? "bg-emerald-600 text-white hover:bg-emerald-600"
                                                : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
                                        )}
                                    >
                                        {isCompleting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : isCompleted ? (
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Sparkles className="mr-2 h-4 w-4" />
                                        )}
                                        {isCompleted ? "Completed" : "Complete Quest"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
