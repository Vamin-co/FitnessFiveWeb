"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Shield, Zap, ChartLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Subtle gradient orbs - NO GRID LINES */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="flex items-center justify-between p-6 lg:px-12">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 font-bold text-white">
              F5
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">
              FitnessFive
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
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

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-24 text-center lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400">
              <Activity className="h-4 w-4 text-emerald-400" />
              Pro-grade fitness tracking
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Fitness.{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Redefined.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 lg:text-xl">
              The most advanced activity tracking platform ever built for the web.
              Precision metrics, beautiful visualization, and privacy by design.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600">
                  Start Tracking Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-3"
          >
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Instant load times with real-time data synchronization across all devices.",
              },
              {
                icon: Shield,
                title: "Private & Secure",
                description: "Your health data is encrypted and stored securely. We never sell your data.",
              },
              {
                icon: ChartLine,
                title: "Smart Analytics",
                description: "Beautiful visualizations that help you understand your progress at a glance.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 transition-colors group-hover:bg-emerald-500/10">
                  <feature.icon className="h-6 w-6 text-zinc-400 transition-colors group-hover:text-emerald-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800 px-6 py-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <p className="text-sm text-zinc-500">© 2026 FitnessFive. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-zinc-500">
              <Link href="#" className="hover:text-zinc-300">Privacy</Link>
              <Link href="#" className="hover:text-zinc-300">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
