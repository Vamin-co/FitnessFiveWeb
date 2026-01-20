import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getWorkouts } from "@/lib/data";
import { WorkoutPageClient } from "./workout-client";

export default async function WorkoutPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const workouts = await getWorkouts();

    return <WorkoutPageClient initialWorkouts={workouts} />;
}
