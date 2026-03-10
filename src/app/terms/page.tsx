import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service — FitnessFive",
    description: "Read the Terms of Service governing your use of FitnessFive.",
};

const EFFECTIVE_DATE = "March 10, 2026";
const CONTACT_EMAIL = "legal@fitnessfive.app";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Nav */}
            <nav className="flex items-center justify-between px-6 py-5 lg:px-12 border-b border-zinc-800/50">
                <Link href="/" className="flex items-center gap-2.5" aria-label="FitnessFive home">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-bold text-white shadow-lg">
                        F5
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-white">FitnessFive</span>
                </Link>
                <Link
                    href="/"
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                    ← Back to home
                </Link>
            </nav>

            {/* Content */}
            <main className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
                {/* Header */}
                <div className="mb-12">
                    <p className="font-serif text-sm italic text-emerald-400">Legal</p>
                    <h1 className="mt-3 text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
                        Terms of Service
                    </h1>
                    <p className="mt-4 text-sm text-zinc-500">
                        Effective date: {EFFECTIVE_DATE}
                    </p>
                    <p className="mt-4 text-zinc-400 leading-relaxed">
                        By using FitnessFive, you agree to these Terms of Service. Please read them carefully.
                        If you do not agree, you may not use the service.
                    </p>
                </div>

                <div className="space-y-12 text-zinc-300">

                    {/* 1 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                        <p className="text-sm leading-relaxed">
                            These Terms of Service ("Terms") govern your access to and use of FitnessFive ("the Service"), operated by FitnessFive ("we", "us", or "our"). By creating an account or using the Service, you confirm that you are at least 13 years old and agree to be bound by these Terms.
                        </p>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 2 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
                        <p className="text-sm leading-relaxed">
                            FitnessFive is a personal fitness tracking application that allows users to log workouts, track hydration, build routines, monitor weight progress, and compete on a leaderboard. The Service is provided for personal, non-commercial use only.
                        </p>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 3 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">3. User Accounts</h2>
                        <div className="space-y-3 text-sm leading-relaxed">
                            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</p>
                            <p>You must provide accurate information when creating your account. You may not use another person's account or impersonate any individual or entity.</p>
                            <p>You must notify us immediately if you suspect unauthorised access to your account at <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">{CONTACT_EMAIL}</a>.</p>
                            <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>
                        </div>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 4 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">4. Acceptable Use</h2>
                        <p className="text-sm leading-relaxed mb-3">You agree not to:</p>
                        <ul className="space-y-2 text-sm leading-relaxed list-disc list-inside marker:text-emerald-500">
                            <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
                            <li>Attempt to gain unauthorised access to any part of the Service or other users' accounts</li>
                            <li>Artificially manipulate leaderboard rankings, streaks, or gamification data</li>
                            <li>Interfere with or disrupt the integrity or performance of the Service</li>
                            <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                            <li>Scrape, crawl, or harvest data from the Service using automated means</li>
                            <li>Transmit any harmful, offensive, or malicious content</li>
                        </ul>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 5 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">5. User Content</h2>
                        <div className="space-y-3 text-sm leading-relaxed">
                            <p>You retain ownership of all fitness data, workout logs, and other content you submit to FitnessFive ("User Content").</p>
                            <p>By submitting User Content, you grant us a limited, non-exclusive licence to store and process it solely for the purpose of providing the Service to you.</p>
                            <p>You are solely responsible for the accuracy of your User Content. FitnessFive does not verify fitness data and accepts no liability for decisions made based on information within the Service.</p>
                        </div>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 6 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">6. Health Disclaimer</h2>
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-relaxed">
                            <p className="text-amber-300 font-medium mb-2">Important health notice</p>
                            <p>
                                FitnessFive is a fitness tracking tool, not a medical application. The Service does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before starting any new exercise or nutrition programme, especially if you have a pre-existing medical condition or injury. Use the Service at your own risk.
                            </p>
                        </div>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 7 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">7. Leaderboard & Public Features</h2>
                        <div className="space-y-3 text-sm leading-relaxed">
                            <p>The leaderboard displays usernames and streak counts of users who have completed onboarding. By setting a username, you consent to your username and streak being displayed publicly to other authenticated users.</p>
                            <p>We reserve the right to remove accounts from the leaderboard or reset stats that are determined to be the result of fraudulent activity.</p>
                        </div>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 8 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">8. Intellectual Property</h2>
                        <p className="text-sm leading-relaxed">
                            All content, design, code, and materials comprising the Service (excluding User Content) are the exclusive property of FitnessFive and are protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any part of the Service without our express written consent.
                        </p>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 9 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">9. Service Availability</h2>
                        <p className="text-sm leading-relaxed">
                            We strive to keep FitnessFive available at all times, but we do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service at any time without prior notice. We are not liable for any loss or inconvenience arising from service interruptions.
                        </p>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 10 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">10. Limitation of Liability</h2>
                        <p className="text-sm leading-relaxed">
                            To the maximum extent permitted by applicable law, FitnessFive shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to loss of data, personal injury, or health-related consequences resulting from exercise activities tracked within the Service.
                        </p>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 11 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">11. Account Termination</h2>
                        <p className="text-sm leading-relaxed">
                            You may delete your account at any time by contacting us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">{CONTACT_EMAIL}</a>. Upon deletion, all your personal data will be permanently erased per our <Link href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</Link>. We may terminate or suspend your account for violations of these Terms without notice.
                        </p>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 12 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">12. Changes to Terms</h2>
                        <p className="text-sm leading-relaxed">
                            We may revise these Terms from time to time. We will update the effective date at the top of this page when changes are made. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.
                        </p>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 13 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">13. Contact</h2>
                        <p className="text-sm leading-relaxed">
                            For questions about these Terms, please contact us at{" "}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">
                                {CONTACT_EMAIL}
                            </a>.
                        </p>
                    </section>
                </div>

                {/* Footer nav */}
                <div className="mt-16 flex flex-wrap gap-4 border-t border-zinc-800 pt-8 text-sm text-zinc-500">
                    <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
                    <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
                    <Link href="/signup" className="hover:text-zinc-300 transition-colors">Sign Up</Link>
                </div>
            </main>
        </div>
    );
}
