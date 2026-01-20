"use client";

import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
    isMenuOpen: boolean;
    onToggleMenu: () => void;
}

export function MobileHeader({ isMenuOpen, onToggleMenu }: MobileHeaderProps) {
    return (
        <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4 backdrop-blur-sm md:hidden">
            {/* Hamburger Menu Button */}
            <button
                onClick={onToggleMenu}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
                {isMenuOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <Menu className="h-6 w-6" />
                )}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 font-bold text-white text-sm">
                    F5
                </div>
                <span className="text-lg font-semibold tracking-tight text-white">
                    FitnessFive
                </span>
            </div>

            {/* Spacer for alignment */}
            <div className="w-10" />
        </header>
    );
}
