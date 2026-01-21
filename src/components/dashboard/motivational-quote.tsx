"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface MotivationalQuoteProps {
    className?: string;
}

const QUOTES = [
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
    { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Gandhi" },
    { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
    { text: "Don't limit your challenges. Challenge your limits.", author: "Unknown" },
    { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
    { text: "The harder you work, the luckier you get.", author: "Gary Player" },
    { text: "Champions keep playing until they get it right.", author: "Billie Jean King" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "The body achieves what the mind believes.", author: "Unknown" },
    { text: "Fall in love with taking care of yourself.", author: "Unknown" },
    { text: "Make yourself proud.", author: "Unknown" },
    { text: "When you feel like quitting, think about why you started.", author: "Unknown" },
    { text: "Strive for progress, not perfection.", author: "Unknown" },
    { text: "Your health is an investment, not an expense.", author: "Unknown" },
    { text: "Be stronger than your strongest excuse.", author: "Unknown" },
    { text: "Sore today, strong tomorrow.", author: "Unknown" },
    { text: "Good things come to those who sweat.", author: "Unknown" },
    { text: "Every champion was once a contender that refused to give up.", author: "Rocky Balboa" },
];

// Get quote based on day of year for consistency within the same day
function getTodayQuote(): typeof QUOTES[0] {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return QUOTES[dayOfYear % QUOTES.length];
}

export function MotivationalQuote({ className }: MotivationalQuoteProps) {
    const quote = getTodayQuote();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
                "h-full flex items-center gap-4 px-4",
                className
            )}
        >
            <Quote className="h-8 w-8 text-amber-400/50 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium leading-relaxed line-clamp-2">
                    &ldquo;{quote.text}&rdquo;
                </p>
                <p className="text-zinc-500 text-xs mt-1">— {quote.author}</p>
            </div>
        </motion.div>
    );
}
