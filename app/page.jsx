'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    Brain, ArrowRight, CheckCircle2, Zap, Shield, Sparkles,
    Loader2, Download, Monitor, Apple, Terminal, Smartphone,
    Tablet, Menu, X, Layout
} from 'lucide-react'
import { gsap } from 'gsap'

export default function LandingPage() {
    const { status } = useSession()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // GSAP Refs for animations
    const menuRef = useRef(null)
    const menuLinksRef = useRef([])

    useEffect(() => {
        if (localStorage.getItem('setting_homepage_dashboard') === 'true') {
            router.push('/dashboard')
        }
    }, [router])

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
        <div className="min-h-screen bg-[#ffffff] text-[#37352f] overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-[#e9e9e7]">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-[110] bg-transparent">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#37352f] rounded-lg flex items-center justify-center">
                            <Brain className="text-white" size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Second Brain</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <a href="#features" className="hover:text-[#2eaadc] transition-colors">Features</a>
                        <Link href="/versions" className="hover:text-[#2eaadc] transition-colors">Versions</Link>
                        <Link href="/downloads" className="hover:text-[#2eaadc] transition-colors">Downloads</Link>

                        {status === 'loading' ? (
                            <div className="w-20 flex justify-center">
                                <Loader2 size={18} className="animate-spin text-[#9b9a97]" />
                            </div>
                        ) : status === 'authenticated' ? (
                            <Link href="/dashboard" className="px-5 py-2.5 bg-[#37352f] text-white rounded-full hover:bg-black transition-all shadow-md">Dashboard</Link>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link href="/login" className="hover:text-[#2eaadc] transition-colors">Login</Link>
                                <Link href="/register" className="px-5 py-2.5 bg-[#37352f] text-white rounded-full hover:bg-black transition-all shadow-md">Get Started</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden p-2 text-[#37352f]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown (GSAP) */}
                <div
                    ref={menuRef}
                    style={{ transform: "translateY(-100%)", display: "none", opacity: 0 }}
                    className="md:hidden fixed top-16 left-0 w-full bg-white border-b border-[#e9e9e7] shadow-2xl py-10 px-8 flex flex-col gap-6 text-xl font-bold z-[90]"
                >
                    <a href="#features" ref={el => menuLinksRef.current[0] = el} onClick={closeMenu} className="hover:text-[#2eaadc]">Features</a>
                    <Link href="/versions" ref={el => menuLinksRef.current[1] = el} onClick={closeMenu} className="hover:text-[#2eaadc]">Versions</Link>
                    <Link href="/downloads" ref={el => menuLinksRef.current[2] = el} onClick={closeMenu} className="hover:text-[#2eaadc]">Downloads</Link>

                    <div className="h-px bg-[#e9e9e7] my-2" ref={el => menuLinksRef.current[3] = el} />

                    {status === 'loading' ? (
                        <div className="flex justify-center" ref={el => menuLinksRef.current[4] = el}>
                            <Loader2 size={24} className="animate-spin text-[#37352f]" />
                        </div>
                    ) : status === 'authenticated' ? (
                        <Link href="/dashboard" ref={el => menuLinksRef.current[4] = el} className="text-center py-4 bg-[#37352f] text-white rounded-2xl shadow-lg">Dashboard</Link>
                    ) : (
                        <div className="flex flex-col gap-4" ref={el => menuLinksRef.current[5] = el}>
                            <Link href="/login" onClick={closeMenu} className="text-center py-4 border border-[#e9e9e7] rounded-2xl">Login</Link>
                            <Link href="/register" onClick={closeMenu} className="text-center py-4 bg-[#37352f] text-white rounded-2xl shadow-lg">Get Started</Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                        Build your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Digital Second Brain</span>
                    </h1>

                    <p className="text-lg md:text-xl text-[#787774] max-w-2xl mx-auto mb-10 leading-relaxed">
                        The all-in-one workspace to capture notes, track habits, manage projects, and achieve your goals. Simple, powerful, and beautiful.
                    </p>

                    <div className="flex justify-center">
                        {status === 'loading' ? (
                            <div className="h-16 w-64 bg-[#f1f1ef] animate-pulse rounded-2xl" />
                        ) : (
                            <Link
                                href={status === 'authenticated' ? "/dashboard" : "/register"}
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
                            <div className="bg-white border border-[#e9e9e7] rounded-[2.5rem] p-8 shadow-xl text-left transform hover:-translate-y-2 transition-all duration-300">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                    <Layout size={24} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Modular Workspace</h3>
                                <p className="text-[#9b9a97] text-sm leading-relaxed">Organize everything exactly how you think. No rigid structures, just pure creative flow.</p>
                            </div>

                            <div className="bg-[#37352f] rounded-[2.5rem] p-8 shadow-2xl text-left text-white transform md:translate-y-8 hover:-translate-y-0 transition-all duration-300">
                                <div className="w-12 h-12 bg-white/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
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
                        <h2 className="text-3xl font-bold mb-4 text-[#37352f]">Download the App</h2>
                        <p className="text-[#9b9a97] max-w-xl mx-auto">Seamlessly sync your brain across all your devices.</p>
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
                                className="flex flex-col items-center gap-3 p-6 bg-white border border-[#e9e9e7] rounded-2xl hover:shadow-lg transition-all group"
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
            <footer className="py-20 border-t border-[#e9e9e7] bg-[#fcfcfc]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
                        <div className="max-w-xs text-left">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-[#37352f] rounded-lg flex items-center justify-center">
                                    <Brain className="text-white" size={18} />
                                </div>
                                <span className="font-bold text-lg tracking-tight">Second Brain</span>
                            </div>
                            <p className="text-sm text-[#9b9a97] leading-relaxed">
                                The ultimate tool for high-performers to organize their knowledge and master their habits.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-16 md:gap-24">
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-sm uppercase tracking-widest text-[#37352f]">Product</h4>
                                <Link href="/versions" className="text-sm text-[#9b9a97] hover:text-[#37352f] transition-colors">Versions</Link>
                                <Link href="/downloads" className="text-sm text-[#9b9a97] hover:text-[#37352f] transition-colors">Downloads</Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-sm uppercase tracking-widest text-[#37352f]">Legal</h4>
                                <Link href="/privacy" className="text-sm text-[#9b9a97] hover:text-[#37352f] transition-colors">Privacy Policy</Link>
                                <Link href="/terms" className="text-sm text-[#9b9a97] hover:text-[#37352f] transition-colors">Terms of Service</Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-[#e9e9e7]">
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