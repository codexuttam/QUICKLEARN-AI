"use client";

import Link from "next/link";
import { Sparkles, Lock, ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col">
            <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_40px]"></div>

            <nav className="relative z-10 px-6 py-8 border-b border-white/5 bg-black/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <Sparkles className="h-6 w-6 text-purple-400" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            QuickLearn.ai
                        </h1>
                    </Link>
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                        <ChevronLeft size={16} /> Back to Home
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 flex-grow max-w-4xl mx-auto px-6 py-16">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-900/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
                        <Lock className="text-blue-400" />
                    </div>
                    <h2 className="text-4xl font-bold text-white">Privacy Policy</h2>
                </div>

                <div className="space-y-12 text-gray-300 font-light leading-relaxed">
                    <section>
                        <h3 className="text-xl font-semibold text-white mb-4">1. Data Collection</h3>
                        <p>
                            We collect minimal data required to provide our learning services, including search queries and quiz results to personalize your experience.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-4">2. Use of Information</h3>
                        <p>
                            Your information is used to improve the accuracy of AI explanations and provide more relevant video recommendations. We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-4">3. Cookies and Tracking</h3>
                        <p>
                            We use essential cookies to maintain your session and preferences. We may use anonymized analytics to understand platform usage.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-4">4. Security</h3>
                        <p>
                            We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
                        </p>
                    </section>
                </div>
            </main>

            <footer className="relative z-10 py-12 border-t border-white/5 text-center text-gray-500 text-sm">
                <p>© 2024 QuickLearn.ai. All rights reserved.</p>
            </footer>
        </div>
    );
}
