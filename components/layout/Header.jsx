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
            <header className="flex items-center h-12 px-4 border-b border-[#e9e9e7] bg-white flex-shrink-0">
                {/* Mobile menu button */}
                <button
                    onClick={onMobileMenuClick}
                    className="md:hidden p-1.5 rounded hover:bg-[#efefef] text-[#9b9a97] mr-3"
                >
                    <Menu size={18} />
                </button>

                {/* Page title */}
                <h1 className="text-sm font-medium text-[#37352f] flex-1">{title}</h1>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    {/* Search button */}
                    <button
                        onClick={() => setShowSearch(true)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-[#e9e9e7] text-[#9b9a97] hover:text-[#37352f] hover:border-[#d3d1cb] transition-colors text-xs"
                        title="Search (Ctrl+K)"
                    >
                        <Search size={13} />
                        <span className="hidden sm:inline">Search</span>
                        <kbd className="hidden sm:inline-flex items-center px-1 py-0.5 text-[10px] bg-[#f7f7f5] border border-[#e9e9e7] rounded">
                            ⌘K
                        </kbd>
                    </button>

                    <button
                        onClick={() => setShowQuickAdd(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#37352f] text-white text-xs font-medium rounded-md hover:bg-[#2f2d28] transition-colors ml-1"
                    >
                        <Plus size={14} />
                        <span className="hidden sm:inline">New</span>
                    </button>
                </div>
            </header>

            {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
            {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
        </>
    )
}
