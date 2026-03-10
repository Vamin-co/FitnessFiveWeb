import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy — FitnessFive",
    description: "Learn how FitnessFive collects, uses, and protects your personal data.",
};

const EFFECTIVE_DATE = "March 10, 2026";
const CONTACT_EMAIL = "privacy@fitnessfive.app";

export default function PrivacyPage() {
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
                        Privacy Policy
                    </h1>
                    <p className="mt-4 text-sm text-zinc-500">
                        Effective date: {EFFECTIVE_DATE}
                    </p>
                    <p className="mt-4 text-zinc-400 leading-relaxed">
                        FitnessFive is built on the principle that your data belongs to you.
                        This policy explains what we collect, why we collect it, and how we protect it.
                    </p>
                </div>

                <div className="space-y-12 text-zinc-300">

                    {/* 1 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">1. What We Collect</h2>
                        <div className="space-y-4 text-sm leading-relaxed">
                            <p><strong className="text-white">Account information.</strong> When you sign up, we collect your email address, first name, and last name. These are used solely to identify your account.</p>
                            <p><strong className="text-white">Profile & fitness data.</strong> Data you voluntarily enter — including your height, weight, age, fitness goals, workout logs, routine completions, and water intake — is stored in your personal account and is only visible to you.</p>
                            <p><strong className="text-white">Usage data.</strong> We may collect anonymous, aggregated usage information (e.g., page views, feature usage) to improve the product. This data cannot be tied back to an individual.</p>
                            <p><strong className="text-white">Leaderboard.</strong> If you set a username during onboarding, your username and streak count appear on the public leaderboard. No other personal data is shown. You can opt out by not setting a username.</p>
                        </div>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 2 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Data</h2>
                        <ul className="space-y-2 text-sm leading-relaxed list-disc list-inside marker:text-emerald-500">
                            <li>To provide and personalise your FitnessFive experience</li>
                            <li>To calculate your streaks, activity stats, and leaderboard rank</li>
                            <li>To send account-related emails (e.g. password reset, email confirmation)</li>
                            <li>To improve the product through aggregated, anonymous analytics</li>
                        </ul>
                        <p className="mt-4 text-sm leading-relaxed">
                            We do <strong className="text-white">not</strong> sell your data. We do <strong className="text-white">not</strong> use your fitness data for advertising. We do not share your personal information with third parties except as required by law.
                        </p>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 3 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">3. Data Storage & Security</h2>
                        <div className="space-y-4 text-sm leading-relaxed">
                            <p>
                                FitnessFive uses <strong className="text-white">Supabase</strong> as its database and authentication provider. Your data is stored in a Supabase-managed PostgreSQL database with Row Level Security (RLS) enforced — meaning database queries are restricted at the database level so that users can only access their own data.
                            </p>
                            <p>
                                All data is transmitted over HTTPS. Passwords are never stored in plain text; authentication is handled entirely by Supabase Auth, which uses bcrypt hashing.
                            </p>
                            <p>
                                We take reasonable technical and organisational measures to protect your data, but no method of transmission over the internet is 100% secure.
                            </p>
                        </div>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 4 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">4. Data Retention</h2>
                        <p className="text-sm leading-relaxed">
                            Your data is retained for as long as your account is active. If you delete your account, all associated personal data — including profile information, workout history, routine logs, weight entries, and water intake records — is permanently deleted from our database. This happens automatically due to cascaded foreign-key deletes on all related tables.
                        </p>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 5 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">5. Your Rights</h2>
                        <ul className="space-y-2 text-sm leading-relaxed list-disc list-inside marker:text-emerald-500">
                            <li><strong className="text-white">Access.</strong> You can view all data stored about you within the app (Profile, Dashboard).</li>
                            <li><strong className="text-white">Correction.</strong> You can update your profile information at any time from the Profile page.</li>
                            <li><strong className="text-white">Deletion.</strong> You can request full account and data deletion by emailing us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">{CONTACT_EMAIL}</a>.</li>
                            <li><strong className="text-white">Portability.</strong> You may request an export of your data in a machine-readable format.</li>
                        </ul>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 6 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">6. Cookies</h2>
                        <p className="text-sm leading-relaxed">
                            FitnessFive uses cookies solely for authentication session management (via Supabase Auth). We do not use advertising cookies, tracking pixels, or third-party analytics cookies. You can disable cookies in your browser, but this will prevent you from logging in.
                        </p>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 7 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">7. Children's Privacy</h2>
                        <p className="text-sm leading-relaxed">
                            FitnessFive is not directed at children under the age of 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal information, please contact us immediately.
                        </p>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 8 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">8. Changes to This Policy</h2>
                        <p className="text-sm leading-relaxed">
                            We may update this policy from time to time. When we do, we will update the effective date at the top of this page. Continued use of FitnessFive after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <div className="border-t border-zinc-800" />

                    {/* 9 */}
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">9. Contact</h2>
                        <p className="text-sm leading-relaxed">
                            If you have questions about this Privacy Policy or your data, please contact us at{" "}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">
                                {CONTACT_EMAIL}
                            </a>.
                        </p>
                    </section>
                </div>

                {/* Footer nav */}
                <div className="mt-16 flex flex-wrap gap-4 border-t border-zinc-800 pt-8 text-sm text-zinc-500">
                    <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
                    <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
                    <Link href="/signup" className="hover:text-zinc-300 transition-colors">Sign Up</Link>
                </div>
            </main>
        </div>
    );
}
