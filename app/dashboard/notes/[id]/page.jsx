'use client'

import { useApp } from '@/context/AppContext'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import BlockEditor from '@/components/editor/BlockEditor'
import ReadOnlyBlock from '@/components/editor/ReadOnlyBlock'
import {
    ArrowLeft, Trash2, FileText, Save, Share2, X, FolderOpen, Check,
    Maximize2, Minimize2, BarChart3, Settings2, BookOpen, PanelRight,
    Search, Hash, Clock, Type, List, Layout, ChevronRight, Loader as LucideLoader
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Loader from '@/components/ui/Loader'
import {
    WhatsappShareButton, WhatsappIcon,
    TwitterShareButton, TwitterIcon,
    TelegramShareButton, TelegramIcon,
    EmailShareButton, EmailIcon
} from 'react-share'

export default function NoteEditorPage() {
    const { id } = useParams()
    const router = useRouter()
    const {
        notes, updateNote, deleteNote, loading, projects, fetchEndpoint,
        activeBlocks, fetchBlocks, bulkUpdateBlocks, setActiveBlocks, fetchEntity,
        focusMode, setFocusMode
    } = useApp()

    const note = notes.find(n => n.id === id)

    const { isFetched, isInitialized } = useApp()

    useEffect(() => {
        const loadPageData = async () => {
            if (!id || !isInitialized) return

            setPageLoading(true)
            try {
                // Fetch note if not in context
                if (!note) {
                    await fetchEntity('Note', id)
                }
                // Always fetch blocks for the specific note
                await fetchBlocks(id, 'Note')
            } catch (err) {
                console.error('Failed to load note data', err)
            } finally {
                setPageLoading(false)
            }
        }

        loadPageData()
    }, [id, isInitialized, fetchEntity, fetchBlocks, !!note])
    const project = projects?.find(p => note?.projectIds?.includes(p.id))

    useEffect(() => {
        if (!note?.projectIds?.length) return
        if (!isFetched('projects')) {
            fetchEndpoint('projects')
        }
    }, [note?.projectIds, fetchEndpoint, isFetched])

    const [title, setTitle] = useState('')
    const [projectIds, setProjectIds] = useState([])
    const [projectMenuOpen, setProjectMenuOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)
    const [savedBlocks, setSavedBlocks] = useState([])
    const [ready, setReady] = useState(false)
    const [notFoundDelay, setNotFoundDelay] = useState(false)
    const [initialized, setInitialized] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [shareUrl, setShareUrl] = useState('')
    const [pdfModalOpen, setPdfModalOpen] = useState(false)
    const [pdfTheme, setPdfTheme] = useState('bright')
    const [pdfGenerating, setPdfGenerating] = useState(false)
    const [sharing, setSharing] = useState(false)
    // Removed local focusMode
    const [metaPanelOpen, setMetaPanelOpen] = useState(false)
    const [tocOpen, setTocOpen] = useState(false)
    const [typography, setTypography] = useState('sans') // 'sans' or 'serif'
    const [stats, setStats] = useState({ words: 0, chars: 0, readingTime: 0 })
    const [toc, setToc] = useState([])

    const stateRef = useRef({ title, activeBlocks, projectIds })
    useEffect(() => {
        stateRef.current = { title, activeBlocks, projectIds }
    }, [title, activeBlocks, projectIds])

    // Blocks are now fetched in the data loading effect above

    useEffect(() => {
        if (!pageLoading && note && !initialized) {
            const draftStr = localStorage.getItem(`note_draft_${id}`)
            if (draftStr) {
                try {
                    const draft = JSON.parse(draftStr)
                    setTitle(draft.title || note.title || '')
                    setProjectIds(draft.projectIds || note.projectIds || [])
                    if (draft.blocks && draft.blocks.length > 0) {
                        setActiveBlocks(draft.blocks)
                        setSavedBlocks(note.content || []) // This will be compared against
                    }
                    setLastSaved('Draft (Unsaved)')
                } catch (e) {
                    setTitle(note.title || '')
                    setProjectIds(note.projectIds || [])
                }
            } else {
                setTitle(note.title || '')
                setProjectIds(note.projectIds || [])
                setLastSaved(note.updatedAt)
                // When first loading, activeBlocks will be what we fetched.
                // We shouldn't compare against note.content (which is empty).
                // Instead, we use a trick: the first time we get blocks, we mark them as saved.
            }

            setInitialized(true)
            setTimeout(() => setReady(true), 100)
            setNotFoundDelay(false)
        } else if (!pageLoading && !note) {
            const timer = setTimeout(() => { setNotFoundDelay(true) }, 400)
            return () => clearTimeout(timer)
        }
    }, [note, pageLoading, id, initialized, setActiveBlocks])

    // Reset Focus Mode on unmount
    useEffect(() => {
        return () => setFocusMode(false)
    }, [setFocusMode])

    useEffect(() => {
        if (initialized && activeBlocks?.length === 0 && !pageLoading) {
            setActiveBlocks([{ id: `b-init-${Date.now()}`, type: 'paragraph', content: '', order: 0 }])
        }
        // If we just loaded blocks for the first time and they are the initial blocks,
        // mark them as the "saved" blocks so we don't immediately trigger Draft status.
        if (initialized && activeBlocks?.length > 0 && savedBlocks.length === 0 && lastSaved !== 'Draft (Unsaved)') {
            setSavedBlocks(activeBlocks)
        }
    }, [initialized, activeBlocks, pageLoading, savedBlocks.length, lastSaved, setActiveBlocks])

    useEffect(() => {
        if (!ready || !note) return

        const isTitleChanged = title !== (note.title || '')
        const currentBlocksStr = JSON.stringify(activeBlocks || [])
        const savedBlocksStr = JSON.stringify(savedBlocks || [])
        const isProjectIdsChanged = JSON.stringify(projectIds) !== JSON.stringify(note.projectIds || [])

        if (isTitleChanged || currentBlocksStr !== savedBlocksStr || isProjectIdsChanged) {
            localStorage.setItem(`note_draft_${id}`, JSON.stringify({ title, blocks: activeBlocks, projectIds }))
            if (lastSaved !== 'Draft (Unsaved)') {
                setLastSaved('Draft (Unsaved)')
            }
        } else {
            localStorage.removeItem(`note_draft_${id}`)
            if (lastSaved === 'Draft (Unsaved)') {
                setLastSaved(note.updatedAt)
            }
        }
    }, [title, activeBlocks, ready, id, note, lastSaved, projectIds, savedBlocks])

    // Update Stats and TOC when blocks change
    useEffect(() => {
        if (!activeBlocks) return

        let text = title + ' '
        const headings = []

        activeBlocks.forEach(block => {
            if (['paragraph', 'heading1', 'heading2', 'heading3', 'bulleted-list', 'numbered-list', 'todo'].includes(block.type)) {
                text += block.content + ' '
            }
            if (['heading1', 'heading2', 'heading3'].includes(block.type)) {
                headings.push({
                    id: block.id,
                    level: block.type.replace('heading', ''),
                    text: block.content || 'Untitled Heading'
                })
            }
        })

        const words = text.trim() ? text.trim().split(/\s+/).length : 0
        const chars = text.length
        const readingTime = Math.ceil(words / 200) // Avg 200 wpm

        setStats({ words, chars, readingTime })
        setToc(headings)
    }, [activeBlocks, title])

    const handleSave = useCallback(async (blocksOverride) => {
        if (!note) return
        setIsSaving(true)
        const { title: latestTitle, projectIds: latestProjectIds, activeBlocks: latestBlocks } = stateRef.current;
        const finalBlocks = Array.isArray(blocksOverride) ? blocksOverride : latestBlocks;

        try {
            await Promise.all([
                updateNote(id, { title: latestTitle, projectIds: latestProjectIds }),
                bulkUpdateBlocks(id, 'Note', finalBlocks)
            ])
            localStorage.removeItem(`note_draft_${id}`)
            setSavedBlocks(finalBlocks)
            setLastSaved(new Date())
        } catch (err) {
            console.error('Save failed', err)
        } finally {
            setIsSaving(false)
        }
    }, [note, id, updateNote, bulkUpdateBlocks])

    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault()
                handleSave()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [handleSave])

    const handleShare = async () => {
        setSharing(true)
        try {
            const res = await fetch(`/api/notes/${id}/share`, { method: 'POST' })
            if (res.ok) {
                const { id: sharedId } = await res.json()
                const url = `${window.location.origin}/share/${sharedId}`
                setShareUrl(url)
            }
        } catch (err) {
            console.error('Share failed', err)
        } finally {
            setSharing(false)
        }
    }

    const handleDownloadPDF = async () => {
        setPdfGenerating(true)
        try {
            const response = await fetch(`/api/notes/${id}/pdf?theme=${pdfTheme}`)
            if (!response.ok) throw new Error('PDF conversion failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${title || 'Note'}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            setPdfModalOpen(false)
        } catch (err) {
            console.error('PDF generation failed', err)
            toast.error('PDF generation failed. Please try again.')
        } finally {
            setPdfGenerating(false)
        }
    }

    const handleDelete = () => {
        deleteNote(id)
        router.push('/dashboard/notes')
    }

    return (
        <div className={`flex flex-col h-full bg-[#0F172A] text-slate-200 relative overflow-hidden ${typography === 'serif' ? 'font-serif' : 'font-sans'}`}>
            {(pageLoading || (loading && !isInitialized) || (!note && !notFoundDelay)) && (
                <div className="fixed inset-0 flex items-center justify-center bg-[#0F172A] z-[70]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Syncing Library</span>
                    </div>
                </div>
            )}

            {!pageLoading && note && (
                <div className={`flex flex-col h-full transition-all duration-500 ease-out ${ready ? 'opacity-100' : 'opacity-0'}`}>

                    {/* Header: Next-Gen Unified Header */}
                    {!focusMode && (
                        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl z-20 sticky top-0">
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard/notes" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5">
                                    <ArrowLeft size={18} />
                                </Link>
                                <div className="h-4 w-px bg-white/10 mx-1" />
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                        <FileText size={16} className="text-indigo-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Editing Note</span>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="text-sm font-bold text-white bg-transparent focus:outline-none min-w-[200px] truncate"
                                            placeholder="Untitled Note"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Desktop Controls */}
                                <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setTypography(typography === 'sans' ? 'serif' : 'sans')}
                                        className={`p-1.5 rounded-lg transition-all ${typography === 'serif' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                                        title="Toggle Serif/Sans Font"
                                    >
                                        <Type size={16} />
                                    </button>
                                    <button
                                        onClick={() => setTocOpen(!tocOpen)}
                                        className={`p-1.5 rounded-lg transition-all ${tocOpen ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                                        title="Table of Contents"
                                    >
                                        <List size={16} />
                                    </button>
                                    <button
                                        onClick={() => setMetaPanelOpen(!metaPanelOpen)}
                                        className={`p-1.5 rounded-lg transition-all ${metaPanelOpen ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                                        title="Note Settings"
                                    >
                                        <Settings2 size={16} />
                                    </button>
                                </div>

                                <div className="h-4 w-px bg-white/10 mx-1" />

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setFocusMode(true)}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
                                        title="Focus Mode"
                                    >
                                        <Maximize2 size={16} />
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Save size={14} className={isSaving ? 'animate-spin' : ''} />
                                        <span>{isSaving ? 'Saving...' : 'Save'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Focus Mode Overlay Controls */}
                    {focusMode && (
                        <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 hover:border-indigo-500/30 transition-all group">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Focus Mode</span>
                                <button
                                    onClick={() => setFocusMode(false)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                >
                                    <Minimize2 size={14} />
                                </button>
                            </div>
                            <button
                                onClick={handleSave}
                                className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl transition-all active:scale-95"
                                title="Quick Save"
                            >
                                <Save size={16} />
                            </button>
                        </div>
                    )}

                    {/* Main Writing Area */}
                    <div className="flex-1 flex overflow-hidden relative">

                        {/* LEFT: Dynamic Table of Contents */}
                        {!focusMode && tocOpen && (
                            <aside className="w-72 bg-slate-900/30 border-r border-white/5 p-6 overflow-y-auto hidden lg:block animate-in slide-in-from-left duration-300">
                                <div className="flex items-center gap-2 mb-8">
                                    <List size={16} className="text-indigo-400" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Table of Contents</h4>
                                </div>
                                <div className="space-y-1">
                                    {toc.length > 0 ? toc.map((h, i) => (
                                        <a
                                            key={i}
                                            href={`#${h.id}`}
                                            className={`block text-sm py-1.5 transition-colors hover:text-white truncate
                                                ${h.level === '1' ? 'font-bold text-slate-300' :
                                                    h.level === '2' ? 'pl-4 text-slate-400 text-xs' :
                                                        'pl-8 text-slate-500 text-[10px]'}`}
                                        >
                                            {h.text}
                                        </a>
                                    )) : (
                                        <p className="text-xs text-slate-600 italic">Add headings to see them here...</p>
                                    )}
                                </div>
                            </aside>
                        )}

                        {/* CENTER: The Canvas */}
                        <div className={`flex-1 overflow-y-auto custom-scrollbar relative transition-all duration-500 ${focusMode ? 'py-12 md:py-24' : 'py-8 md:py-16'}`}>
                            {/* Theme Indicator (Top right of canvas) */}
                            {!focusMode && (
                                <div className="absolute top-4 right-8 flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                                        <Clock size={12} className="text-slate-500" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                            {isSaving ? 'Syncing...' : lastSaved === 'Draft (Unsaved)' ? 'Draft' : lastSaved ? `${format(new Date(lastSaved), 'HH:mm')}` : 'New'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className={`max-w-3xl mx-auto px-6 ${typography === 'serif' ? 'prose-serif' : 'prose-sans'}`}>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Click to set title..."
                                    className={`w-full bg-transparent focus:outline-none placeholder-slate-800 tracking-tight leading-tight mb-12 
                                        ${focusMode ? 'text-5xl md:text-7xl font-black text-center' : 'text-4xl md:text-6xl font-black'}`}
                                />

                                <BlockEditor
                                    blocks={activeBlocks}
                                    onChange={setActiveBlocks}
                                    isDiary={false}
                                    onSave={handleSave}
                                />

                                <div className="h-64" /> {/* Breathing room at bottom */}
                            </div>
                        </div>

                        {/* RIGHT: Meta Side-panel */}
                        {!focusMode && metaPanelOpen && (
                            <aside className="w-80 bg-slate-900/80 backdrop-blur-xl border-l border-white/10 p-8 overflow-y-auto z-20 animate-in slide-in-from-right duration-300 shadow-2xl">
                                <div className="flex items-center justify-between mb-10">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Note Settings</h4>
                                    <button onClick={() => setMetaPanelOpen(false)} className="text-slate-500 hover:text-white">
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="space-y-10">
                                    {/* Projects Section */}
                                    <section>
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] block mb-4">Project Association</label>
                                        <div className="relative">
                                            <button
                                                onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                                                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-sm group"
                                            >
                                                <div className="flex items-center gap-3 truncate">
                                                    <FolderOpen size={16} className="text-indigo-400" />
                                                    <span className="truncate">
                                                        {projectIds.length === 0 ? 'None' :
                                                            projectIds.length === 1 ? projects?.find(p => p.id === projectIds[0])?.title :
                                                                `${projectIds.length} Projects`}
                                                    </span>
                                                </div>
                                                <ChevronRight size={14} className={`text-slate-600 transition-transform ${projectMenuOpen ? 'rotate-90' : ''}`} />
                                            </button>

                                            {projectMenuOpen && (
                                                <div className="absolute top-full mt-2 right-0 left-0 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 max-h-60 overflow-y-auto">
                                                    {projects?.map(p => (
                                                        <button
                                                            key={p.id}
                                                            onClick={() => {
                                                                if (projectIds.includes(p.id)) setProjectIds(projectIds.filter(id => id !== p.id));
                                                                else setProjectIds([...projectIds, p.id]);
                                                            }}
                                                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/10 text-xs text-slate-300"
                                                        >
                                                            <span className="truncate">{p.title}</span>
                                                            {projectIds.includes(p.id) && <Check size={14} className="text-indigo-400" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* Stats Section in Panel */}
                                    <section className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                        <label className="text-[9px] font-black text-indigo-400/50 uppercase tracking-[0.3em] block mb-4">Document Stats</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xl font-black text-white">{stats.words}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Words</p>
                                            </div>
                                            <div>
                                                <p className="text-xl font-black text-white">{stats.readingTime}m</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Read Time</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Quick Actions */}
                                    <section className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] block mb-4">Actions</label>
                                        <button onClick={handleShare} className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs transition-all font-bold">
                                            <Share2 size={16} className="text-blue-400" /> Share Note
                                        </button>
                                        <button onClick={() => setPdfModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs transition-all font-bold">
                                            <FileText size={16} className="text-emerald-400" /> Export PDF
                                        </button>
                                        <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/5 hover:bg-red-500 text-white rounded-2xl text-xs transition-all font-bold">
                                            <Trash2 size={16} /> Delete Note
                                        </button>
                                    </section>
                                </div>
                            </aside>
                        )}
                    </div>

                    {/* BOTTOM: Minimal Stats Bar */}
                    {!focusMode && (
                        <div className="flex items-center justify-between px-6 py-2 border-t border-white/5 bg-slate-900/80 backdrop-blur-md text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] relative z-20">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <BarChart3 size={12} className="text-indigo-500" />
                                    <span>{stats.words} Words</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-emerald-500" />
                                    <span>{stats.readingTime} Min Read</span>
                                </div>
                                <div className="hidden sm:flex items-center gap-2">
                                    <Type size={12} className="text-amber-500" />
                                    <span>{stats.chars} Characters</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span>v2.0 ZEN ENGINE</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ERROR / NOT FOUND */}
            {!pageLoading && !note && notFoundDelay && (
                <div className="flex items-center justify-center h-full animate-in fade-in duration-500">
                    <div className="text-center p-12 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">
                        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <X size={40} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Note Not Found</h3>
                        <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">This entry may have been moved, deleted, or you might not have access.</p>
                        <Link href="/dashboard/notes" className="inline-flex items-center gap-3 px-8 py-3 bg-white text-slate-900 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                            <ArrowLeft size={16} /> Return to Library
                        </Link>
                    </div>
                </div>
            )}

            {/* MODALS */}
            {shareUrl && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/10 p-10 w-full max-w-md relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShareUrl('')} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl">
                            <X size={24} />
                        </button>
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                                <Share2 size={32} className="text-indigo-400" />
                            </div>
                            <h3 className="font-black text-3xl text-white mb-2 italic">Share the Knowledge</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Generate a public link for this note</p>
                        </div>

                        <div className="group relative mb-8">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl blur opacity-20 group-focus-within:opacity-100 transition duration-1000"></div>
                            <div className="relative flex items-center gap-3 p-4 bg-slate-950 rounded-2xl border border-white/5 overflow-hidden">
                                <input readOnly value={shareUrl} className="bg-transparent text-xs text-slate-300 flex-1 outline-none font-medium truncate" />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(shareUrl)
                                        toast.success('Link copied to clipboard!')
                                    }}
                                    className="px-6 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black transition-all hover:bg-slate-200 active:scale-95"
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { Button: WhatsappShareButton, Icon: WhatsappIcon, label: 'WA' },
                                { Button: TwitterShareButton, Icon: TwitterIcon, label: 'X' },
                                { Button: TelegramShareButton, Icon: TelegramIcon, label: 'TG' },
                                { Button: EmailShareButton, Icon: EmailIcon, label: 'Mail' }
                            ].map(({ Button, Icon, label }) => (
                                <Button key={label} url={shareUrl} title={title}>
                                    <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                        <div className="p-0.5 rounded-full group-hover:scale-110 transition-transform shadow-lg group-active:scale-90 bg-white/5">
                                            <Icon size={48} round />
                                        </div>
                                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{label}</span>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {pdfModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
                        <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="font-black text-2xl text-white">Export Engine</h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black mt-1">High-fidelity PDF generation</p>
                            </div>
                            <button onClick={() => setPdfModalOpen(false)} className="p-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-10">
                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <button
                                    onClick={() => setPdfTheme('bright')}
                                    className={`relative flex flex-col items-center gap-5 p-6 rounded-[2rem] border-2 transition-all group overflow-hidden ${pdfTheme === 'bright' ? 'border-white bg-white/5 ring-8 ring-white/5' : 'border-white/5 hover:border-white/10'}`}
                                >
                                    <div className="w-full aspect-video bg-white rounded-xl shadow-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <div className="w-2/3 space-y-2">
                                            <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                                            <div className="h-2 w-2/3 bg-slate-50 rounded-full"></div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">Bright (Minimal)</span>
                                    {pdfTheme === 'bright' && <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl scale-110">
                                        <Check size={14} strokeWidth={4} />
                                    </div>}
                                </button>

                                <button
                                    onClick={() => setPdfTheme('dark')}
                                    className={`relative flex flex-col items-center gap-5 p-6 rounded-[2rem] border-2 transition-all group overflow-hidden ${pdfTheme === 'dark' ? 'border-indigo-500 bg-indigo-500/10 ring-8 ring-indigo-500/5' : 'border-white/5 hover:border-white/10'}`}
                                >
                                    <div className="w-full aspect-video bg-[#0F172A] rounded-xl shadow-2xl flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                                        <div className="w-2/3 space-y-2">
                                            <div className="h-2 w-full bg-slate-800 rounded-full"></div>
                                            <div className="h-2 w-2/3 bg-slate-900 rounded-full"></div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">Premium Dark</span>
                                    {pdfTheme === 'dark' && <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-xl scale-110">
                                        <Check size={14} strokeWidth={4} />
                                    </div>}
                                </button>
                            </div>

                            <button
                                onClick={handleDownloadPDF}
                                disabled={pdfGenerating}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-indigo-500/20"
                            >
                                {pdfGenerating ? (
                                    <>
                                        <LucideLoader size={24} className="animate-spin" />
                                        <span>Synthesizing...</span>
                                    </>
                                ) : (
                                    <>
                                        <FileText size={20} />
                                        <span>Download Edition</span>
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-slate-700 mt-10 uppercase tracking-[0.5em] font-black font-mono">End of Session • v2.0</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}