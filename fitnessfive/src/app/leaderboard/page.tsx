import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getLeaderboard, getDashboardStats } from "@/lib/data";
import { LeaderboardPageClient } from "./leaderboard-client";

export default async function LeaderboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const [leaderboard, stats] = await Promise.all([
        getLeaderboard(),
        getDashboardStats(),
    ]);

    return (
        <LeaderboardPageClient
            leaderboard={leaderboard}
            stats={stats}
            currentUserId={user.id}
        />
    );
}
