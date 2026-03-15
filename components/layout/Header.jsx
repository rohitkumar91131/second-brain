'use client'

import { usePathname } from 'next/navigation'
import { Menu, Search, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import QuickAddModal from '@/components/ui/QuickAddModal'
import GlobalSearch from '@/components/ui/GlobalSearch'

const pageTitles = {
    '/dashboard': 'Overview',
    '/dashboard/tasks': 'Tasks',
    '/dashboard/projects': 'Projects',
    '/dashboard/goals': 'Goals',
    '/dashboard/areas': 'Areas',
    '/dashboard/resources': 'Resources',
    '/dashboard/notes': 'Notes',
    '/dashboard/journal': 'Journal',
    '/dashboard/archive': 'Archive',
    '/dashboard/media': 'Media Bank',
    '/dashboard/settings': 'Settings',
}

export default function Header({ onMobileMenuClick }) {
    const pathname = usePathname()
    const [showQuickAdd, setShowQuickAdd] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    const title = Object.entries(pageTitles).find(([path]) =>
        path === pathname || (path !== '/dashboard' && pathname.startsWith(path))
    )?.[1] || 'Second Brain'

    // Cmd+K / Ctrl+K to open search
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setShowSearch(s => !s)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    return (
        <>
            <header className="flex items-center h-16 px-6 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 flex-shrink-0 sticky top-0 z-30">
                {/* Mobile menu button */}
                <button
                    onClick={onMobileMenuClick}
                    className="md:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400 mr-4"
                >
                    <Menu size={20} />
                </button>

                {/* Page title */}
                <h1 className="text-lg font-bold text-white tracking-tight flex-1">{title}</h1>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Search button */}
                    <button
                        onClick={() => setShowSearch(true)}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm group"
                        title="Search (Ctrl+K)"
                    >
                        <Search size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline font-medium">Search anything...</span>
                        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] bg-white/5 border border-white/10 rounded-md font-mono">
                            ⌘K
                        </kbd>
                    </button>

                    <button
                        onClick={() => setShowQuickAdd(true)}
                        className="flex items-center gap-2 px-5 py-2 premium-gradient text-white text-sm font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 ml-1"
                    >
                        <Plus size={18} strokeWidth={3} />
                        <span className="hidden sm:inline">Create New</span>
                    </button>
                </div>
            </header>

            {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
            {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
        </>
    )
}
