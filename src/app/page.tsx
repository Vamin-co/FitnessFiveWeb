"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Lock,
  Eye,
  Flame,
  Droplets,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                  */
/* ------------------------------------------------------------------ */
const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/* ------------------------------------------------------------------ */
/*  Expanding Tile Component                                            */
/* ------------------------------------------------------------------ */
function ExpandingTile({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.5"],
  });

  const borderRadius = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [16, 16] : [40, 16]);
  const scale = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [1, 1] : [0.92, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], shouldReduceMotion ? [1, 1] : [0.6, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ borderRadius, scale, opacity, willChange: "transform, border-radius" }}
      className={`${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  /* Privacy tile expanding effect */
  const { scrollYProgress: privacyProgress } = useScroll({
    target: privacyRef,
    offset: ["start end", "start 0.3"],
  });
  const privacyRadius = useTransform(privacyProgress, [0, 1], shouldReduceMotion ? [0, 0] : [48, 0]);
  const privacyScale = useTransform(privacyProgress, [0, 1], shouldReduceMotion ? [1, 1] : [0.92, 1]);

  /* CTA reveal — grows as privacy card scrolls up */
  const revealRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: revealProgress } = useScroll({
    target: revealRef,
    offset: ["start end", "end end"],
  });
  const ctaScale = useTransform(revealProgress, [0, 1], shouldReduceMotion ? [1, 1] : [0.85, 1]);
  const ctaOpacity = useTransform(revealProgress, [0, 1], shouldReduceMotion ? [1, 1] : [0.3, 1]);

  return (
    <div className="relative min-h-screen bg-[#0A0A0A]">
      <main className="relative z-10 bg-zinc-950 rounded-b-[40px] lg:rounded-b-[80px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Skip-to-content */}
        <a
          href="#features"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        {/* Ambient orbs */}
        <div
          className="pointer-events-none fixed -left-40 top-0 h-[600px] w-[600px] rounded-full bg-emerald-500/6 blur-[180px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none fixed -right-40 bottom-0 h-[600px] w-[600px] rounded-full bg-cyan-500/6 blur-[180px]"
          aria-hidden="true"
        />

        {/* =================== NAV — simple top bar, not fixed =================== */}
        <nav
          className="flex items-center justify-between px-6 py-5 lg:px-12"
          role="navigation"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="FitnessFive home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-bold text-white shadow-lg">
              F5
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              FitnessFive
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="cursor-pointer text-zinc-400 transition-colors duration-200 hover:text-white"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="cursor-pointer bg-white text-zinc-900 transition-all duration-200 hover:bg-zinc-200">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        {/* =================== HERO =================== */}
        <section ref={heroRef} className="relative overflow-x-clip px-6 pb-0">
          <ContainerScroll
            titleComponent={
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="text-center"
              >
                <h1 className="font-sans text-6xl font-bold uppercase tracking-tight text-white sm:text-7xl lg:text-8xl xl:text-[9rem] xl:leading-[0.9]">
                  Track.
                  <br />
                  <span className="gradient-text">Improve.</span>
                  <br />
                  Repeat.
                </h1>

                <p className="font-serif mx-auto mt-5 max-w-md text-lg italic leading-relaxed text-zinc-400 lg:text-xl">
                  The fitness dashboard that keeps you focused.
                </p>

                <div className="mt-8">
                  <Link href="/signup">
                    <InteractiveHoverButton text="Get Started" />
                  </Link>
                </div>
              </motion.div>
            }
          >
            {/* Dashboard screenshot */}
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src="/images/dashboard-preview-macView.png"
                alt="FitnessFive dashboard showing daily tasks, hydration tracking, streaks, and body stats"
                fill
                className="object-cover object-top"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
              />
            </div>
          </ContainerScroll>
        </section>

        {/* =================== FEATURES — Expanding tiles =================== */}
        <section
          id="features"
          className="relative py-24 lg:py-32"
          aria-label="Features"
        >
          <div className="mx-auto max-w-6xl px-6">
            {/* Section heading — serif accent */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="mb-16 text-center"
            >
              <motion.p
                variants={fadeUp}
                className="font-serif text-sm italic tracking-wide text-emerald-400"
              >
                Built for consistency
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-3 font-sans text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Everything
                <br />
                you need
              </motion.h2>
            </motion.div>

            {/* Expanding tile cards */}
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Tile 1 — Daily Overview */}
              <ExpandingTile className="feature-card glass-subtle overflow-hidden p-6 sm:p-8">
                <div className="space-y-3">
                  {[
                    { Icon: Activity, label: "Daily Tasks", value: "5 of 8" },
                    { Icon: Droplets, label: "Hydration", value: "6 glasses" },
                    { Icon: Flame, label: "Streak", value: "12 days" },
                  ].map(({ Icon, label, value }, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.1, ease: "easeOut" }}
                      className="flex items-center justify-between rounded-xl bg-zinc-800/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className="h-5 w-5 text-emerald-400"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-zinc-400">{label}</span>
                      </div>
                      <span className="font-semibold text-white">{value}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="font-serif mt-6 text-center text-sm italic text-zinc-400">
                  Daily Overview
                </p>
              </ExpandingTile>

              {/* Tile 2 — Stay Consistent */}
              <ExpandingTile
                className="feature-card glass-subtle flex flex-col items-center justify-center overflow-hidden p-6 sm:p-8"
                delay={0.1}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative"
                >
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20">
                    <Flame
                      className="h-14 w-14 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.3,
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                    className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-xl font-bold text-white ring-4 ring-zinc-900"
                  >
                    12
                  </motion.div>
                </motion.div>

                {/* Week blocks */}
                <div className="mt-6 flex gap-1">
                  {[...Array(7)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.4 + i * 0.05,
                        duration: 0.25,
                        ease: "easeOut",
                      }}
                      className={`h-7 w-7 origin-bottom rounded-sm ${i < 5
                        ? "bg-emerald-500/80"
                        : i === 5
                          ? "bg-emerald-500/30"
                          : "bg-zinc-700/50"
                        }`}
                    />
                  ))}
                </div>

                <p className="font-serif mt-6 text-center text-sm italic text-zinc-400">
                  Stay Consistent
                </p>
              </ExpandingTile>

              {/* Tile 3 — Track Progress */}
              <ExpandingTile
                className="feature-card glass-subtle overflow-hidden p-6 sm:p-8"
                delay={0.2}
              >
                <div className="flex h-40 items-end justify-between gap-2">
                  {[40, 65, 45, 80, 60, 95, 75].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: 0.15 + i * 0.07,
                        ease: "easeOut",
                      }}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-600 to-cyan-500"
                    />
                  ))}
                </div>

                <div className="mt-4 flex justify-between text-xs text-zinc-500">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>

                <p className="font-serif mt-6 text-center text-sm italic text-zinc-400">
                  Track Progress
                </p>
              </ExpandingTile>
            </div>
          </div>
        </section>

        {/* =================== PRIVACY SECTION =================== */}
        {/* This is the final section in the foreground "curtain" that scrolls up */}
        <section
          ref={privacyRef}
          className="relative z-10"
          aria-label="Privacy"
        >
          <motion.div
            style={{
              borderRadius: privacyRadius,
              scale: privacyScale,
              willChange: "transform, border-radius",
            }}
            className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 py-24 lg:py-32"
          >
            {/* Noise texture overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.18]"
              aria-hidden="true"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                backgroundSize: "128px 128px",
              }}
            />

            {/* Subtle light accent */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-emerald-500/5"
              aria-hidden="true"
            />

            <div className="relative mx-auto max-w-4xl px-6 text-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
              >
                <motion.p
                  variants={fadeUp}
                  className="font-serif text-sm italic tracking-wide text-emerald-400/80"
                >
                  Privacy first
                </motion.p>
                <motion.h3
                  variants={fadeUp}
                  className="mt-3 font-sans text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl lg:text-5xl"
                >
                  Your data stays yours
                </motion.h3>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="mt-14 grid gap-10 sm:grid-cols-3"
              >
                {[
                  { Icon: Lock, title: "Encrypted" },
                  { Icon: Eye, title: "Never Sold" },
                  { Icon: Shield, title: "Private" },
                ].map(({ Icon, title }, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="flex flex-col items-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm transition-colors duration-200 hover:bg-white/15">
                      <Icon
                        className="h-6 w-6 text-emerald-400"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white/90">{title}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

      </main> {/* End of Foreground Content */}

      {/* =================== BACKGROUND REVEAL =================== */}

      {/* Phantom spacer: sits in the document flow, triggers the useScroll hook and creates scrollable space */}
      <div
        ref={revealRef}
        className="w-full h-[100vh] pointer-events-none"
        aria-hidden="true"
      />

      {/* Fixed Footer: stays at the bottom, revealed as the foreground main content scrolls up */}
      <div
        className="fixed inset-0 z-0 bg-[#0A0A0A] flex flex-col justify-end"
      >
        {/* CTA */}
        <section
          className="relative flex items-center justify-center py-20 lg:py-28"
          aria-label="Call to action"
        >
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="h-[300px] w-[300px] rounded-full bg-emerald-500/8 blur-[120px]" />
          </div>

          <motion.div
            style={{
              scale: ctaScale,
              opacity: ctaOpacity,
              willChange: "transform, opacity",
            }}
            className="relative mx-auto max-w-3xl px-6 text-center transform-gpu origin-bottom"
          >
            <p className="font-serif text-sm italic tracking-wide text-emerald-400">
              Ready?
            </p>
            <h2 className="mt-3 font-sans text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
              Start your
              <br />
              journey
            </h2>
            <div className="mt-10">
              <Link href="/signup">
                <InteractiveHoverButton text="Get Started" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/30 px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="FitnessFive home"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-bold text-white">
                F5
              </div>
              <span className="font-semibold text-white">FitnessFive</span>
            </Link>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
              <Link
                href="#"
                className="cursor-pointer transition-colors duration-200 hover:text-zinc-300"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="cursor-pointer transition-colors duration-200 hover:text-zinc-300"
              >
                Terms
              </Link>
            </div>

            <p className="font-serif text-sm italic text-zinc-600">
              © 2026 FitnessFive
            </p>
          </div>
        </footer>
      </div>
    </div >
  );
}

