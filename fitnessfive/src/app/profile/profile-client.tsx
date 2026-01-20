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
import { Separator } from "@/components/ui/separator";
import {
    User, Ruler, Scale, Calendar, Target,
    Edit2, Save, Trophy, Flame, Dumbbell, TrendingDown, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logWeight, updateProfile, signOut } from "@/lib/actions";
import type { DashboardStats } from "@/types";

interface ProfilePageClientProps {
    profile: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        height: number | null;
        age: number | null;
        goals: string[];
        streak: number;
        createdAt: string;
    } | null;
    weightHistory: { date: string; weight: number }[];
    stats: DashboardStats;
    userEmail: string;
}

export function ProfilePageClient({
    profile,
    weightHistory,
    stats,
    userEmail
}: ProfilePageClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [newWeight, setNewWeight] = useState("");
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

    const handleLogWeight = () => {
        if (!newWeight) return;

        startTransition(async () => {
            await logWeight(parseFloat(newWeight));
            setNewWeight("");
            router.refresh();
        });
    };

    const handleSaveProfile = () => {
        startTransition(async () => {
            await updateProfile({
                firstName: formData.firstName || undefined,
                lastName: formData.lastName || undefined,
                height: formData.height ? parseFloat(formData.height) : undefined,
                age: formData.age ? parseInt(formData.age) : undefined,
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

    const achievements = [
        { name: "First Workout", icon: Dumbbell, earned: stats.workoutsThisWeek > 0 },
        { name: "7-Day Streak", icon: Flame, earned: stats.streak >= 7 },
        { name: "Weight Goal", icon: TrendingDown, earned: stats.weightChange > 5 },
        { name: "Top 10", icon: Trophy, earned: false },
    ];

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
                        <h1 className="text-3xl font-bold tracking-tight text-white">Profile</h1>
                        <p className="mt-1 text-zinc-400">Manage your account and track progress</p>
                    </motion.div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Profile Card */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
                                <div className="flex items-start justify-between">
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
                                            <p className="text-zinc-400">{userEmail}</p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Today"}
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
                                                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
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

                                {/* Stats Summary */}
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { label: "Workouts", value: stats.workoutsThisWeek, icon: Dumbbell, color: "text-cyan-400" },
                                        { label: "Streak", value: `${stats.streak} days`, icon: Flame, color: "text-orange-400" },
                                        { label: "Weight Lost", value: `${stats.weightChange} lbs`, icon: TrendingDown, color: "text-emerald-400" },
                                        { label: "Calories", value: stats.caloriesBurnedThisWeek.toLocaleString(), icon: Target, color: "text-rose-400" },
                                    ].map((stat) => (
                                        <div key={stat.label} className="rounded-xl bg-zinc-800/50 p-4 text-center">
                                            <stat.icon className={cn("mx-auto h-5 w-5 mb-2", stat.color)} />
                                            <p className="text-lg font-bold text-white">{stat.value}</p>
                                            <p className="text-xs text-zinc-500">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-6 bg-zinc-800" />

                                {/* Personal Info */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-center gap-3 rounded-xl bg-zinc-800/30 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700/50">
                                            <Ruler className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-zinc-500">Height</p>
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={formData.height}
                                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                                    placeholder="inches"
                                                    className="mt-1 h-8 bg-zinc-800 border-zinc-700"
                                                />
                                            ) : (
                                                <p className="font-medium text-white">{profile?.height || "--"} inches</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl bg-zinc-800/30 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700/50">
                                            <Scale className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500">Current Weight</p>
                                            <p className="font-medium text-white">{stats.currentWeight || "--"} lbs</p>
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
                                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                    placeholder="years"
                                                    className="mt-1 h-8 bg-zinc-800 border-zinc-700"
                                                />
                                            ) : (
                                                <p className="font-medium text-white">{profile?.age || "--"} years</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl bg-zinc-800/30 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700/50">
                                            <Target className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500">Goals</p>
                                            <p className="font-medium text-white">{profile?.goals?.length || 0} active</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Log Weight */}
                            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                    <Scale className="h-5 w-5 text-emerald-400" />
                                    Log Today&apos;s Weight
                                </h3>
                                <div className="flex gap-3">
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={newWeight}
                                        onChange={(e) => setNewWeight(e.target.value)}
                                        placeholder="Enter weight in lbs"
                                        className="flex-1 bg-zinc-800 border-zinc-700"
                                    />
                                    <Button
                                        onClick={handleLogWeight}
                                        disabled={!newWeight || isPending}
                                        className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50"
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                        Log Weight
                                    </Button>
                                </div>
                            </Card>

                            {/* Sign Out */}
                            <Button
                                variant="outline"
                                onClick={handleSignOut}
                                disabled={isPending}
                                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            >
                                Sign Out
                            </Button>
                        </div>

                        {/* Achievements */}
                        <div>
                            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                    <Trophy className="h-5 w-5 text-amber-400" />
                                    Achievements
                                </h3>
                                <div className="space-y-3">
                                    {achievements.map((achievement, index) => (
                                        <motion.div
                                            key={achievement.name}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={cn(
                                                "flex items-center gap-3 rounded-xl p-3 transition-all",
                                                achievement.earned
                                                    ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
                                                    : "bg-zinc-800/30 opacity-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-lg",
                                                achievement.earned ? "bg-amber-500/20" : "bg-zinc-700/50"
                                            )}>
                                                <achievement.icon className={cn(
                                                    "h-5 w-5",
                                                    achievement.earned ? "text-amber-400" : "text-zinc-500"
                                                )} />
                                            </div>
                                            <div>
                                                <p className={cn(
                                                    "font-medium",
                                                    achievement.earned ? "text-white" : "text-zinc-500"
                                                )}>
                                                    {achievement.name}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    {achievement.earned ? "Unlocked!" : "Locked"}
                                                </p>
                                            </div>
                                            {achievement.earned && (
                                                <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-0">
                                                    ✓
                                                </Badge>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
