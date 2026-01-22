"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        const errors: { email?: string; password?: string } = {};

        // Email validation
        if (!email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email address";
        }

        // Password validation
        if (!password) {
            errors.password = "Password is required";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        router.push(redirectTo);
        router.refresh();
    };

    // Clear field error when user starts typing
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (fieldErrors.email) {
            setFieldErrors(prev => ({ ...prev, email: undefined }));
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (fieldErrors.password) {
            setFieldErrors(prev => ({ ...prev, password: undefined }));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md"
        >
            {/* Logo */}
            <div className="mb-8 text-center">
                <Link href="/" className="inline-flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 font-bold text-white">
                        F5
                    </div>
                    <span className="text-xl font-semibold tracking-tight text-white">
                        FitnessFive
                    </span>
                </Link>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur-sm">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                    <p className="mt-2 text-zinc-400">Sign in to continue your journey</p>
                </div>

                {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} noValidate className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm text-zinc-400">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <Input
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="you@example.com"
                                className={`bg-zinc-800 border-zinc-700 pl-10 ${fieldErrors.email ? 'border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}`}
                            />
                        </div>
                        {fieldErrors.email && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1.5 flex items-center gap-1 text-xs text-red-400"
                            >
                                <AlertCircle className="h-3 w-3" />
                                {fieldErrors.email}
                            </motion.p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm text-zinc-400">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <Input
                                type="password"
                                value={password}
                                onChange={handlePasswordChange}
                                placeholder="••••••••"
                                className={`bg-zinc-800 border-zinc-700 pl-10 ${fieldErrors.password ? 'border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}`}
                            />
                        </div>
                        {fieldErrors.password && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1.5 flex items-center gap-1 text-xs text-red-400"
                            >
                                <AlertCircle className="h-3 w-3" />
                                {fieldErrors.password}
                            </motion.p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50"
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                        {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </Button>
                </form>

                <div className="mt-6 flex flex-col gap-3 text-center text-sm">
                    <Link href="/forgot-password" className="text-zinc-500 hover:text-zinc-300">
                        Forgot your password?
                    </Link>
                    <div className="text-zinc-400">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-medium text-emerald-400 hover:text-emerald-300">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function LoginFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 bg-[url('/noise.svg')] opacity-[0.03]" />
            <div className="pointer-events-none fixed -left-40 top-20 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="pointer-events-none fixed -right-40 bottom-20 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />

            <Suspense fallback={<LoginFallback />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
