'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Brain, ArrowRight, CheckCircle2, Zap, Shield, Sparkles, Loader2, Download, Monitor, Apple, Terminal, Smartphone, Tablet, Menu, X } from 'lucide-react'

export default function LandingPage() {
    const { status } = useSession()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (localStorage.getItem('setting_homepage_dashboard') === 'true') {
            router.push('/dashboard')
        }
    }, [router])

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
                        <Link href="/downloads" className="hover:text-[#2eaadc] transition-colors">Downloads</Link>

                        {status === 'loading' ? (
                            <div className="w-20 flex justify-center">
                                <Loader2 size={18} className="animate-spin text-[#9b9a97]" />
                            </div>
                        ) : status === 'authenticated' ? (
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 bg-[#37352f] text-white rounded-full hover:bg-[#2f2d28] transition-all shadow-lg shadow-[#37352f]/10"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hover:text-[#2eaadc] transition-colors">Login</Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 bg-[#37352f] text-white rounded-full hover:bg-[#2f2d28] transition-all shadow-lg shadow-[#37352f]/10"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-[#37352f] z-[60]"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-[#e9e9e7] shadow-lg py-4 px-6 flex flex-col gap-4 text-sm font-medium z-50 animate-fade-in">
                        <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#2eaadc] transition-colors">Features</a>
                        <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#2eaadc] transition-colors">About</a>
                        <Link href="/downloads" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#2eaadc] transition-colors">Downloads</Link>
                        <div className="h-px bg-[#e9e9e7] my-2" />
                        {status === 'loading' ? (
                            <div className="flex justify-center py-2">
                                <Loader2 size={18} className="animate-spin text-[#9b9a97]" />
                            </div>
                        ) : status === 'authenticated' ? (
                            <Link
                                href="/dashboard"
                                className="text-center py-3 bg-[#37352f] text-white rounded-xl shadow-md"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 border border-[#e9e9e7] rounded-xl hover:bg-[#f7f7f5] transition-colors">Login</Link>
                                <Link
                                    href="/register"
                                    className="text-center py-3 bg-[#37352f] text-white rounded-xl shadow-md"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Tag removed */}

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
                                src="/promo.gif"
                                alt="App Promo GIF"
                                className="w-full h-auto opacity-100 object-cover"
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

            {/* Social Proof Section Removed */}

            {/* Downloads Section */}
            <section id="downloads" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-4">
                            <Download size={12} />
                            <span>Available everywhere</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Download the App</h2>
                        <p className="text-[#9b9a97] max-w-xl mx-auto">Get Second Brain on any device — your data syncs seamlessly across all platforms.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 mb-10">
                        {[
                            { id: 'windows', name: 'Windows', icon: <Monitor size={28} />, bg: 'bg-blue-50', color: 'text-blue-500' },
                            { id: 'mac', name: 'macOS', icon: <Apple size={28} />, bg: 'bg-gray-50', color: 'text-gray-700' },
                            { id: 'linux', name: 'Linux', icon: <Terminal size={28} />, bg: 'bg-orange-50', color: 'text-orange-500' },
                            { id: 'android', name: 'Android', icon: <Smartphone size={28} />, bg: 'bg-green-50', color: 'text-green-500' },
                            { id: 'ios', name: 'iOS', icon: <Tablet size={28} />, bg: 'bg-purple-50', color: 'text-purple-500' },
                        ].map((platform) => (
                            <Link
                                key={platform.id}
                                href={`/downloads/${platform.id}`}
                                className="flex flex-col items-center gap-3 p-6 bg-white border border-[#e9e9e7] rounded-2xl hover:shadow-lg hover:border-[#d3d1cb] hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className={`w-14 h-14 ${platform.bg} ${platform.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    {platform.icon}
                                </div>
                                <span className="text-sm font-semibold">{platform.name}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link
                            href="/downloads"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-[#37352f] text-[#37352f] rounded-xl font-semibold text-sm hover:bg-[#37352f] hover:text-white transition-all"
                        >
                            <Download size={16} />
                            View all download options
                        </Link>
                    </div>
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
