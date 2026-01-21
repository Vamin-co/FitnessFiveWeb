"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Dumbbell, Users, User, LogOut, Repeat, X } from "lucide-react";
import { signOut } from "@/lib/actions";
import { useTransition } from "react";
import { MobileHeader } from "./mobile-header";

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMenuOpen]);

    const handleSignOut = () => {
        startTransition(async () => {
            await signOut();
            router.push("/");
            router.refresh();
        });
    };

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    return (
        <>
            {/* Mobile Header */}
            <MobileHeader isMenuOpen={isMenuOpen} onToggleMenu={toggleMenu} />

            {/* Backdrop overlay for mobile */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950",
                    "transform transition-transform duration-300 ease-in-out",
                    "md:translate-x-0",
                    isMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo - hidden on mobile (shown in mobile header) */}
                <div className="hidden h-16 items-center gap-2 border-b border-zinc-800 px-6 md:flex">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 font-bold text-white">
                        F5
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-white">
                        FitnessFive
                    </span>
                </div>

                {/* Mobile close button and spacer */}
                <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4 md:hidden">
                    <span className="text-lg font-semibold text-white">Menu</span>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-150",
                                        "min-h-[44px] hover:translate-x-1",
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
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-zinc-800 p-3">
                    <button
                        onClick={handleSignOut}
                        disabled={isPending}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-red-400 disabled:opacity-50 min-h-[44px]"
                    >
                        <LogOut className="h-5 w-5" />
                        {isPending ? "Signing out..." : "Sign Out"}
                    </button>
                </div>
            </aside>
        </>
    );
}

