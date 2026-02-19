"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export function ContainerScroll({
    titleComponent,
    children,
}: {
    titleComponent: string | React.ReactNode;
    children: React.ReactNode;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const shouldReduceMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const rotate = useTransform(
        scrollYProgress,
        [0, 0.8],
        shouldReduceMotion ? [0, 0] : [20, 0],
    );
    const scale = useTransform(
        scrollYProgress,
        [0, 0.8],
        shouldReduceMotion ? [1, 1] : [1.05, 1],
    );
    const translate = useTransform(
        scrollYProgress,
        [0, 0.8],
        shouldReduceMotion ? [0, 0] : [0, -80],
    );

    return (
        <div
            className="relative flex items-center justify-center pt-4 lg:pt-10"
            ref={containerRef}
            style={{ perspective: "1000px" }}
        >
            <div
                className="relative w-full"
                style={{ perspective: "1000px" }}
            >
                <Header translate={translate} titleComponent={titleComponent} />
                <Card rotate={rotate} translate={translate} scale={scale}>
                    {children}
                </Card>
            </div>
        </div>
    );
}

function Header({
    translate,
    titleComponent,
}: {
    translate: any;
    titleComponent: string | React.ReactNode;
}) {
    return (
        <motion.div
            style={{ translateY: translate }}
            className="mx-auto max-w-6xl text-center"
        >
            {titleComponent}
        </motion.div>
    );
}

function Card({
    rotate,
    scale,
    translate,
    children,
}: {
    rotate: any;
    scale: any;
    translate: any;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            style={{
                rotateX: rotate,
                scale,
                willChange: "transform",
            }}
            className="relative mx-auto -mt-4 w-full max-w-5xl"
        >
            {/* Outer glow */}
            <div
                className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-transparent to-cyan-500/20 blur-2xl"
                aria-hidden="true"
            />

            {/* MacBook-style browser frame */}
            <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/80 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-sm lg:rounded-2xl">
                {/* Window chrome */}
                <div className="flex items-center gap-3 border-b border-white/[0.06] bg-zinc-900/90 px-4 py-2.5">
                    {/* Traffic lights */}
                    <div className="flex gap-2" aria-hidden="true">
                        <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                        <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                        <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                    </div>

                    {/* URL bar */}
                    <div className="mx-auto flex max-w-sm flex-1 items-center justify-center gap-1.5 rounded-md bg-zinc-800/80 px-3 py-1">
                        <svg
                            className="h-3 w-3 text-zinc-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                            />
                        </svg>
                        <span className="text-[10px] text-zinc-500 truncate sm:text-xs">https://fitness-five-web.vercel.app</span>
                    </div>
                </div>

                {/* Content area */}
                <div className="relative w-full overflow-hidden">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
