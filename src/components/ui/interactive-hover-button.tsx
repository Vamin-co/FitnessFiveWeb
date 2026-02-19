import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text?: string;
}

export function InteractiveHoverButton({
    text = "Button",
    className,
    ...props
}: InteractiveHoverButtonProps) {
    return (
        <button
            className={cn(
                "group relative inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-emerald-500/30 hover:brightness-110 active:scale-[0.98]",
                className,
            )}
            {...props}
        >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                {text}
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
    );
}
