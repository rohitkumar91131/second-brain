'use client'

import React from 'react'
import Link from 'next/link'
import { Brain, Monitor, Apple, Terminal, Smartphone, Tablet, Download, ArrowRight, CheckCircle2 } from 'lucide-react'

const platforms = [
    {
        id: 'windows',
        name: 'Windows',
        description: 'For Windows 10 and above (64-bit)',
        icon: <Monitor size={40} />,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        badge: 'v1.0.0',
        size: '85 MB',
        requirements: 'Windows 10 / 11 (64-bit)',
    },
    {
        id: 'mac',
        name: 'macOS',
        description: 'For macOS 12 Monterey and above',
        icon: <Apple size={40} />,
        iconBg: 'bg-gray-50',
        iconColor: 'text-gray-700',
        badge: 'v1.0.0',
        size: '78 MB',
        requirements: 'macOS 12+',
    },
    {
        id: 'linux',
        name: 'Linux',
        description: 'Available as .deb, .rpm and AppImage',
        icon: <Terminal size={40} />,
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-500',
        badge: 'v1.0.0',
        size: '72 MB',
        requirements: 'Ubuntu 20.04+ / Fedora 36+',
    },
    {
        id: 'android',
        name: 'Android',
        description: 'For Android 8.0 (Oreo) and above',
        icon: <Smartphone size={40} />,
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
        icon: <Tablet size={40} />,
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-500',
        badge: 'v1.0.0',
        size: '41 MB',
        requirements: 'iOS 15+ / iPadOS 15+',
    },
]

export default function DownloadsPage() {
    return (
        <div className="min-h-screen bg-[#ffffff] text-[#37352f]">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-[#e9e9e7]">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#37352f] rounded-lg flex items-center justify-center">
                            <Brain className="text-white" size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Second Brain</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/#features" className="hover:text-[#2eaadc] transition-colors">Features</Link>
                        <Link href="/downloads" className="text-[#2eaadc] font-semibold">Downloads</Link>
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

            {/* Hero */}
            <section className="pt-36 pb-16 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-6">
                        <Download size={12} />
                        <span>Available on all platforms</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        Download <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Second Brain</span>
                    </h1>
                    <p className="text-lg text-[#787774] max-w-xl mx-auto leading-relaxed">
                        Get the Second Brain app on your favourite device. Sync across all your platforms seamlessly.
                    </p>
                </div>
            </section>

            {/* Platform Cards */}
            <section className="pb-24 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {platforms.map((platform) => (
                        <div
                            key={platform.id}
                            className="bg-white border border-[#e9e9e7] rounded-3xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col gap-6 group"
                        >
                            {/* Icon */}
                            <div className={`w-16 h-16 ${platform.iconBg} ${platform.iconColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                {platform.icon}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold">{platform.name}</h2>
                                    <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">{platform.badge}</span>
                                </div>
                                <p className="text-sm text-[#787774] mb-3">{platform.description}</p>
                                <div className="flex items-center gap-4 text-xs text-[#9b9a97]">
                                    <span>📦 {platform.size}</span>
                                    <span>⚙️ {platform.requirements}</span>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col gap-2">
                                <Link
                                    href={`/downloads/${platform.id}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#37352f] text-white text-sm font-semibold rounded-xl hover:bg-[#2f2d28] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#37352f]/10"
                                >
                                    <Download size={16} />
                                    Download Now
                                </Link>
                                <Link
                                    href={`/downloads/${platform.id}`}
                                    className="flex items-center justify-center gap-1 w-full py-2.5 bg-white border border-[#e9e9e7] text-[#37352f] text-xs font-medium rounded-xl hover:bg-[#f7f7f5] transition-all"
                                >
                                    View details <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features of app */}
            <section className="py-16 bg-[#fcfcfc] border-y border-[#e9e9e7] px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-10">Why download the app?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {[
                            { title: 'Offline Access', desc: 'Access all your notes and tasks even without internet.' },
                            { title: 'Instant Sync', desc: 'Changes sync instantly across all your devices.' },
                            { title: 'Native Performance', desc: 'Faster than the web — built with native components.' },
                        ].map((f) => (
                            <div key={f.title} className="flex gap-3">
                                <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" size={20} />
                                <div>
                                    <h3 className="font-semibold mb-1">{f.title}</h3>
                                    <p className="text-sm text-[#787774]">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
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
                        <Link href="/" className="hover:text-[#37352f]">Home</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
