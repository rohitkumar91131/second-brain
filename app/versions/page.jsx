'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, History, Rocket, ScrollText, Sparkles, Zap } from 'lucide-react';

const VERSIONS = [
    {
        id: '4.0.0',
        title: 'Version 4.0.0',
        date: 'February 28, 2026',
        icon: <Zap size={20} className="text-blue-500" />,
        features: [
            'Advanced Drag & Drop: Seamlessly drag text from any website and retain its original HTML structure (Headings, Paragraphs, Lists).',
            'Smart Table Pasting: Automatically convert copy-pasted Excel, Web, or ChatGPT markdown tables into native Table Blocks.',
            'Media Reordering: Image, Video, Audio, and Link blocks now feature draggable grip handles for effortless sorting.',
            'External Drop Zones: Added visual UI feedback (blue dashed borders) when dragging files or text into the editor.',
            'Native Table Drag Support: Full internal drag-and-drop support seamlessly integrated into Table Blocks.'
        ]
    },
    {
        id: '3.0.0',
        title: 'Version 3.0.0',
        date: 'February 27, 2026',
        icon: <Sparkles size={20} className="text-yellow-500" />,
        features: [
            'Enhanced Slash Commands (/) with arrow-key navigation and instant Enter selection',
            'Smart Command Filtering: Menu items now filter in real-time as you type after "/"',
            'New "Link Block" for clean web bookmarks with automated URL validation',
            'Full-screen Media Viewer for both Images and Videos with blurry backdrop',
            'Blob-based Secure Downloading: Images now save directly to device bypassing CORS',
            'GSAP Powered Mobile Navbar: Ultra-smooth slide-down animation and staggered link entry',
            'Note Editor Responsiveness: Mobile-first layout adjustments for better writing space',
            'Database Sync for Deletions: Blocks now permanently delete from MongoDB with auto-reordering',
            'Schema Hardening: Zod and Mongoose validation synchronized for all new block types',
            'Refurbished Landing Page: Clean hero section with modular dashboard preview cards'
        ]
    },
    {
        id: '2.0.0',
        title: 'Version 2.0.0',
        date: 'February 22, 2026',
        icon: <Rocket size={20} className="text-purple-500" />,
        features: [
            'Global Loading Fixes with Turkey Animation',
            'Unified Editor with Rich Text (Lists, Tables, Bold, etc.)',
            'Video Embeds for YouTube, Instagram, etc. in Notes',
            'Client-side Note to PDF Conversion',
            'Local Storage Fallback for Unsaved Notes',
            'Resource & Task Addition via Quick Add & Notes',
            'Customizable Settings to Change "/" Dashboard Route',
            'Recycle Bin & Archive Functions',
            'GSAP Right-Click Context Menu (Archive, Download, Share)',
            'Lazy Loading for Large Documents',
            'Responsive Navbar for all Mobile Screens',
            'Content Schema Refactor (Foreign Keys & Bidirectional Links)',
        ]
    },
    {
        id: '1.0.0',
        title: 'Version 1.0.0',
        date: 'February 17, 2026',
        icon: <History size={20} className="text-gray-500" />,
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
    const router = useRouter();
    const [activeVersion, setActiveVersion] = useState(VERSIONS[0]);

    return (
        <div className="min-h-screen bg-notion-card text-notion-text flex flex-col font-sans">
            <nav className="fixed top-0 w-full z-50 bg-notion-bg/80 backdrop-blur-md border-b border-notion-border">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-notion-muted hover:text-notion-text transition-colors font-medium text-sm outline-none"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="font-semibold text-sm flex items-center gap-2">
                        <ScrollText size={16} /> Release Notes
                    </div>
                </div>
            </nav>

            <div className="flex-1 mt-16 max-w-6xl mx-auto w-full px-4 py-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="md:w-64 flex-shrink-0">
                    <div className="sticky top-24 bg-notion-bg rounded-2xl border border-notion-border shadow-sm p-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-notion-muted mb-4 pl-3">Versions</h2>
                        <nav className="space-y-1">
                            {VERSIONS.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setActiveVersion(v)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium ${activeVersion.id === v.id
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-notion-muted hover:bg-gray-100 hover:text-notion-text'
                                        }`}
                                >
                                    {v.icon}
                                    <span>{v.title}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 bg-notion-bg rounded-2xl border border-notion-border shadow-sm p-8 md:p-12">
                    <div className="mb-10">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${activeVersion.id === '4.0.0' ? 'bg-blue-50 text-blue-700' :
                            activeVersion.id === '3.0.0' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {activeVersion.date}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center gap-4">
                            {activeVersion.title}
                        </h1>
                        <p className="text-notion-muted text-lg">
                            {activeVersion.id === '4.0.0'
                                ? 'The Workflow Update: Powerful drag-and-drop and seamless copy-paste integrations.'
                                : activeVersion.id === '3.0.0'
                                    ? 'The Experience Update: Making the editor and landing page feel elite.'
                                    : `Release summary for ${activeVersion.title}.`}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {activeVersion.features.map((feature, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-xl border border-transparent hover:border-notion-border hover:bg-gray-50 transition-colors">
                                <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
                                <span className="text-notion-text leading-relaxed pt-0.5">{feature}</span>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}