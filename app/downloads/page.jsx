'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
    Brain, Monitor, Apple, Terminal, Smartphone, Tablet,
    Download, ArrowRight, CheckCircle2, Menu, X, Loader2
} from 'lucide-react'
import { gsap } from 'gsap'

const platforms = [
    {
        id: 'windows',
        name: 'Windows',
        description: 'For Windows 10 and above (64-bit)',
        icon: <Monitor size={36} />,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        badge: 'v1.0.0',
        size: '85 MB',
        requirements: 'Windows 10 / 11',
    },
    {
        id: 'mac',
        name: 'macOS',
        description: 'For macOS 12 Monterey and above',
        icon: <Apple size={36} />,
        iconBg: 'bg-gray-50',
        iconColor: 'text-gray-700',
        badge: 'v1.0.0',
        size: '78 MB',
        requirements: 'macOS 12+ (Intel/M1/M2)',
    },
    {
        id: 'linux',
        name: 'Linux',
        description: 'Available as .deb, .rpm and AppImage',
        icon: <Terminal size={36} />,
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-500',
        badge: 'v1.0.0',
        size: '72 MB',
        requirements: 'Ubuntu / Fedora',
    },
    {
        id: 'android',
        name: 'Android',
        description: 'For Android 8.0 (Oreo) and above',
        icon: <Smartphone size={36} />,
        iconBg: 'bg-green-50',
        iconColor: 'text-green-500',
        badge: 'v1.0.0',
        size: '32 MB',
        requirements: 'Android 8.0+',
    },
    {
        id: 'ios',
        name: 'iOS',
        description: 'For iPhone and iPad running iOS 15+',
        icon: <Tablet size={36} />,
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-500',
        badge: 'v1.0.0',
        size: '41 MB',
        requirements: 'iOS 15+',
    },
]

export default function DownloadsPage() {
    const { status } = useSession()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const menuRef = useRef(null)
    const menuLinksRef = useRef([])

    // GSAP Animation for Mobile Menu
    useEffect(() => {
        if (mobileMenuOpen) {
            gsap.to(menuRef.current, {
                y: 0,
                duration: 0.5,
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
                duration: 0.4,
                ease: "power4.in",
                opacity: 0,
                onComplete: () => {
                    if (menuRef.current) menuRef.current.style.display = "none"
                }
            })
        }
    }, [mobileMenuOpen])

    const closeMenu = () => setMobileMenuOpen(false)

    return (
        <div className="min-h-screen bg-notion-bg text-notion-text selection:bg-blue-100">
            {/* Navbar with Auth Check */}
            <nav className="fixed top-0 w-full z-[100] bg-notion-bg/80 backdrop-blur-md border-b border-notion-border">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-[110]">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-[#37352f] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Brain className="text-white" size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Second Brain</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/#features" className="hover:text-notion-accent transition-colors">Features</Link>
                        <Link href="/versions" className="hover:text-notion-accent transition-colors">Versions</Link>
                        <Link href="/downloads" className="text-notion-accent font-semibold">Downloads</Link>

                        {status === 'loading' ? (
                            <Loader2 size={18} className="animate-spin text-notion-muted" />
                        ) : status === 'authenticated' ? (
                            <Link href="/dashboard" className="px-5 py-2.5 bg-[#37352f] text-white rounded-full hover:bg-black transition-all shadow-md">
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link href="/login" className="hover:text-notion-accent transition-colors">Login</Link>
                                <Link href="/register" className="px-5 py-2.5 bg-[#37352f] text-white rounded-full hover:bg-black transition-all shadow-md">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden p-2 text-notion-text" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown (GSAP) */}
                <div ref={menuRef} style={{ transform: "translateY(-100%)", display: "none", opacity: 0 }} className="md:hidden fixed top-16 left-0 w-full bg-notion-bg border-b border-notion-border shadow-2xl py-10 px-8 flex flex-col gap-6 text-xl font-bold z-[90]">
                    <Link href="/#features" ref={el => menuLinksRef.current[0] = el} onClick={closeMenu}>Features</Link>
                    <Link href="/versions" ref={el => menuLinksRef.current[1] = el} onClick={closeMenu}>Versions</Link>
                    <Link href="/downloads" ref={el => menuLinksRef.current[2] = el} onClick={closeMenu}>Downloads</Link>
                    <div className="h-px bg-notion-border my-2" ref={el => menuLinksRef.current[3] = el} />

                    {status === 'authenticated' ? (
                        <Link href="/dashboard" ref={el => menuLinksRef.current[4] = el} className="text-center py-4 bg-[#37352f] text-white rounded-2xl shadow-lg">Dashboard</Link>
                    ) : (
                        <div className="flex flex-col gap-4" ref={el => menuLinksRef.current[5] = el}>
                            <Link href="/login" onClick={closeMenu} className="text-center py-4 border border-notion-border rounded-2xl">Login</Link>
                            <Link href="/register" onClick={closeMenu} className="text-center py-4 bg-[#37352f] text-white rounded-2xl shadow-lg">Get Started</Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-[1.1]">
                        Master your life on <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Every Device</span>
                    </h1>
                    <p className="text-xl text-notion-muted max-w-2xl mx-auto leading-relaxed">
                        Download the native app for a faster, offline-ready experience. Your second brain, synced and ready whenever inspiration strikes.
                    </p>
                </div>
            </section>

            {/* Platform Grid */}
            <section className="pb-28 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {platforms.map((platform) => (
                        <div
                            key={platform.id}
                            className="bg-notion-bg border border-notion-border rounded-[2.5rem] p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col gap-8 group"
                        >
                            <div className={`w-14 h-14 ${platform.iconBg} ${platform.iconColor} rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform`}>
                                {platform.icon}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold tracking-tight">{platform.name}</h2>
                                    <span className="text-[10px] uppercase tracking-widest bg-[#f1f1ef] text-notion-muted font-bold px-2 py-1 rounded-md">{platform.badge}</span>
                                </div>
                                <p className="text-notion-muted text-sm leading-relaxed mb-6">{platform.description}</p>

                                <div className="flex flex-wrap gap-4 text-[11px] font-bold text-[#d3d1cb] uppercase tracking-wider">
                                    <span>{platform.size}</span>
                                    <span>{platform.requirements}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full py-4 bg-[#f1f1ef] text-notion-muted text-sm font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-2">
                                    <Download size={18} /> Coming Soon
                                </button>
                                <Link
                                    href={`/downloads/${platform.id}`}
                                    className="w-full py-4 bg-notion-bg border border-notion-border text-notion-text text-sm font-bold rounded-2xl hover:bg-notion-sidebar transition-all flex items-center justify-center gap-2"
                                >
                                    Documentation <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Info */}
            <section className="py-24 bg-notion-card border-t border-notion-border px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: 'Offline Access', desc: 'Work on your notes without internet. We sync as soon as you reconnect.' },
                            { title: 'Native Speed', desc: 'Optimized performance for desktop and mobile hardware.' },
                            { title: 'System Integration', desc: 'Deep integration with system notifications and quick actions.' },
                        ].map((f) => (
                            <div key={f.title} className="space-y-4">
                                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 size={20} />
                                </div>
                                <h3 className="text-xl font-bold">{f.title}</h3>
                                <p className="text-sm text-notion-muted leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Updated Premium Footer - Same as Landing Page */}
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