"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Dumbbell, Users, User, LogOut, Repeat } from "lucide-react";
import { signOut } from "@/lib/actions";
import { useTransition } from "react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/routines", label: "Routines", icon: Repeat },
    { href: "/workout", label: "Workouts", icon: Dumbbell },
    { href: "/leaderboard", label: "Leaderboard", icon: Users },
    { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleSignOut = () => {
        startTransition(async () => {
            await signOut();
            router.push("/");
            router.refresh();
        });
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 font-bold text-white">
                    F5
                </div>
                <span className="text-lg font-semibold tracking-tight text-white">
                    FitnessFive
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-zinc-800 text-white"
                                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive && "text-emerald-400")} />
                                {item.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400"
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-zinc-800 p-3">
                <button
                    onClick={handleSignOut}
                    disabled={isPending}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-red-400 disabled:opacity-50"
                >
                    <LogOut className="h-5 w-5" />
                    {isPending ? "Signing out..." : "Sign Out"}
                </button>
            </div>
        </aside>
    );
}
