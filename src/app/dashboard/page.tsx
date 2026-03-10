import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
    getProfile,
    getWeightHistory,
    getQuestDashboard,
} from "@/lib/data";
import { getTodayWaterIntake } from "@/lib/actions";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const [
        profile,
        weightHistory,
        questDashboard,
        waterIntake
    ] = await Promise.all([
        getProfile(),
        getWeightHistory(),
        getQuestDashboard(),
        getTodayWaterIntake(),
    ]);

    // Format today's date
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    // Check if weight was logged today
    const todayDate = questDashboard.today;
    const todayWeightEntry = weightHistory.find(w => w.date === todayDate);
    const todayWeightLog = {
        logged: !!todayWeightEntry,
        weight: todayWeightEntry?.weight ?? null,
    };

    return (
        <DashboardContent
            profile={profile}
            questDashboard={questDashboard}
            hasPlan={Boolean(questDashboard.plan)}
            today={today}
            waterIntake={waterIntake}
            todayWeightLog={todayWeightLog}
        />
    );
}
