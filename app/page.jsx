'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import {
    Brain, ArrowRight, CheckCircle2, Zap, Shield, Sparkles,
    Loader2, Download, Monitor, Apple, Terminal, Smartphone,
    Tablet, Menu, X, Layout, Star
} from 'lucide-react'
import { gsap } from 'gsap'

export default function LandingPage() {
    const { status } = useSession()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // --- REDIRECT TIMER STATES ---
    const [redirectCountdown, setRedirectCountdown] = useState(null)
    const redirectTimerRef = useRef(null)

    // GSAP Refs for animations
    const menuRef = useRef(null)
    const menuLinksRef = useRef([])

    // --- AUTO-REDIRECT LOGIC ---
    useEffect(() => {
        // Check if auto-redirect is enabled in settings
        if (localStorage.getItem('setting_homepage_dashboard') === 'true') {
            setRedirectCountdown(3); // Start 3 second countdown
        }
    }, [])

    useEffect(() => {
        if (redirectCountdown === null) return;

        if (redirectCountdown === 0) {
            router.push('/dashboard');
        } else {
            redirectTimerRef.current = setTimeout(() => {
                setRedirectCountdown(prev => prev - 1);
            }, 1000);
        }

        return () => clearTimeout(redirectTimerRef.current);
    }, [redirectCountdown, router]);

    const stopRedirect = () => {
        clearTimeout(redirectTimerRef.current);
        setRedirectCountdown(null);
    }

    // --- GSAP MOBILE MENU ANIMATION ---
    useEffect(() => {
        if (mobileMenuOpen) {
            gsap.to(menuRef.current, {
                y: 0,
                duration: 0.6,
                ease: "power4.out",
                display: "flex",
                opacity: 1
            })
            gsap.fromTo(menuLinksRef.current,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, delay: 0.2, ease: "back.out(1.2)" }
            )
        } else {
            gsap.to(menuRef.current, {
                y: "-100%",
                opacity: 0,
                duration: 0.4,
                ease: "power4.in",
                onComplete: () => {
                    if (menuRef.current) menuRef.current.style.display = "none"
                }
            })
        }
    }, [mobileMenuOpen])

    const closeMenu = () => setMobileMenuOpen(false)

    return (
        <div className="min-h-screen bg-notion-bg text-notion-text overflow-x-hidden relative">

            {/* --- REDIRECT TOAST UI --- */}
            {redirectCountdown !== null && (
                <div className="fixed bottom-6 right-6 w-80 z-[200] animate-in slide-in-from-bottom-4 fade-in duration-300 font-sans">
                    <div className="bg-white/90 backdrop-blur-md border border-blue-100 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 ring-1 ring-black/5">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center animate-pulse">
                                    <Zap size={16} />
                                </div>
                                <div>
                                    <h4 className="text-[14px] font-bold text-gray-800 leading-tight">Auto-Redirect Active</h4>
                                    <p className="text-[12px] text-gray-500 mt-0.5">Going to dashboard in <span className="text-blue-600 font-bold">{redirectCountdown}s</span></p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={stopRedirect}
                            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <X size={16} /> Stop Redirect
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-[100] bg-notion-bg/80 backdrop-blur-md border-b border-notion-border">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-[110] bg-transparent">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#37352f] rounded-lg flex items-center justify-center">
                            <Brain className="text-white" size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Second Brain</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <a href="#features" className="hover:text-notion-accent transition-colors">Features</a>
                        <Link href="/versions" className="hover:text-notion-accent transition-colors">Versions</Link>
                        <Link href="/downloads" className="hover:text-notion-accent transition-colors">Downloads</Link>

                        {status === 'loading' ? (
                            <div className="w-20 flex justify-center">
                                <Loader2 size={18} className="animate-spin text-notion-muted" />
                            </div>
                        ) : status === 'authenticated' ? (
                            <Link href="/dashboard" className="px-5 py-2.5 bg-[#37352f] text-white rounded-full hover:bg-black transition-all shadow-md">Dashboard</Link>
                        ) : (
                            <button
                                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-notion-border rounded-full hover:bg-notion-sidebar transition-all shadow-sm font-semibold text-sm"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden p-2 text-notion-text" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown (GSAP) */}
                <div
                    ref={menuRef}
                    style={{ transform: "translateY(-100%)", display: "none", opacity: 0 }}
                    className="md:hidden fixed top-16 left-0 w-full bg-notion-bg border-b border-notion-border shadow-2xl py-10 px-8 flex flex-col gap-6 text-xl font-bold z-[90]"
                >
                    <a href="#features" ref={el => menuLinksRef.current[0] = el} onClick={closeMenu} className="hover:text-notion-accent">Features</a>
                    <Link href="/versions" ref={el => menuLinksRef.current[1] = el} onClick={closeMenu} className="hover:text-notion-accent">Versions</Link>
                    <Link href="/downloads" ref={el => menuLinksRef.current[2] = el} onClick={closeMenu} className="hover:text-notion-accent">Downloads</Link>

                    <div className="h-px bg-notion-border my-2" ref={el => menuLinksRef.current[3] = el} />

                    {status === 'loading' ? (
                        <div className="flex justify-center" ref={el => menuLinksRef.current[4] = el}>
                            <Loader2 size={24} className="animate-spin text-notion-text" />
                        </div>
                    ) : status === 'authenticated' ? (
                        <Link href="/dashboard" ref={el => menuLinksRef.current[4] = el} className="text-center py-4 bg-[#37352f] text-white rounded-2xl shadow-lg" onClick={closeMenu}>Dashboard</Link>
                    ) : (
                        <button
                            ref={el => menuLinksRef.current[5] = el}
                            onClick={() => { closeMenu(); signIn('google', { callbackUrl: '/dashboard' }); }}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-notion-border rounded-2xl shadow-md text-base"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Continue with Google</span>
                        </button>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">

                    {/* --- VERSION 5.0.0 BADGE (Fixed Apostrophe) --- */}
                    <Link
                        href="/versions"
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-8 hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm"
                    >
                        <Star size={16} className="text-indigo-500 fill-indigo-500" />
                        Version 5.0.0 is live! See what&apos;s new <ArrowRight size={14} />
                    </Link>

                    <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                        Build your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Digital Second Brain</span>
                    </h1>

                    <p className="text-lg md:text-xl text-notion-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                        The all-in-one workspace to capture notes, track habits, manage projects, and achieve your goals. Simple, powerful, and beautiful.
                    </p>

                    <div className="flex justify-center">
                        {status === 'loading' ? (
                            <div className="h-16 w-64 bg-[#f1f1ef] animate-pulse rounded-2xl" />
                        ) : (
                            <Link
                                href={status === 'authenticated' ? "/dashboard" : "/login"}
                                className="w-full sm:w-auto px-10 py-5 bg-[#37352f] text-white rounded-2xl font-bold text-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-[#37352f]/30"
                            >
                                {status === 'authenticated' ? 'Go to Dashboard' : 'Start Building for Free'} <ArrowRight size={22} />
                            </Link>
                        )}
                    </div>

                    {/* Dashboard Preview Replacement */}
                    <div className="mt-24 relative max-w-4xl mx-auto">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-30" />
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-notion-bg border border-notion-border rounded-[2.5rem] p-8 shadow-xl text-left transform hover:-translate-y-2 transition-all duration-300">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                    <Layout size={24} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Modular Workspace</h3>
                                <p className="text-notion-muted text-sm leading-relaxed">Organize everything exactly how you think. No rigid structures, just pure creative flow.</p>
                            </div>

                            <div className="bg-[#37352f] rounded-[2.5rem] p-8 shadow-2xl text-left text-white transform md:translate-y-8 hover:-translate-y-0 transition-all duration-300">
                                <div className="w-12 h-12 bg-notion-bg/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                                    <Sparkles size={24} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Focus on Action</h3>
                                <p className="text-white/60 text-sm leading-relaxed">Turn cluttered thoughts into actionable tasks and track your long-term achievements.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Group */}
            <section id="features" className="py-24 bg-notion-card border-y border-notion-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Core Components</h2>
                        <p className="text-notion-muted">Everything you need to stay organized in one place.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="text-blue-500" />}
                            title="Quick Capture"
                            description="Instantly add tasks, notes, or ideas from anywhere with our global Ctrl+K command bar."
                        />
                        <FeatureCard
                            icon={<CheckCircle2 className="text-green-500" />}
                            title="Habit Tracking"
                            description="Monitor your daily rituals and habits with beautiful visual progress and streaks."
                        />
                        <FeatureCard
                            icon={<Shield className="text-purple-500" />}
                            title="Private Notes"
                            description="Write in a block-based editor. Your knowledge is stored securely and remains private."
                        />
                    </div>
                </div>
            </section>

            {/* Downloads Section */}
            <section id="downloads" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-4">
                            <Download size={12} />
                            <span>Available everywhere</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-notion-text">Download the App</h2>
                        <p className="text-notion-muted max-w-xl mx-auto">Seamlessly sync your brain across all your devices.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
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
                                className="flex flex-col items-center gap-3 p-6 bg-notion-bg border border-notion-border rounded-2xl hover:shadow-lg transition-all group"
                            >
                                <div className={`w-14 h-14 ${platform.bg} ${platform.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    {platform.icon}
                                </div>
                                <span className="text-sm font-semibold">{platform.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-notion-border bg-notion-card">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
                        <div className="max-w-xs text-left">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-[#37352f] rounded-lg flex items-center justify-center">
                                    <Brain className="text-white" size={18} />
                                </div>
                                <span className="font-bold text-lg tracking-tight">Second Brain</span>
                            </div>
                            <p className="text-sm text-notion-muted leading-relaxed">
                                The ultimate tool for high-performers to organize their knowledge and master their habits.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-16 md:gap-24">
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-sm uppercase tracking-widest text-notion-text">Product</h4>
                                <Link href="/versions" className="text-sm text-notion-muted hover:text-notion-text transition-colors">Versions</Link>
                                <Link href="/downloads" className="text-sm text-notion-muted hover:text-notion-text transition-colors">Downloads</Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-sm uppercase tracking-widest text-notion-text">Legal</h4>
                                <Link href="/privacy" className="text-sm text-notion-muted hover:text-notion-text transition-colors">Privacy Policy</Link>
                                <Link href="/terms" className="text-sm text-notion-muted hover:text-notion-text transition-colors">Terms of Service</Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-notion-border">
                        <p className="text-xs text-[#d3d1cb] font-medium">© 2026 Second Brain. Built for clarity and speed.</p>
                        <p className="text-xs text-[#d3d1cb] font-bold tracking-widest uppercase">MASTER YOUR MIND</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="p-8 bg-notion-bg border border-notion-border rounded-3xl hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 bg-notion-sidebar rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-notion-muted leading-relaxed text-sm">
                {description}
            </p>
        </div>
    )
}