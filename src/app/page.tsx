"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Lock,
  Eye,
  Flame,
  Droplets,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HalideTopoHero from "@/components/landing/halide-topo-hero";

export default function HomePage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Scroll progress for the progress bar
  const { scrollYProgress } = useScroll();

  // Nav blur on scroll
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setNavScrolled(latest > 0.02);
  });

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div ref={pageRef} className="relative min-h-screen bg-zinc-950">
      {/* Scroll progress bar */}
      <motion.div
        className="scroll-progress"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Floating Navigation */}
      <nav
        className={`floating-nav flex items-center justify-between px-6 py-3 ${navScrolled ? "scrolled" : ""}`}
      >
        <Link
          href="/"
          className="flex items-center gap-2 cursor-pointer"
          aria-label="FitnessFive Home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 font-bold text-white text-sm shadow-lg">
            F5
          </div>
          <span
            className="text-lg font-semibold tracking-tight text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            FitnessFive
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              className="cursor-pointer text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors duration-200"
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="cursor-pointer bg-white text-zinc-900 hover:bg-zinc-200 transition-colors duration-200">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ========== HERO: Halide Topo 3D Parallax ========== */}
      <HalideTopoHero />

      {/* ========== FEATURES - Visual demos with scroll animations ========== */}
      <section className="relative py-32 lg:py-40">
        <div className="mx-auto max-w-6xl px-6">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="mb-24 text-center"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Everything you need
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mx-auto mt-4 max-w-lg text-zinc-400"
            >
              Simple tools that help you build lasting habits.
            </motion.p>
          </motion.div>

          {/* Feature cards */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Feature 1: Dashboard Stats */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
              className="glass-subtle cursor-pointer rounded-2xl p-8 transition-all duration-200 hover:border-emerald-500/20 hover:bg-white/[0.04]"
            >
              <motion.div variants={containerVariants} className="space-y-4">
                {[
                  { icon: Activity, label: "Daily Tasks", value: "5 of 8" },
                  { icon: Droplets, label: "Hydration", value: "6 glasses" },
                  { icon: Flame, label: "Streak", value: "12 days" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="flex items-center justify-between rounded-xl bg-zinc-800/50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <stat.icon
                        className="h-5 w-5 text-emerald-400"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-zinc-400">
                        {stat.label}
                      </span>
                    </div>
                    <span className="font-semibold text-white">
                      {stat.value}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
              <p
                className="mt-6 text-center text-sm font-medium text-zinc-300"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Daily Overview
              </p>
            </motion.div>

            {/* Feature 2: Streak Counter (no infinite animation per UX #12) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
              className="glass-subtle flex cursor-pointer flex-col items-center justify-center rounded-2xl p-8 transition-all duration-200 hover:border-emerald-500/20 hover:bg-white/[0.04]"
            >
              <motion.div variants={itemVariants} className="relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500"
                >
                  <Flame className="h-14 w-14 text-white" aria-hidden="true" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.4,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-xl font-bold text-white ring-4 ring-zinc-900"
                >
                  12
                </motion.div>
              </motion.div>
              <motion.p
                variants={itemVariants}
                className="mt-8 text-center text-sm font-medium text-zinc-300"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Stay Consistent
              </motion.p>
            </motion.div>

            {/* Feature 3: Animated Chart */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
              className="glass-subtle cursor-pointer rounded-2xl p-8 transition-all duration-200 hover:border-emerald-500/20 hover:bg-white/[0.04]"
            >
              <div className="flex h-40 items-end justify-between gap-2">
                {[40, 65, 45, 80, 60, 95, 75].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.1,
                      ease: [0.22, 1, 0.36, 1],
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
              <p
                className="mt-6 text-center text-sm font-medium text-zinc-300"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Track Progress
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== PRIVACY ========== */}
      <section className="border-y border-zinc-800/50 bg-zinc-900/30 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h3
              variants={itemVariants}
              className="text-2xl font-bold text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your data stays <span className="gradient-text">yours</span>
            </motion.h3>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mt-12 grid gap-8 sm:grid-cols-3"
          >
            {[
              { icon: Lock, title: "Encrypted" },
              { icon: Eye, title: "Never Sold" },
              { icon: Shield, title: "Private" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex flex-col items-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/80 transition-colors duration-200 hover:bg-zinc-700/80">
                  <item.icon
                    className="h-6 w-6 text-emerald-400"
                    aria-hidden="true"
                  />
                </div>
                <p
                  className="mt-3 font-medium text-white"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {item.title}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="relative py-32 lg:py-40">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-3xl px-6 text-center"
        >
          <h2
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Start your journey
          </h2>
          <div className="mt-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="cursor-pointer gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 px-10 py-6 text-lg text-white shadow-lg transition-all duration-200 hover:from-emerald-600 hover:to-cyan-600 hover:shadow-emerald-500/25"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-zinc-800/50 bg-zinc-900/20 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer"
            aria-label="FitnessFive Home"
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
          <p className="text-sm text-zinc-500">2026 FitnessFive</p>
        </div>
      </footer>
    </div>
  );
}
