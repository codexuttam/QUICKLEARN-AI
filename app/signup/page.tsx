"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, Mail, Lock, User, Loader2, ArrowRight, Github, ShieldAlert, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: formData.name, email: formData.email }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("Success! Check your email for a welcome message.");
                localStorage.setItem("isLoggedIn", "true");
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            } else {
                setMessage(data.error || "Something went wrong.");
            }
        } catch (error) {
            setMessage("Failed to connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_40px]"></div>

            {/* Hero Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>

            <nav className="relative z-10 px-6 py-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <Sparkles className="h-6 w-6 text-purple-400" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            QuickLearn.ai
                        </h1>
                    </Link>
                </div>
            </nav>

            <main className="flex-grow flex items-center justify-center px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                            <p className="text-gray-400">Start your personalized learning experience</p>
                        </div>

                        <AnimatePresence mode="wait">
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative p-4 rounded-2xl mb-6 flex items-center gap-3 overflow-hidden border ${message.includes("Success")
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                        }`}
                                >
                                    <div className={`absolute inset-0 opacity-10 animate-pulse ${message.includes("Success") ? "bg-emerald-500" : "bg-rose-500"
                                        }`} />

                                    <div className="relative flex items-center gap-3 w-full">
                                        <div className={`p-2 rounded-lg ${message.includes("Success") ? "bg-emerald-500/20" : "bg-rose-500/20"
                                            }`}>
                                            {message.includes("Success") ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <ShieldAlert className="h-4 w-4" />
                                            )}
                                        </div>
                                        <p className="text-sm font-medium tracking-wide">{message}</p>
                                        <button
                                            onClick={() => setMessage("")}
                                            className="ml-auto p-1 hover:bg-white/5 rounded-md transition-colors"
                                        >
                                            <X className="h-3 w-3 opacity-50" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-light"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-light"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-light"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>Create Account <ArrowRight className="h-4 w-4" /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <p className="text-gray-400 text-sm">
                                Already have an account?{" "}
                                <Link href="/login" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>

            <footer className="relative z-10 py-8 text-center">
                <p className="text-gray-500 text-xs">© 2025 QuickLearn.ai. All rights reserved.</p>
            </footer>
        </div>
    );
}
