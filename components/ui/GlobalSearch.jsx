'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import { Search, X, CheckSquare, FolderOpen, Target, FileText, BookMarked, BookOpen } from 'lucide-react'

const TYPE_META = {
    task: { label: 'Tasks', icon: CheckSquare, color: '#2eaadc', href: (id) => '/dashboard/tasks' },
    project: { label: 'Projects', icon: FolderOpen, color: '#0f7b6c', href: (id) => '/dashboard/projects' },
    goal: { label: 'Goals', icon: Target, color: '#d9730d', href: (id) => '/dashboard/goals' },
    note: { label: 'Notes', icon: FileText, color: '#6940a5', href: (id) => `/dashboard/notes/${id}` },
    journal: { label: 'Journal', icon: BookMarked, color: '#e03e3e', href: (id) => `/dashboard/journal/${id}` },
    resource: { label: 'Resources', icon: BookOpen, color: '#0b6e99', href: (id) => '/dashboard/resources' },
}

function highlight(text, query) {
    if (!query || !text) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-yellow-100 text-[#37352f] rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </>
    )
}

function buildIndex(tasks, projects, goals, notes, journal, resources) {
    const items = []
    tasks.forEach(t => items.push({ id: t.id, type: 'task', title: t.title, sub: t.status, tags: t.tags }))
    projects.forEach(p => items.push({ id: p.id, type: 'project', title: p.title, sub: p.status, tags: p.tags }))
    goals.forEach(g => items.push({ id: g.id, type: 'goal', title: g.title, sub: g.status, tags: g.tags }))
    notes.forEach(n => items.push({ id: n.id, type: 'note', title: n.title, sub: n.tags?.join(', '), tags: n.tags }))
    journal.forEach(j => items.push({ id: j.id, type: 'journal', title: j.title, sub: j.mood, tags: [] }))
    resources.forEach(r => items.push({ id: r.id, type: 'resource', title: r.title, sub: r.type, tags: r.tags }))
    return items
}

export default function GlobalSearch({ onClose }) {
    const { tasks, projects, goals, notes, journal, resources } = useApp()
    const router = useRouter()
    const inputRef = useRef(null)
    const [query, setQuery] = useState('')
    const [activeIdx, setActiveIdx] = useState(0)

    const index = buildIndex(tasks, projects, goals, notes, journal, resources)

    const results = query.trim().length < 1 ? [] : index.filter(item => {
        const q = query.toLowerCase()
        return (
            item.title?.toLowerCase().includes(q) ||
            item.sub?.toLowerCase().includes(q) ||
            item.tags?.some(t => t.toLowerCase().includes(q))
        )
    }).slice(0, 20)

    // Group results by type
    const grouped = results.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = []
        acc[item.type].push(item)
        return acc
    }, {})

    const flat = results // flat list for keyboard nav

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    useEffect(() => {
        setActiveIdx(0)
    }, [query])

    const navigate = useCallback((item) => {
        const meta = TYPE_META[item.type]
        router.push(meta.href(item.id))
        onClose()
    }, [router, onClose])

    const handleKey = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIdx(i => Math.min(i + 1, flat.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIdx(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && flat[activeIdx]) {
            navigate(flat[activeIdx])
        } else if (e.key === 'Escape') {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

            {/* Search panel */}
            <div
                className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#e9e9e7] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Input row */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e9e9e7]">
                    <Search size={16} className="text-[#9b9a97] flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Search tasks, notes, projects, goals…"
                        className="flex-1 text-sm text-[#37352f] bg-transparent focus:outline-none placeholder-[#9b9a97]"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="text-[#9b9a97] hover:text-[#37352f]">
                            <X size={14} />
                        </button>
                    )}
                    <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] text-[#9b9a97] border border-[#e9e9e7] rounded">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {query.trim() === '' ? (
                        <div className="px-4 py-8 text-center text-xs text-[#9b9a97]">
                            Start typing to search across all your data
                        </div>
                    ) : results.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-[#9b9a97]">
                            No results for <span className="font-medium text-[#37352f]">&ldquo;{query}&rdquo;</span>
                        </div>
                    ) : (
                        <div className="py-2">
                            {Object.entries(grouped).map(([type, items]) => {
                                const meta = TYPE_META[type]
                                const Icon = meta.icon
                                return (
                                    <div key={type}>
                                        {/* Section header */}
                                        <div className="flex items-center gap-2 px-4 py-1.5">
                                            <Icon size={11} style={{ color: meta.color }} />
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9b9a97]">
                                                {meta.label}
                                            </span>
                                        </div>
                                        {items.map(item => {
                                            const globalIdx = flat.indexOf(item)
                                            const isActive = globalIdx === activeIdx
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => navigate(item)}
                                                    onMouseEnter={() => setActiveIdx(globalIdx)}
                                                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${isActive ? 'bg-[#f1f1ef]' : 'hover:bg-[#fafafa]'
                                                        }`}
                                                >
                                                    <div
                                                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: meta.color }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-[#37352f] truncate">
                                                            {highlight(item.title, query)}
                                                        </p>
                                                        {item.sub && (
                                                            <p className="text-xs text-[#9b9a97] truncate">
                                                                {highlight(item.sub, query)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
