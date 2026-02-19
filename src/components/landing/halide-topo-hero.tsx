"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HalideTopoHero: React.FC = () => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const layersRef = useRef<(HTMLDivElement | null)[]>([]);
    const isMobile = useRef(false);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas || isMobile.current) return;

        const x = (window.innerWidth / 2 - e.pageX) / 30;
        const y = (window.innerHeight / 2 - e.pageY) / 30;

        canvas.style.transform = `rotateX(${52 + y / 2}deg) rotateZ(${-20 + x / 2}deg)`;

        layersRef.current.forEach((layer, index) => {
            if (!layer) return;
            const depth = (index + 1) * 18;
            const moveX = x * (index + 1) * 0.15;
            const moveY = y * (index + 1) * 0.15;
            layer.style.transform = `translateZ(${depth}px) translate(${moveX}px, ${moveY}px)`;
        });
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Check if mobile or prefers-reduced-motion
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        isMobile.current = window.innerWidth < 768;

        if (isMobile.current || mediaQuery.matches) {
            canvas.style.opacity = "1";
            canvas.style.transform = "rotateX(52deg) rotateZ(-20deg) scale(0.9)";
            return;
        }

        // Entrance animation
        canvas.style.opacity = "0";
        canvas.style.transform = "rotateX(85deg) rotateZ(0deg) scale(0.7)";

        const timeout = setTimeout(() => {
            canvas.style.transition = "all 2.8s cubic-bezier(0.16, 1, 0.3, 1)";
            canvas.style.opacity = "1";
            canvas.style.transform = "rotateX(52deg) rotateZ(-20deg) scale(1)";
        }, 400);

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            clearTimeout(timeout);
        };
    }, [handleMouseMove]);

    return (
        <section className="halide-hero">
            {/* SVG Filter for Film Grain */}
            <svg
                style={{ position: "absolute", width: 0, height: 0 }}
                aria-hidden="true"
            >
                <filter id="grain">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.6"
                        numOctaves="3"
                    />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
            </svg>

            {/* Film grain overlay */}
            <div className="halide-grain" />

            {/* Interface grid with content */}
            <div className="halide-interface">
                {/* Top bar */}
                <div className="halide-topbar">
                    <div className="halide-coordinates">
                        <span>LAT 37.7749</span>
                        <span className="halide-dot" />
                        <span>LONG -122.4194</span>
                    </div>
                    <div className="halide-focal">
                        <span>FOCAL 85MM</span>
                        <span className="halide-separator">|</span>
                        <span>F/1.4</span>
                    </div>
                </div>

                {/* Hero title */}
                <div className="halide-title-block">
                    <h1 className="halide-title">
                        <span className="halide-title-line">TRACK.</span>
                        <span className="halide-title-line">IMPROVE.</span>
                        <span className="halide-title-line halide-title-accent">
                            REPEAT.
                        </span>
                    </h1>
                    <p className="halide-subtitle">
                        The fitness dashboard that keeps you focused.
                    </p>
                </div>

                {/* Bottom bar */}
                <div className="halide-bottombar">
                    <div className="halide-archive">
                        <p className="halide-archive-label">[ FITNESS FIVE ]</p>
                        <p className="halide-archive-desc">
                            PRECISION METRICS &amp; PROGRESS TRACKING
                        </p>
                    </div>
                    <Link href="/signup">
                        <Button className="halide-cta cursor-pointer">
                            START FREE
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 3D Viewport */}
            <div className="halide-viewport">
                <div className="halide-canvas" ref={canvasRef}>
                    {/* Layer 1: Primary - Dashboard image */}
                    <div
                        className="halide-layer halide-layer-1"
                        ref={(el) => {
                            layersRef.current[0] = el;
                        }}
                    >
                        <Image
                            src="/images/dashboard-preview-macView.png"
                            alt="FitnessFive Dashboard"
                            fill
                            className="object-cover object-top"
                            style={{
                                filter: "contrast(1.2) brightness(0.45)",
                            }}
                            priority
                        />
                    </div>

                    {/* Layer 2: Gradient overlay */}
                    <div
                        className="halide-layer halide-layer-2"
                        ref={(el) => {
                            layersRef.current[1] = el;
                        }}
                    />

                    {/* Layer 3: Emerald mesh */}
                    <div
                        className="halide-layer halide-layer-3"
                        ref={(el) => {
                            layersRef.current[2] = el;
                        }}
                    />

                    {/* Topographical contours */}
                    <div className="halide-contours" />
                </div>
            </div>

            {/* Scroll hint */}
            <div className="halide-scroll-hint" aria-hidden="true" />
        </section>
    );
};

export default HalideTopoHero;
