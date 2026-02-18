'use client'

import React from 'react'
import Link from 'next/link'
import { Brain, ArrowRight, CheckCircle2, Zap, Shield, Sparkles } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#ffffff] text-[#37352f] overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-[#e9e9e7]">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#37352f] rounded-lg flex items-center justify-center">
                            <Brain className="text-white" size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Second Brain</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <a href="#features" className="hover:text-[#2eaadc] transition-colors">Features</a>
                        <a href="#about" className="hover:text-[#2eaadc] transition-colors">About</a>
                        <Link href="/login" className="hover:text-[#2eaadc] transition-colors">Login</Link>
                        <Link
                            href="/register"
                            className="px-4 py-2 bg-[#37352f] text-white rounded-full hover:bg-[#2f2d28] transition-all shadow-lg shadow-[#37352f]/10"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-6 animate-fade-in">
                        <Sparkles size={12} />
                        <span>AI-Powered Life Management</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                        Build your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Digital Second Brain</span>
                    </h1>

                    <p className="text-xl text-[#787774] max-w-2xl mx-auto mb-10 leading-relaxed">
                        The all-in-one workspace to capture notes, track habits, manage projects, and achieve your goals. Simple, powerful, and beautiful.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="w-full sm:w-auto px-8 py-4 bg-[#37352f] text-white rounded-2xl font-semibold text-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#37352f]/20"
                        >
                            Start for Free <ArrowRight size={20} />
                        </Link>
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-white border border-[#e9e9e7] text-[#37352f] rounded-2xl font-semibold text-lg hover:bg-[#f7f7f5] transition-all"
                        >
                            View Demo
                        </Link>
                    </div>

                    {/* Hero Image / UI Mockup */}
                    <div className="mt-20 relative animate-float">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-[2.5rem] blur-2xl opacity-50" />
                        <div className="relative border border-[#e9e9e7] rounded-[2rem] overflow-hidden shadow-2xl bg-white">
                            <div className="h-8 bg-[#f7f7f5] flex items-center gap-1.5 px-4 border-b border-[#e9e9e7]">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
                                alt="App Screenshot"
                                className="w-full h-auto opacity-90"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Group */}
            <section id="features" className="py-24 bg-[#fcfcfc] border-y border-[#e9e9e7]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Core Components</h2>
                        <p className="text-[#9b9a97]">Everything you need to stay organized in one place.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="text-blue-500" />}
                            title="Quick Capture"
                            description="Instantly add tasks, notes, or ideas from anywhere in the app with our global Ctrl+K search."
                        />
                        <FeatureCard
                            icon={<CheckCircle2 className="text-green-500" />}
                            title="Task Management"
                            description="Track your daily habits and to-dos with simple lists, boards, and calendar views."
                        />
                        <FeatureCard
                            icon={<Shield className="text-purple-500" />}
                            title="Secure Knowledge"
                            description="Write notes in a clean, Notion-like editor and organize them into specialized life areas."
                        />
                    </div>
                </div>
            </section>

            {/* Social Proof / Trust */}
            <section className="py-20 text-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#9b9a97] mb-8">Trusted by productive individuals</h3>
                <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
                    <span className="font-bold text-xl tracking-tighter italic">NOTION-ISH</span>
                    <span className="font-bold text-xl tracking-tighter">SECOND BRAIN</span>
                    <span className="font-bold text-xl tracking-tighter">HABIT TRACKER</span>
                    <span className="font-bold text-xl tracking-tighter italic">PRODUCTIVE</span>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto bg-[#37352f] rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Reclaim your mental clarity today.</h2>
                    <p className="text-lg text-white/70 mb-10 relative z-10">Join thousands of others organizing their lives with our Second Brain system.</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-10 py-5 bg-white text-[#37352f] rounded-2xl font-bold text-xl hover:bg-white/90 transition-all shadow-xl shadow-black/10 relative z-10"
                    >
                        Get Started Now
                    </Link>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-[#e9e9e7]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 opacity-60">
                        <Brain size={18} />
                        <span className="font-bold text-sm">Second Brain Tracker</span>
                    </div>
                    <p className="text-xs text-[#9b9a97]">© 2026 Second Brain. Built for high performance.</p>
                    <div className="flex gap-6 text-xs text-[#9b9a97]">
                        <a href="#" className="hover:text-[#37352f]">Privacy</a>
                        <a href="#" className="hover:text-[#37352f]">Terms</a>
                        <a href="#" className="hover:text-[#37352f]">Twitter</a>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
        </div>
    )
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="p-8 bg-white border border-[#e9e9e7] rounded-3xl hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 bg-[#f7f7f5] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-[#787774] leading-relaxed text-sm">
                {description}
            </p>
        </div>
    )
}
