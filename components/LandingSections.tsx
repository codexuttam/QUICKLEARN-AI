"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Shield, Brain, MousePointer2, Target, MessageSquare } from "lucide-react";

export const Features = () => {
    const features = [
        {
            title: "AI-Powered Explanations",
            description: "Get complex topics broken down into simple, easy-to-understand concepts using Gemini 2.0 Flash.",
            icon: <Brain className="h-6 w-6 text-purple-400" />
        },
        {
            title: "Curated Video Content",
            description: "Automatically find the best YouTube videos to supplement your learning for any topic.",
            icon: <Target className="h-6 w-6 text-blue-400" />
        },
        {
            title: "Multiple Learning Styles",
            description: "Choose between Concise, Advanced, Storytelling, and more to match how you learn best.",
            icon: <Zap className="h-6 w-6 text-pink-400" />
        },
        {
            title: "Interactive Quizzes",
            description: "Test your knowledge immediately after learning with AI-generated quizzes.",
            icon: <MousePointer2 className="h-6 w-6 text-green-400" />
        }
    ];

    return (
        <>
            <section id="features" className="py-24 relative overflow-hidden bg-slate-950/30">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Master Any Subject in Minutes
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            QuickLearn combines the power of generative AI with curated educational content to give you the most efficient learning experience possible.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl hover:border-purple-500/50 transition-all group"
                            >
                                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-900/20 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="about" className="py-24 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                Our Mission: Democratizing Learning
                            </h2>
                            <p className="text-gray-400 mb-6 text-lg leading-relaxed font-light">
                                We believe that everyone deserves access to high-quality, personalized education. QuickLearn was built to bridge the gap between complex information and effective learning.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                    </div>
                                    <p className="text-gray-300">Personalized learning paths for every student.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                    </div>
                                    <p className="text-gray-300">Accessibility to complex topics through AI simplification.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                                    </div>
                                    <p className="text-gray-300">Merging video content with AI-driven insights.</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-blue-500/30 blur-[80px] rounded-full"></div>
                            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                                <div className="flex items-center gap-2 mb-6">
                                    <MessageSquare className="text-purple-400" />
                                    <span className="text-white font-medium">Why QuickLearn?</span>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        "Quantum physics is now as clear as crystal. The storytelling mode helped me visualize abstract concepts I've struggled with for years."
                                    </p>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        "The integration between AI explanations and curated YouTube videos provides a double-layered learning approach that actually sticks."
                                    </p>
                                    <p className="text-gray-300 text-sm leading-relaxed font-light">
                                        Our assistant analyzes thousands of data points to ensure every explanation is accurate, concise, and tailored to your specific background.
                                    </p>
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-600"></div>
                                    <div>
                                        <div className="text-white font-medium">AI Teaching Assistant</div>
                                        <div className="text-gray-500 text-sm">Powered by Gemini 2.0</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export const Footer = () => {
    return (
        <footer className="py-12 border-t border-slate-900/50 relative">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center space-x-2">
                        <Brain className="h-6 w-6 text-purple-400" />
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            QuickLearn.ai
                        </span>
                    </div>

                    <div className="flex gap-8 text-sm text-gray-500">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">Discord</a>
                    </div>

                    <p className="text-gray-500 text-sm">
                        © 2025 QuickLearn.ai. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
