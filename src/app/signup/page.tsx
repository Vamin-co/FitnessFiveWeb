"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const supabase = createClient();

        // Sign up the user
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setIsLoading(false);
            return;
        }

        // Update the profile with first/last name
        if (data.user) {
            await supabase
                .from("profiles")
                .update({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                })
                .eq("id", data.user.id);
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
            setSuccess(true);
            setIsLoading(false);
            return;
        }

        // If auto-confirmed, redirect to onboarding
        router.push("/onboarding");
        router.refresh();
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
                <div className="pointer-events-none fixed inset-0 bg-[url('/noise.svg')] opacity-[0.03]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center backdrop-blur-sm"
                >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Check your email</h1>
                    <p className="mt-2 text-zinc-400">
                        We&apos;ve sent a confirmation link to <strong className="text-white">{formData.email}</strong>
                    </p>
                    <p className="mt-4 text-sm text-zinc-500">
                        Click the link in the email to activate your account.
                    </p>
                    <Link href="/login">
                        <Button variant="outline" className="mt-6 border-zinc-700">
                            Back to Login
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 bg-[url('/noise.svg')] opacity-[0.03]" />
            <div className="pointer-events-none fixed -left-40 top-20 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="pointer-events-none fixed -right-40 bottom-20 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />

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
                        <h1 className="text-2xl font-bold text-white">Create your account</h1>
                        <p className="mt-2 text-zinc-400">Start your fitness journey today</p>
                    </div>

                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-sm text-zinc-400">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                    <Input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="John"
                                        className="bg-zinc-800 border-zinc-700 pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm text-zinc-400">Last Name</label>
                                <Input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    placeholder="Doe"
                                    className="bg-zinc-800 border-zinc-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm text-zinc-400">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@example.com"
                                    className="bg-zinc-800 border-zinc-700 pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm text-zinc-400">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="bg-zinc-800 border-zinc-700 pl-10"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">Minimum 6 characters</p>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50"
                        >
                            {isLoading ? "Creating account..." : "Create Account"}
                            {!isLoading && <ArrowRight className="h-4 w-4" />}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-zinc-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
                            Sign in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
