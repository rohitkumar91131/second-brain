'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Brain, Monitor, Apple, Terminal, Smartphone, Tablet, Download, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

const platformData = {
    windows: {
        name: 'Windows',
        icon: <Monitor size={56} />,
        iconBg: 'bg-blue-50 dark:bg-blue-900/30',
        iconColor: 'text-blue-500 dark:text-blue-400',
        version: '1.0.0',
        releaseDate: 'February 2026',
        size: '85 MB',
        requirements: [
            'Windows 10 or Windows 11 (64-bit)',
            '4 GB RAM minimum (8 GB recommended)',
            '500 MB available disk space',
            'Internet connection for sync',
        ],
        instructions: [
            'Click "Download Now" to download the installer (.exe)',
            'Run the installer and follow the on-screen instructions',
            'Launch Second Brain from the Start Menu or Desktop shortcut',
            'Sign in with your account to sync your data',
        ],
        downloadLabel: 'Download for Windows (.exe)',
        gradient: 'from-blue-600 to-indigo-600',
    },
    mac: {
        name: 'macOS',
        icon: <Apple size={56} />,
        iconBg: 'bg-gray-50 dark:bg-gray-800',
        iconColor: 'text-gray-700 dark:text-gray-300',
        version: '1.0.0',
        releaseDate: 'February 2026',
        size: '78 MB',
        requirements: [
            'macOS 12 Monterey or later',
            'Apple Silicon (M1/M2/M3) or Intel Mac',
            '4 GB RAM minimum',
            '400 MB available disk space',
        ],
        instructions: [
            'Click "Download Now" to download the .dmg file',
            'Open the .dmg and drag Second Brain to Applications',
            'Open Second Brain from your Applications folder',
            'Sign in to sync your notes and tasks',
        ],
        downloadLabel: 'Download for macOS (.dmg)',
        gradient: 'from-gray-600 to-gray-800',
    },
    linux: {
        name: 'Linux',
        icon: <Terminal size={56} />,
        iconBg: 'bg-orange-50 dark:bg-orange-900/30',
        iconColor: 'text-orange-500 dark:text-orange-400',
        version: '1.0.0',
        releaseDate: 'February 2026',
        size: '72 MB',
        requirements: [
            'Ubuntu 20.04+ / Fedora 36+ / Debian 11+',
            '4 GB RAM minimum',
            '400 MB available disk space',
            'libgtk-3 and libnotify',
        ],
        instructions: [
            'Choose your package format: .deb, .rpm, or AppImage',
            'For .deb: run sudo dpkg -i second-brain.deb',
            'For .rpm: run sudo rpm -i second-brain.rpm',
            'For AppImage: chmod +x Second-Brain.AppImage && ./Second-Brain.AppImage',
        ],
        downloadLabel: 'Download for Linux (.AppImage)',
        gradient: 'from-orange-500 to-red-500',
    },
    android: {
        name: 'Android',
        icon: <Smartphone size={56} />,
        iconBg: 'bg-green-50 dark:bg-green-900/30',
        iconColor: 'text-green-500 dark:text-green-400',
        version: '1.0.0',
        releaseDate: 'February 2026',
        size: '32 MB',
        requirements: [
            'Android 8.0 (Oreo) or later',
            '2 GB RAM minimum',
            '100 MB available storage',
            'Google Play Services',
        ],
        instructions: [
            'Tap "Download Now" to open the Play Store listing',
            'Tap Install on the Play Store page',
            'Open Second Brain from your app drawer',
            'Sign in to sync your data across devices',
        ],
        downloadLabel: 'Get it on Google Play',
        gradient: 'from-green-500 to-emerald-600',
    },
    ios: {
        name: 'iOS',
        icon: <Tablet size={56} />,
        iconBg: 'bg-purple-50 dark:bg-purple-900/30',
        iconColor: 'text-purple-500 dark:text-purple-400',
        version: '1.0.0',
        releaseDate: 'February 2026',
        size: '41 MB',
        requirements: [
            'iOS 15 or later / iPadOS 15 or later',
            'iPhone 8 or later / iPad (6th gen) or later',
            '150 MB available storage',
            'Apple ID required',
        ],
        instructions: [
            'Tap "Download Now" to open the App Store listing',
            'Tap Get on the App Store page',
            'Open Second Brain from your Home Screen',
            'Sign in to sync your notes and tasks',
        ],
        downloadLabel: 'Download on the App Store',
        gradient: 'from-purple-500 to-indigo-600',
    },
}

const allPlatforms = [
    { id: 'windows', label: 'Windows', icon: <Monitor size={16} /> },
    { id: 'mac', label: 'macOS', icon: <Apple size={16} /> },
    { id: 'linux', label: 'Linux', icon: <Terminal size={16} /> },
    { id: 'android', label: 'Android', icon: <Smartphone size={16} /> },
    { id: 'ios', label: 'iOS', icon: <Tablet size={16} /> },
]

export default function PlatformDownloadPage() {
    const params = useParams()
    const platformId = params?.platform

    const platform = platformData[platformId]

    if (!platform) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
                <AlertCircle size={48} className="text-red-400" />
                <h1 className="text-2xl font-bold">Platform not found</h1>
                <p className="text-notion-muted">The platform &quot;{platformId}&quot; is not supported yet.</p>
                <Link href="/downloads" className="px-6 py-3 bg-[#37352f] text-white rounded-xl font-semibold hover:bg-[#2f2d28] transition-all">
                    View all downloads
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-notion-bg text-notion-text">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-notion-bg/70 backdrop-blur-md border-b border-notion-border">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#37352f] rounded-lg flex items-center justify-center">
                            <Brain className="text-white" size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Second Brain</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/#features" className="hover:text-notion-accent transition-colors">Features</Link>
                        <Link href="/downloads" className="text-notion-accent font-semibold">Downloads</Link>
                        <Link href="/login" className="hover:text-notion-accent transition-colors">Login</Link>
                        <Link
                            href="/register"
                            className="px-4 py-2 bg-[#37352f] text-white rounded-full hover:bg-[#2f2d28] transition-all shadow-lg shadow-[#37352f]/10"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="pt-28 pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Back */}
                    <Link
                        href="/downloads"
                        className="inline-flex items-center gap-2 text-sm text-notion-muted hover:text-notion-text transition-colors mb-8"
                    >
                        <ArrowLeft size={16} /> Back to Downloads
                    </Link>

                    {/* Platform Hero */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
                        <div className={`w-24 h-24 ${platform.iconBg} ${platform.iconColor} rounded-3xl flex items-center justify-center shrink-0`}>
                            {platform.icon}
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold mb-2">
                                Second Brain for {platform.name}
                            </h1>
                            <p className="text-notion-muted text-sm">
                                Version {platform.version} &nbsp;·&nbsp; Released {platform.releaseDate} &nbsp;·&nbsp; {platform.size}
                            </p>
                        </div>
                    </div>

                    {/* Main CTA */}
                    <div className={`bg-gradient-to-r ${platform.gradient} rounded-3xl p-8 text-white mb-12 flex flex-col sm:flex-row items-center justify-between gap-6`}>
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{platform.downloadLabel}</h2>
                            <p className="text-white/70 text-sm">Free download · {platform.size}</p>
                        </div>
                        <button
                            disabled
                            aria-disabled="true"
                            className="flex items-center gap-3 px-8 py-4 bg-notion-bg/50 text-notion-text/50 rounded-2xl font-bold text-lg cursor-not-allowed shadow-xl shadow-black/10 shrink-0"
                            title="Coming Soon"
                        >
                            <Download size={22} />
                            Coming Soon
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {/* System Requirements */}
                        <div className="bg-notion-card border border-notion-border rounded-3xl p-8">
                            <h3 className="text-lg font-bold mb-5">System Requirements</h3>
                            <ul className="flex flex-col gap-3">
                                {platform.requirements.map((req, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-notion-muted">
                                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Installation Instructions */}
                        <div className="bg-notion-card border border-notion-border rounded-3xl p-8">
                            <h3 className="text-lg font-bold mb-5">How to Install</h3>
                            <ol className="flex flex-col gap-4">
                                {platform.instructions.map((step, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-notion-muted">
                                        <span className="w-5 h-5 bg-[#37352f] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    {/* Other platforms */}
                    <div className="border border-notion-border rounded-3xl p-8">
                        <h3 className="text-lg font-bold mb-5">Other Platforms</h3>
                        <div className="flex flex-wrap gap-3">
                            {allPlatforms
                                .filter((p) => p.id !== platformId)
                                .map((p) => (
                                    <Link
                                        key={p.id}
                                        href={`/downloads/${p.id}`}
                                        className="flex items-center gap-2 px-4 py-2.5 border border-notion-border rounded-xl text-sm font-medium hover:bg-notion-sidebar hover:border-notion-border transition-all"
                                    >
                                        {p.icon}
                                        {p.label}
                                    </Link>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 border-t border-notion-border">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 opacity-60">
                        <Brain size={18} />
                        <span className="font-bold text-sm">Second Brain Tracker</span>
                    </div>
                    <p className="text-xs text-notion-muted">© 2026 Second Brain. Built for high performance.</p>
                    <div className="flex gap-6 text-xs text-notion-muted">
                        <a href="#" className="hover:text-notion-text">Privacy</a>
                        <a href="#" className="hover:text-notion-text">Terms</a>
                        <Link href="/" className="hover:text-notion-text">Home</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
