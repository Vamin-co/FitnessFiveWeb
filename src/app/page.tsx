"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Activity,
  Shield,
  Zap,
  ChartLine,
  Flame,
  Lock,
  Eye,
  Droplets,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed -left-40 top-0 h-[600px] w-[600px] rounded-full bg-emerald-500/8 blur-[150px]" />
      <div className="pointer-events-none fixed -right-40 bottom-0 h-[600px] w-[600px] rounded-full bg-cyan-500/8 blur-[150px]" />
      <div className="pointer-events-none fixed left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />

      {/* ========== STICKY NAVIGATION ========== */}
      <nav
        className={`sticky-nav flex items-center justify-between px-6 py-4 lg:px-12 ${scrolled ? "scrolled" : ""
          }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 font-bold text-white shadow-lg">
            F5
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            FitnessFive
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-white text-zinc-900 hover:bg-zinc-200">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-400">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>Pro-grade fitness tracking for the web</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Track Your Progress.
            <br />
            <span className="gradient-text">Crush Your Goals.</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 lg:text-xl">
            A beautifully designed dashboard that makes tracking your fitness
            journey simple, motivating, and actually enjoyable.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 text-white shadow-lg hover:from-emerald-600 hover:to-cyan-600 hover:shadow-emerald-500/20"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-white"
              onClick={() => {
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See How It Works
            </Button>
          </div>
        </motion.div>

        {/* Product Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="relative mx-auto mt-16 max-w-5xl lg:mt-20"
        >
          {/* Glow behind the frame */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-transparent to-cyan-500/20 blur-2xl" />

          {/* Glass frame */}
          <div className="glass product-shadow relative overflow-hidden rounded-2xl p-2 lg:rounded-3xl lg:p-3">
            {/* Browser-like header */}
            <div className="flex items-center gap-2 border-b border-zinc-800/50 px-3 pb-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
              </div>
              <div className="ml-4 flex-1">
                <div className="mx-auto max-w-xs rounded-md bg-zinc-800/60 px-3 py-1 text-center text-xs text-zinc-500">
                  fitness-five-web.vercel.app/dashboard
                </div>
              </div>
            </div>

            {/* Screenshot container */}
            <div className="relative mt-2 aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-900">
              <Image
                src="/images/dashboard-preview-macView.png"
                alt="FitnessFive Dashboard"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========== FEATURE DEEP-DIVES ========== */}
      <section id="features" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Everything you need to{" "}
              <span className="gradient-text">stay on track</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
              A thoughtfully designed experience that keeps you motivated and
              focused on what matters.
            </p>
          </motion.div>

          {/* Feature 1: Smart Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24 grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
          >
            <div className="order-2 lg:order-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
                <Target className="h-4 w-4" />
                Smart Dashboard
              </div>
              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                Your entire fitness picture, at a glance
              </h3>
              <p className="mt-4 text-lg text-zinc-400">
                A beautiful bento-grid layout brings together your daily tasks,
                upcoming routines, weight tracking, and hydration goals—all in
                one unified view.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Daily task checklist with smart scheduling",
                  "Weight and body stats tracking over time",
                  "Water intake tracker with visual progress",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-300">
                    <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-subtle order-1 rounded-2xl p-6 lg:order-2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Activity, label: "Daily Tasks", value: "5 of 8" },
                  { icon: Droplets, label: "Hydration", value: "6 glasses" },
                  { icon: ChartLine, label: "This Week", value: "+2.3 lbs" },
                  { icon: Flame, label: "Streak", value: "12 days" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-zinc-800/50 p-4 text-center"
                  >
                    <stat.icon className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                    <p className="mt-1 font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Streaks & Gamification */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24 grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
          >
            <div className="glass-subtle rounded-2xl p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
                    <Flame className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-lg font-bold text-white ring-4 ring-zinc-900">
                    12
                  </div>
                </div>
                <p className="mt-6 text-lg font-semibold text-white">
                  Day Streak
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Keep it going! You&apos;re on fire.
                </p>
                <div className="mt-6 flex w-full justify-center gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-8 w-8 rounded-md ${i < 5
                        ? "bg-emerald-500/80"
                        : i === 5
                          ? "bg-emerald-500/40"
                          : "bg-zinc-700"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-sm text-orange-400">
                <Trophy className="h-4 w-4" />
                Motivation Built-In
              </div>
              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                Streaks that keep you coming back
              </h3>
              <p className="mt-4 text-lg text-zinc-400">
                Build unbreakable habits with daily streaks, activity heatmaps,
                and leaderboards. Compete with friends or just beat your
                personal best.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Visual streak counter with fire animation",
                  "GitHub-style activity heatmap",
                  "Friendly competition leaderboard",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-300">
                    <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                      <div className="h-2 w-2 rounded-full bg-orange-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Feature 3: Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
          >
            <div className="order-2 lg:order-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-400">
                <ChartLine className="h-4 w-4" />
                Beautiful Analytics
              </div>
              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                See your progress like never before
              </h3>
              <p className="mt-4 text-lg text-zinc-400">
                Stunning charts and visualizations help you understand your
                journey. Track weight trends, workout frequency, and more with
                clarity.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Clean, minimal chart design",
                  "Historical data at your fingertips",
                  "Export your data anytime",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-300">
                    <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                      <div className="h-2 w-2 rounded-full bg-cyan-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-subtle order-1 rounded-2xl p-6 lg:order-2">
              {/* Fake chart visualization */}
              <div className="space-y-3">
                <div className="flex items-end justify-between gap-2 h-32">
                  {[40, 65, 45, 80, 60, 95, 75].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-600 to-cyan-500"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== TRUST BAR ========== */}
      <section className="border-y border-zinc-800/50 bg-zinc-900/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold text-white sm:text-3xl">
              Your data stays <span className="gradient-text">yours</span>
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-zinc-400">
              Privacy isn&apos;t an afterthought—it&apos;s fundamental to how we
              built FitnessFive.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-12 grid gap-8 sm:grid-cols-3"
          >
            {[
              {
                icon: Lock,
                title: "End-to-End Secure",
                desc: "Your health data is encrypted and protected at every step.",
              },
              {
                icon: Eye,
                title: "No Data Selling",
                desc: "We never sell, share, or monetize your personal information.",
              },
              {
                icon: Shield,
                title: "Privacy First",
                desc: "Minimal data collection. Maximum respect for your privacy.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/80">
                  <item.icon className="h-7 w-7 text-emerald-400" />
                </div>
                <h4 className="font-semibold text-white">{item.title}</h4>
                <p className="mt-2 text-sm text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="relative py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl px-6 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to transform your
            <br />
            <span className="gradient-text">fitness journey?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
            Join FitnessFive today and start building habits that last. It&apos;s
            free to get started.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 px-10 py-6 text-lg text-white shadow-lg hover:from-emerald-600 hover:to-cyan-600 hover:shadow-emerald-500/25"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-zinc-800/50 bg-zinc-900/20 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-bold text-white">
              F5
            </div>
            <span className="font-semibold text-white">FitnessFive</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
            <Link href="#" className="transition-colors hover:text-zinc-300">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors hover:text-zinc-300">
              Terms of Service
            </Link>
            <Link href="#" className="transition-colors hover:text-zinc-300">
              Contact
            </Link>
          </div>
          <p className="text-sm text-zinc-500">
            © 2026 FitnessFive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
