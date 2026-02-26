'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, History, Rocket, ScrollText } from 'lucide-react';

const VERSIONS = [
    {
        id: '2.0.0',
        title: 'Version 2.0.0',
        date: 'Upcoming',
        icon: <Rocket size={20} className="text-purple-500" />,
        features: [
            'Global Loading Fixes with Turkey Animation',
            'Unified Editor with Rich Text (Lists, Tables, Bold, etc.)',
            'Video Embeds for YouTube, Instagram, etc. in Notes',
            'Client-side Note to PDF Conversion',
            'Tab System for Notes (VS Code-like)',
            'Local Storage Fallback for Unsaved Notes',
            'Dark & Bright Mode Implementation',
            'Resource & Task Addition via Quick Add & Notes',
            'Customizable Settings to Change "/" Dashboard Route',
            'Recycle Bin & Archive Functions',
            'GSAP Right-Click Context Menu (Archive, Download, Share)',
            'Pinning and Starring Notes',
            'Lazy Loading for Large Documents',
            'Shared Notes Import Feature',
            'Responsive Navbar for all Mobile Screens',
            'Desktop Emoji Selector for Notes',
            'Content Schema Refactor (Foreign Keys & Bidirectional Links)',
            'Redesigned Authentic Homepage'
        ]
    },
    {
        id: '1.0.0',
        title: 'Version 1.0.0',
        date: 'February 2026',
        icon: <History size={20} className="text-blue-500" />,
        features: [
            'Authentication (Login & Registration)',
            'Dashboard & Basic Analytics',
            'Habit Tracking Board',
            'Note Taking Interface',
            'Projects and Tags Management',
            'Initial Responsive Layout'
        ]
    }
];

export default function VersionsPage() {
    const [activeVersion, setActiveVersion] = useState(VERSIONS[0]);

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-[#37352f] flex flex-col font-sans">
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#e9e9e7]">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-[#787774] hover:text-[#37352f] transition-colors font-medium text-sm">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <div className="font-semibold text-sm flex items-center gap-2"><ScrollText size={16} /> Release Notes</div>
                </div>
            </nav>

            <div className="flex-1 mt-16 max-w-6xl mx-auto w-full px-4 py-8 flex flex-col md:flex-row gap-8">

                {/* Sidebar */}
                <aside className="md:w-64 flex-shrink-0">
                    <div className="sticky top-24 bg-white rounded-2xl border border-[#e9e9e7] shadow-sm p-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[#9b9a97] mb-4 pl-3">Versions</h2>
                        <nav className="space-y-1">
                            {VERSIONS.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setActiveVersion(v)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium ${activeVersion.id === v.id
                                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                                            : 'text-[#787774] hover:bg-gray-100 hover:text-[#37352f]'
                                        }`}
                                >
                                    {v.icon}
                                    <span>{v.title}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-white rounded-2xl border border-[#e9e9e7] shadow-sm p-8 md:p-12">
                    <div className="mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold mb-4">
                            {activeVersion.date}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center gap-4">
                            {activeVersion.title}
                        </h1>
                        <p className="text-[#787774] text-lg">
                            Here are the detailed release notes for this version.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {activeVersion.features.map((feature, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-xl border border-transparent hover:border-[#e9e9e7] hover:bg-gray-50 transition-colors">
                                <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
                                <span className="text-[#37352f] leading-relaxed pt-0.5">{feature}</span>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

        </div>
    );
}
