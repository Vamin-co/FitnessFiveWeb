import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getRoutinesWithExercises, getDailyTasks, generateDailyTasks, getWorkouts } from "@/lib/data";
import { RoutinesPageClient } from "./routines-client";

export default async function RoutinesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Auto-generate today's tasks
    await generateDailyTasks();

    const [routines, dailyTasks, workouts] = await Promise.all([
        getRoutinesWithExercises(),
        getDailyTasks(),
        getWorkouts(),
    ]);

    return (
        <RoutinesPageClient
            routines={routines}
            dailyTasks={dailyTasks}
            workouts={workouts}
        />
    );
}
