"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
    Calendar,
    Dumbbell,
    Edit2,
    Eye,
    EyeOff,
    Flame,
    Loader2,
    Save,
    Scale,
    Target,
    Trophy,
    User,
    Users,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createGoal, signOut, updateProfile } from "@/lib/actions";
import type { Achievement, DashboardStats, GoalProgress, GoalType } from "@/types";

interface ProfilePageClientProps {
    profile: {
        id: string;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        height: number | null;
        age: number | null;
        goals: string[];
        streak: number;
        createdAt: string;
        preferredWeightUnit?: string;
        timezone?: string;
    } | null;
    weightHistory: { date: string; weight: number }[];
    stats: DashboardStats;
    achievements: Achievement[];
    goals: GoalProgress[];
    userEmail: string;
}

const goalTypeOptions: Array<{
    value: GoalType;
    label: string;
    description: string;
}> = [
        { value: "streak_days", label: "Streak days", description: "Build a streak of completed quest days." },
        { value: "sessions_per_week", label: "Sessions per week", description: "Hit a weekly completion target." },
        { value: "adherence", label: "Adherence", description: "Raise completed quests as a percentage of due quests." },
        { value: "body_weight", label: "Body weight", description: "Move toward a target body weight." },
    ];

function getGoalDefaults(goalType: GoalType, preferredWeightUnit: string | undefined) {
    if (goalType === "body_weight") {
        return {
            title: "Target body weight",
            unit: preferredWeightUnit === "kg" ? "kg" : "lbs",
        };
    }

    if (goalType === "sessions_per_week") {
        return {
            title: "Weekly session target",
            unit: "sessions",
        };
    }

    if (goalType === "adherence") {
        return {
            title: "Adherence rate",
            unit: "%",
        };
    }

    return {
        title: "Streak target",
        unit: "days",
    };
}

function getAchievementIcon(achievementId: string) {
    switch (achievementId) {
        case "first-quest":
            return Dumbbell;
        case "streak-7":
            return Flame;
        case "league-starter":
            return Users;
        case "pr-hunter":
            return Zap;
        default:
            return Trophy;
    }
}

export function ProfilePageClient({
    profile,
    weightHistory,
    stats,
    achievements,
    goals,
    userEmail,
}: ProfilePageClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [emailVisible, setEmailVisible] = useState(false);
    const [goalError, setGoalError] = useState<string | null>(null);
    const [goalType, setGoalType] = useState<GoalType>("streak_days");
    const initialGoalDefaults = getGoalDefaults("streak_days", profile?.preferredWeightUnit);
    const [goalForm, setGoalForm] = useState({
        title: initialGoalDefaults.title,
        targetValue: "",
        unit: initialGoalDefaults.unit,
        targetDate: "",
    });
    const [formData, setFormData] = useState({
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        height: profile?.height?.toString() || "",
        age: profile?.age?.toString() || "",
    });

    const getInitials = () => {
        const first = profile?.firstName?.charAt(0) || "U";
        const last = profile?.lastName?.charAt(0) || "";
        return `${first}${last}`.toUpperCase();
    };

    const maskEmail = (email: string) => {
        const [local, domain] = email.split("@");
        if (!domain) return "***";
        const visible = local.charAt(0);
        return `${visible}***@${domain}`;
    };

    const handleSaveProfile = () => {
        startTransition(async () => {
            await updateProfile({
                firstName: formData.firstName || undefined,
                lastName: formData.lastName || undefined,
                height: formData.height ? parseFloat(formData.height) : undefined,
                age: formData.age ? parseInt(formData.age, 10) : undefined,
            });
            setIsEditing(false);
            router.refresh();
        });
    };

    const handleSignOut = () => {
        startTransition(async () => {
            await signOut();
            router.push("/");
            router.refresh();
        });
    };

    const handleGoalTypeChange = (nextGoalType: GoalType) => {
        const defaults = getGoalDefaults(nextGoalType, profile?.preferredWeightUnit);
        setGoalType(nextGoalType);
        setGoalError(null);
        setGoalForm((current) => ({
            ...current,
            title: defaults.title,
            unit: defaults.unit,
        }));
    };

    const handleCreateGoal = () => {
        setGoalError(null);

        startTransition(async () => {
            const result = await createGoal({
                goalType,
                title: goalForm.title,
                targetValue: Number(goalForm.targetValue),
                unit: goalForm.unit,
                targetDate: goalForm.targetDate || undefined,
            });

            if (!result.success) {
                setGoalError(result.error || "Unable to create goal.");
                return;
            }

            const defaults = getGoalDefaults(goalType, profile?.preferredWeightUnit);
            setGoalForm({
                title: defaults.title,
                targetValue: "",
                unit: defaults.unit,
                targetDate: "",
            });
            router.refresh();
        });
    };

    return (
        <div className="flex min-h-screen bg-zinc-950">
            <Sidebar />

            <main className="flex-1 pt-16 md:pt-0 md:pl-64">
                <div className="p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold tracking-tight text-white">Profile</h1>
                        <p className="mt-1 text-zinc-400">Manage your account, track progression, and tune your goals.</p>
                    </motion.div>

                    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-6">
                            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-2xl font-bold text-white">
                                                {getInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">
                                                {profile?.firstName || "User"} {profile?.lastName || ""}
                                            </h2>
                                            {profile?.username && (
                                                <p className="font-medium text-emerald-400">@{profile.username}</p>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm text-zinc-400">
                                                    {emailVisible ? userEmail : maskEmail(userEmail)}
                                                </p>
                                                <button
                                                    onClick={() => setEmailVisible((v) => !v)}
                                                    className="p-0.5 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
                                                    aria-label={emailVisible ? "Hide email" : "Show email"}
                                                >
                                                    {emailVisible ? (
                                                        <EyeOff className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <Eye className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Today"}
                                                {profile?.timezone ? ` • ${profile.timezone}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleSaveProfile}
                                                disabled={isPending}
                                                className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                                            >
                                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                                Save
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsEditing(true)}
                                                className="border-zinc-700 text-zinc-400 hover:text-white"
                                            >
                                                <Edit2 className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <Separator className="my-6 bg-zinc-800" />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-center gap-3 rounded-xl bg-zinc-800/30 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700/50">
                                            <User className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-zinc-500">First name</p>
                                            {isEditing ? (
                                                <Input
                                                    value={formData.firstName}
                                                    onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
                                                    className="mt-1 h-8 border-zinc-700 bg-zinc-800"
                                                />
                                            ) : (
                                                <p className="font-medium text-white">{profile?.firstName || "--"}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl bg-zinc-800/30 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700/50">
                                            <User className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-zinc-500">Last name</p>
                                            {isEditing ? (
                                                <Input
                                                    value={formData.lastName}
                                                    onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
                                                    className="mt-1 h-8 border-zinc-700 bg-zinc-800"
                                                />
                                            ) : (
                                                <p className="font-medium text-white">{profile?.lastName || "--"}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl bg-zinc-800/30 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700/50">
                                            <Scale className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500">Current weight</p>
                                            <p className="font-medium text-white">
                                                {stats.currentWeight || "--"} {profile?.preferredWeightUnit || "lbs"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl bg-zinc-800/30 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700/50">
                                            <Calendar className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-zinc-500">Age</p>
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={formData.age}
                                                    onChange={(event) => setFormData({ ...formData, age: event.target.value })}
                                                    className="mt-1 h-8 border-zinc-700 bg-zinc-800"
                                                />
                                            ) : (
                                                <p className="font-medium text-white">{profile?.age || "--"} yrs</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 md:grid-cols-3">
                                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                                        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Streak</p>
                                        <p className="mt-2 text-2xl font-bold text-white">{stats.streak}</p>
                                        <p className="text-sm text-zinc-500">quest days</p>
                                    </div>
                                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                                        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Work logged</p>
                                        <p className="mt-2 text-2xl font-bold text-white">{weightHistory.length}</p>
                                        <p className="text-sm text-zinc-500">weight entries</p>
                                    </div>
                                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                                        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Goals</p>
                                        <p className="mt-2 text-2xl font-bold text-white">{goals.length}</p>
                                        <p className="text-sm text-zinc-500">tracked goals</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-cyan-300" />
                                    <h3 className="text-lg font-semibold text-white">Goals</h3>
                                </div>
                                <p className="mt-2 text-sm text-zinc-500">
                                    Goals are evaluated against real quest and weight data, not hardcoded counters.
                                </p>

                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm text-zinc-400">Goal type</label>
                                        <select
                                            value={goalType}
                                            onChange={(event) => handleGoalTypeChange(event.target.value as GoalType)}
                                            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                                        >
                                            {goalTypeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="mt-2 text-xs text-zinc-500">
                                            {goalTypeOptions.find((option) => option.value === goalType)?.description}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm text-zinc-400">Goal title</label>
                                        <Input
                                            value={goalForm.title}
                                            onChange={(event) => setGoalForm({ ...goalForm, title: event.target.value })}
                                            className="border-zinc-700 bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm text-zinc-400">Target value</label>
                                        <Input
                                            type="number"
                                            value={goalForm.targetValue}
                                            onChange={(event) => setGoalForm({ ...goalForm, targetValue: event.target.value })}
                                            className="border-zinc-700 bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm text-zinc-400">Unit</label>
                                        <Input
                                            value={goalForm.unit}
                                            onChange={(event) => setGoalForm({ ...goalForm, unit: event.target.value })}
                                            className="border-zinc-700 bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm text-zinc-400">Target date</label>
                                        <Input
                                            type="date"
                                            value={goalForm.targetDate}
                                            onChange={(event) => setGoalForm({ ...goalForm, targetDate: event.target.value })}
                                            className="border-zinc-700 bg-zinc-800"
                                        />
                                    </div>
                                </div>

                                {goalError && (
                                    <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                                        {goalError}
                                    </div>
                                )}

                                <Button
                                    onClick={handleCreateGoal}
                                    disabled={isPending || !goalForm.title.trim() || !goalForm.targetValue}
                                    className="mt-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
                                >
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Create Goal
                                </Button>

                                <div className="mt-6 space-y-4">
                                    {goals.length > 0 ? (
                                        goals.map((goal) => (
                                            <div key={goal.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="font-medium text-white">{goal.title}</p>
                                                        <p className="mt-1 text-sm text-zinc-500">
                                                            {goal.currentValue.toFixed(goal.unit === "%" ? 0 : 1)} / {goal.targetValue} {goal.unit}
                                                        </p>
                                                    </div>
                                                    <Badge className={cn(
                                                        "border-0",
                                                        goal.achieved ? "bg-emerald-500/15 text-emerald-300" : "bg-cyan-500/15 text-cyan-300"
                                                    )}>
                                                        {goal.achieved ? "Achieved" : `${goal.progressPercent}%`}
                                                    </Badge>
                                                </div>
                                                <Progress
                                                    value={goal.progressPercent}
                                                    className="mt-4 bg-zinc-800"
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-5 text-sm text-zinc-500">
                                            No goals yet. Create one and FitnessFive will keep it in sync with your quest data.
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Button
                                variant="outline"
                                onClick={handleSignOut}
                                disabled={isPending}
                                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            >
                                Sign Out
                            </Button>
                        </div>

                        <div>
                            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-amber-400" />
                                    <h3 className="text-lg font-semibold text-white">Achievements</h3>
                                </div>
                                <p className="mt-2 text-sm text-zinc-500">
                                    Unlocks are now stored in the database and triggered by quest progression events.
                                </p>

                                <div className="mt-5 space-y-3">
                                    {achievements.map((achievement, index) => {
                                        const Icon = getAchievementIcon(achievement.id);
                                        return (
                                            <motion.div
                                                key={achievement.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.06 }}
                                                className={cn(
                                                    "rounded-2xl border p-4 transition-colors",
                                                    achievement.earned
                                                        ? "border-emerald-500/30 bg-emerald-500/5"
                                                        : "border-zinc-800 bg-zinc-950/60"
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={cn(
                                                        "flex h-11 w-11 items-center justify-center rounded-xl",
                                                        achievement.earned ? "bg-amber-500/15" : "bg-zinc-800"
                                                    )}>
                                                        <Icon className={cn(
                                                            "h-5 w-5",
                                                            achievement.earned ? "text-amber-300" : "text-zinc-500"
                                                        )} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className={cn(
                                                                "font-medium",
                                                                achievement.earned ? "text-white" : "text-zinc-400"
                                                            )}>
                                                                {achievement.title}
                                                            </p>
                                                            {achievement.earned && (
                                                                <Badge className="border-0 bg-emerald-500/15 text-emerald-300">
                                                                    Unlocked
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-sm text-zinc-500">{achievement.description}</p>
                                                        {achievement.unlockedAt && (
                                                            <p className="mt-2 text-xs text-zinc-500">
                                                                {new Date(achievement.unlockedAt).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
