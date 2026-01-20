"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Check, User, Scale, Ruler, Sparkles, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkUsernameAvailable, completeOnboarding } from "@/lib/actions";

const steps = [
    { id: 1, title: "Username", icon: User },
    { id: 2, title: "Body Stats", icon: Scale },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: "",
        firstName: "",
        lastName: "",
        weight: "",
        height: "",
    });

    // Username validation state
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
    const [usernameError, setUsernameError] = useState<string | null>(null);

    // Debounced username check
    useEffect(() => {
        if (!formData.username || formData.username.length < 3) {
            setUsernameStatus('idle');
            setUsernameError(null);
            return;
        }

        setUsernameStatus('checking');
        const timer = setTimeout(async () => {
            const result = await checkUsernameAvailable(formData.username);
            if (result.available) {
                setUsernameStatus('available');
                setUsernameError(null);
            } else {
                setUsernameStatus(result.error?.includes('taken') ? 'taken' : 'invalid');
                setUsernameError(result.error || 'Username is not available');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.username]);

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleComplete = () => {
        setError(null);

        startTransition(async () => {
            const result = await completeOnboarding({
                username: formData.username,
                height: parseFloat(formData.height),
                weight: parseFloat(formData.weight),
                firstName: formData.firstName || undefined,
                lastName: formData.lastName || undefined,
            });

            if (result.success) {
                router.push("/dashboard");
                router.refresh();
            } else {
                setError(result.error || 'Something went wrong');
            }
        });
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return usernameStatus === 'available';
            case 2:
                return formData.weight !== "" && formData.height !== "";
            default:
                return true;
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
            {/* Background */}
            <div className="pointer-events-none fixed -left-40 top-20 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="pointer-events-none fixed -right-40 bottom-20 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-lg"
            >
                {/* Progress */}
                <div className="mb-8 flex items-center justify-center gap-3">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                                    currentStep >= step.id
                                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                                        : "border-zinc-700 text-zinc-500"
                                )}
                            >
                                {currentStep > step.id ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <step.icon className="h-5 w-5" />
                                )}
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "h-0.5 w-12 rounded-full transition-colors",
                                        currentStep > step.id ? "bg-emerald-500" : "bg-zinc-700"
                                    )}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur-sm">
                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {/* Step 1: Username */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-white">Choose Your Username</h2>
                                    <p className="mt-2 text-zinc-400">This is how you&apos;ll appear on the leaderboard</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm text-zinc-400">Username *</label>
                                        <div className="relative">
                                            <Input
                                                value={formData.username}
                                                onChange={(e) => updateField("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                placeholder="fitnesschamp"
                                                className={cn(
                                                    "bg-zinc-800 border-zinc-700 pr-10",
                                                    usernameStatus === 'available' && "border-emerald-500/50",
                                                    (usernameStatus === 'taken' || usernameStatus === 'invalid') && "border-red-500/50"
                                                )}
                                                maxLength={20}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {usernameStatus === 'checking' && (
                                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                                )}
                                                {usernameStatus === 'available' && (
                                                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                                                )}
                                                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                                                    <AlertCircle className="h-4 w-4 text-red-400" />
                                                )}
                                            </div>
                                        </div>
                                        {usernameError && (
                                            <p className="mt-1 text-xs text-red-400">{usernameError}</p>
                                        )}
                                        {usernameStatus === 'available' && (
                                            <p className="mt-1 text-xs text-emerald-400">Username is available!</p>
                                        )}
                                        <p className="mt-1 text-xs text-zinc-500">
                                            3-20 characters, letters, numbers, and underscores only
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm text-zinc-400">First Name</label>
                                            <Input
                                                value={formData.firstName}
                                                onChange={(e) => updateField("firstName", e.target.value)}
                                                placeholder="John"
                                                className="bg-zinc-800 border-zinc-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm text-zinc-400">Last Name</label>
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => updateField("lastName", e.target.value)}
                                                placeholder="Doe"
                                                className="bg-zinc-800 border-zinc-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Body Stats */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-white">Your Body Stats</h2>
                                    <p className="mt-2 text-zinc-400">We&apos;ll use these to track your progress</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-2 text-sm text-zinc-400">
                                            <Scale className="h-4 w-4" />
                                            Current Weight (lbs) *
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={formData.weight}
                                            onChange={(e) => updateField("weight", e.target.value)}
                                            placeholder="165"
                                            className="bg-zinc-800 border-zinc-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-2 text-sm text-zinc-400">
                                            <Ruler className="h-4 w-4" />
                                            Height (inches) *
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            value={formData.height}
                                            onChange={(e) => updateField("height", e.target.value)}
                                            placeholder="70"
                                            className="bg-zinc-800 border-zinc-700"
                                        />
                                        <p className="mt-1 text-xs text-zinc-500">
                                            5&apos;10&quot; = 70 inches, 6&apos;0&quot; = 72 inches
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="mt-8 flex items-center justify-between">
                        {currentStep > 1 ? (
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentStep((s) => s - 1)}
                                className="text-zinc-400 hover:text-white"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        ) : (
                            <div />
                        )}
                        {currentStep < 2 ? (
                            <Button
                                onClick={() => setCurrentStep((s) => s + 1)}
                                disabled={!canProceed()}
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50"
                            >
                                Continue
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                disabled={!canProceed() || isPending}
                                className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating Profile...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Enter the Arena
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
