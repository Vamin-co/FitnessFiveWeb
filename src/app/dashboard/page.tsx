import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
    getProfile,
    getWeightHistory,
    getTodaysRoutines,
    getDailyTasks,
    generateDailyTasks,
    getHeatmapData,
    getPlayerStats,
    getLeaderboard,
    calculateStreak,
    getRoutines
} from "@/lib/data";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Auto-generate today's tasks from routine templates
    await generateDailyTasks();

    const [
        profile,
        weightHistory,
        todaysRoutines,
        dailyTasks,
        heatmapData,
        playerStats,
        leaderboard,
        streak,
        allRoutines
    ] = await Promise.all([
        getProfile(),
        getWeightHistory(),
        getTodaysRoutines(),
        getDailyTasks(),
        getHeatmapData(120), // 4 months of data
        getPlayerStats(),
        getLeaderboard(),
        calculateStreak(),
        getRoutines(),
    ]);

    // Format today's date
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    // System date for debugging (YYYY-MM-DD)
    const systemDate = new Date().toISOString().split('T')[0];

    // Routine start dates for debugging
    const routineStartDates = allRoutines.map(r => ({
        name: r.name,
        startDate: r.startDate,
        frequencyDays: r.frequencyDays,
    }));

    return (
        <DashboardContent
            profile={profile}
            weightHistory={weightHistory}
            todaysRoutines={todaysRoutines}
            dailyTasks={dailyTasks}
            heatmapData={heatmapData}
            playerStats={playerStats}
            leaderboard={leaderboard}
            streak={streak}
            hasRoutines={allRoutines.length > 0}
            today={today}
            systemDate={systemDate}
            routineStartDates={routineStartDates}
        />
    );
}
