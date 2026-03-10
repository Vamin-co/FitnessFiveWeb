import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getActivePlanData, getProfile, getWorkouts } from "@/lib/data";
import { PlanPageClient } from "./plan-client";

export default async function PlanPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const [activePlan, workouts, profile] = await Promise.all([
        getActivePlanData(),
        getWorkouts(),
        getProfile(),
    ]);

    return (
        <PlanPageClient
            activePlan={activePlan}
            workouts={workouts}
            profile={profile}
        />
    );
}
