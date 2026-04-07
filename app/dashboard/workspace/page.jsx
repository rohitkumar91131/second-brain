'use client'

import { useApp } from '@/context/AppContext'
import { useState, useEffect, useCallback } from 'react'
import { Folder, FolderOpen, FileText, X, ChevronRight, ChevronDown, Plus, MoreVertical, Trash2, Edit2, FilePlus, FolderPlus, Search, PanelLeftClose, PanelLeftOpen, Clock, Hash } from 'lucide-react'
import BlockEditor from '@/components/editor/BlockEditor'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'

export default function WorkspacePage() {
    const { projects, notes, fetchEndpoint, activeBlocks, fetchBlocks, bulkUpdateBlocks, setActiveBlocks, updateNote, addNote, deleteNote } = useApp()

    const [expandedProjects, setExpandedProjects] = useState({})
    const [openTabs, setOpenTabs] = useState([]) // Array of note objects { id, title }
    const [activeTabId, setActiveTabId] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [loadingNoteId, setLoadingNoteId] = useState(null)
    const [editingNoteId, setEditingNoteId] = useState(null)
    const [editTitleValue, setEditTitleValue] = useState('')
    const [hoveredNoteId, setHoveredNoteId] = useState(null)
    const [isUnassignedExpanded, setIsUnassignedExpanded] = useState(true)
    const [isInitialized, setIsInitialized] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Load initial data and local storage state
    useEffect(() => {
        if (!isInitialized) {
            if (!projects || projects.length === 0) fetchEndpoint('projects')
            if (!notes || notes.length === 0) fetchEndpoint('notes')

            // Load persistent tabs state
            try {
                const savedTabs = localStorage.getItem('sbt_workspace_tabs')
                if (savedTabs) setOpenTabs(JSON.parse(savedTabs))

                const savedActiveTab = localStorage.getItem('sbt_workspace_active_tab')
                if (savedActiveTab) setActiveTabId(savedActiveTab)

                const savedSidebarState = localStorage.getItem('sbt_workspace_sidebar')
                if (savedSidebarState !== null) {
                    setIsSidebarOpen(JSON.parse(savedSidebarState))
                }
            } catch (e) {
                console.error('Failed to parse workspace local storage', e)
            }
            setIsInitialized(true)
        }
    }, [isInitialized, projects, notes, fetchEndpoint])

    // Save tabs to persistent storage
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('sbt_workspace_tabs', JSON.stringify(openTabs))
            if (activeTabId) {
                localStorage.setItem('sbt_workspace_active_tab', activeTabId)
            } else {
                localStorage.removeItem('sbt_workspace_active_tab')
            }
        }
    }, [openTabs, activeTabId, isInitialized])

    const toggleProject = (projectId) => {
        setExpandedProjects(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }))
    }

    const openNote = (note) => {
        if (!openTabs.find(t => t.id === note.id)) {
            setOpenTabs(prev => [...prev, { id: note.id, title: note.title }])
        }
        setActiveTabId(note.id)
    }

    const closeTab = (e, noteId) => {
        e.stopPropagation()
        const newTabs = openTabs.filter(t => t.id !== noteId)
        setOpenTabs(newTabs)
        if (activeTabId === noteId) {
            setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null)
        }
    }

    // Handle switching tabs
    useEffect(() => {
        if (activeTabId) {
            // Check cache first
            let cachedBlocks = null
            try {
                const cacheStr = localStorage.getItem(`sbt_note_cache_${activeTabId}`)
                if (cacheStr) {
                    cachedBlocks = JSON.parse(cacheStr)
                    setActiveBlocks(cachedBlocks)
                }
            } catch (e) { /* ignore */ }

            if (!cachedBlocks) {
                setLoadingNoteId(activeTabId)
            }

            fetchBlocks(activeTabId, 'Note').then((freshBlocks) => {
                // Background update cache
                try {
                    localStorage.setItem(`sbt_note_cache_${activeTabId}`, JSON.stringify(freshBlocks))
                } catch (e) { /* ignore */ }
            }).finally(() => {
                if (!cachedBlocks) {
                    setLoadingNoteId(null)
                }
            })
        } else {
            // Only clear if there's actually something to clear to avoid loop
            setActiveBlocks(prev => prev.length > 0 ? [] : prev)
        }
    }, [activeTabId, fetchBlocks, setActiveBlocks])

    // Memoized onChange to prevent re-renders of BlockEditor causing loops
    const handleBlocksChange = useCallback((newBlocks) => {
        setActiveBlocks(prev => {
            // Quick check for same reference
            if (prev === newBlocks) return prev;
            // Slightly deeper check if lengths differ
            if (prev.length !== newBlocks.length) return newBlocks;
            // Content check could be here but for performance we rely on the editor's updateBlock stabilization
            return newBlocks;
        })
    }, [setActiveBlocks])

    // Effect to continuously save the active blocks cache as user types
    useEffect(() => {
        if (activeTabId && activeBlocks && activeBlocks.length > 0) {
            try {
                localStorage.setItem(`sbt_note_cache_${activeTabId}`, JSON.stringify(activeBlocks))
            } catch (e) { /* ignore */ }
        }
    }, [activeBlocks, activeTabId])

    // Save active note blocks
    const handleSave = useCallback(async (title = undefined) => {
        if (!activeTabId) return
        setIsSaving(true)
        try {
            const activeNote = notes.find(n => n.id === activeTabId)
            const titleToSave = title !== undefined ? title : activeNote?.title

            await Promise.all([
                updateNote(activeTabId, { title: titleToSave }),
                bulkUpdateBlocks(activeTabId, 'Note', activeBlocks)
            ])
            toast.success('Saved successfully')

            // Update title in tabs if changed
            if (title !== undefined) {
                setOpenTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, title } : t))
            }
        } catch (err) {
            console.error('Save failed', err)
            toast.error('Failed to save')
        } finally {
            setIsSaving(false)
        }
    }, [activeTabId, activeBlocks, notes, updateNote, bulkUpdateBlocks])

    // Keyboard shortcuts for saving and Quick Open
    useEffect(() => {
        const onKey = (e) => {
            // Save (Ctrl+S / Cmd+S)
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault()
                handleSave()
            }
            // Quick Open (Ctrl+P / Cmd+P)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault()
                setIsSearchOpen(true)
            }
            // Close Quick Open (Esc)
            if (e.key === 'Escape') {
                setIsSearchOpen(false)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [handleSave])

    const toggleSidebar = () => {
        const newState = !isSidebarOpen
        setIsSidebarOpen(newState)
        localStorage.setItem('sbt_workspace_sidebar', JSON.stringify(newState))
    }

    const handleCreateNote = async (projectId = null) => {
        try {
            const noteData = { title: 'Untitled Note', projectIds: projectId ? [projectId] : [] }
            const newNote = await addNote(noteData)
            if (newNote) {
                if (projectId) {
                    setExpandedProjects(prev => ({ ...prev, [projectId]: true }))
                } else {
                    setIsUnassignedExpanded(true)
                }
                openNote(newNote)
                setEditingNoteId(newNote.id)
                setEditTitleValue('Untitled Note')
                toast.success('Note created')
            }
        } catch (error) {
            toast.error('Failed to create note')
        }
    }

    const handleDeleteNote = async (e, noteId) => {
        e.stopPropagation()
        if (confirm('Are you sure you want to delete this note?')) {
            try {
                await deleteNote(noteId)
                if (activeTabId === noteId) {
                    closeTab({ stopPropagation: () => { } }, noteId)
                } else {
                    setOpenTabs(prev => prev.filter(t => t.id !== noteId))
                }
                toast.success('Note deleted')
            } catch (error) {
                toast.error('Failed to delete note')
            }
        }
    }

    const startEditingTitle = (e, note) => {
        e.stopPropagation()
        setEditingNoteId(note.id)
        setEditTitleValue(note.title || 'Untitled')
    }

    const handleRenameSubmit = async (noteId) => {
        if (!editTitleValue.trim()) {
            setEditingNoteId(null)
            return
        }
        try {
            await updateNote(noteId, { title: editTitleValue })
            setOpenTabs(prev => prev.map(t => t.id === noteId ? { ...t, title: editTitleValue } : t))
            setEditingNoteId(null)
        } catch (error) {
            toast.error('Failed to rename')
        }
    }

    const activeNoteOriginal = notes?.find(n => n.id === activeTabId)

    // Filtering for unassigned notes
    const unassignedNotes = notes?.filter(n => !n.projectIds || n.projectIds.length === 0) || []

    const renderNoteItem = (note, indentClass = "pl-6") => {
        const isActive = activeTabId === note.id
        const isEditing = editingNoteId === note.id
        const isHovered = hoveredNoteId === note.id

        return (
            <div
                key={note.id}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs focus:outline-none cursor-pointer group transition-all rounded-xl mx-1 w-[calc(100%-8px)] ${isActive ? 'bg-indigo-500/10 text-indigo-400 font-bold' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}`}
                onClick={() => !isEditing && openNote(note)}
                onMouseEnter={() => setHoveredNoteId(note.id)}
                onMouseLeave={() => setHoveredNoteId(null)}
            >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <FileText size={14} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                    {isEditing ? (
                        <input
                            autoFocus
                            value={editTitleValue}
                            onChange={(e) => setEditTitleValue(e.target.value)}
                            onBlur={() => handleRenameSubmit(note.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSubmit(note.id)
                                if (e.key === 'Escape') setEditingNoteId(null)
                            }}
                            className="bg-white/5 text-white border border-indigo-500/50 px-2 rounded-lg w-full outline-none text-xs h-6"
                            onClick={e => e.stopPropagation()}
                        />
                    ) : (
                        <span className="truncate flex-1 text-left tracking-wide">{note.title || 'Untitled Note'}</span>
                    )}
                </div>

                {/* Actions on Hover */}
                {!isEditing && (isHovered || isActive) && (
                    <div className="flex items-center gap-1 opacity-100 flex-shrink-0 animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={(e) => startEditingTitle(e, note)} className="p-1 px-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all" title="Rename">
                            <Edit2 size={12} />
                        </button>
                        <button onClick={(e) => handleDeleteNote(e, note.id)} className="p-1 px-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                            <Trash2 size={12} />
                        </button>
                    </div>
                )}
            </div>
        )
    }

    // Prepare data for Quick Open Search
    const recentNotes = [...(notes || [])].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5)

    const filteredNotes = searchQuery.trim() === ''
        ? recentNotes
        : (notes || []).filter(n => {
            const query = searchQuery.toLowerCase()
            const matchTitle = (n.title || 'Untitled').toLowerCase().includes(query)
            const matchTags = Array.isArray(n.tags) && n.tags.some(tag => tag.toLowerCase().includes(query))
            return matchTitle || matchTags
        })

    return (
        <div className="flex h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative">

            {/* Quick Open Modal overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-start pt-[15vh] bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsSearchOpen(false)}>
                    <div className="bg-[#1E293B] w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[60vh] animate-in fade-in slide-in-from-top-4 duration-200"
                        onClick={e => e.stopPropagation()}>
                        {/* Search Input */}
                        <div className="flex items-center px-5 py-4 border-b border-white/5">
                            <Search size={18} className="text-slate-500 mr-3" />
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Quick search notes, tags, ideas..."
                                className="flex-1 bg-transparent text-white placeholder-slate-600 outline-none text-[15px] font-medium"
                            />
                            <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest select-none">
                                <kbd className="bg-white/5 px-2 py-0.5 rounded border border-white/10">ESC</kbd> to close
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                            {searchQuery.trim() === '' && (
                                <div className="px-3 py-2 text-xs font-medium text-[#94A3B8] dark:text-[#64748B] uppercase tracking-wider mb-1 mt-1">
                                    Recent Notes
                                </div>
                            )}

                            {filteredNotes.length > 0 ? (
                                <div className="space-y-0.5">
                                    {filteredNotes.map(note => (
                                        <div
                                            key={note.id}
                                            onClick={() => {
                                                openNote(note)
                                                setIsSearchOpen(false)
                                            }}
                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 w-full min-w-0">
                                                {searchQuery.trim() === '' ? (
                                                    <Clock size={16} className="text-[#94A3B8] dark:text-[#64748B] shrink-0" />
                                                ) : (
                                                    <FileText size={16} className="text-[#4F46E5] dark:text-[#818CF8] shrink-0" />
                                                )}

                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-[14px] text-[#0F172A] dark:text-[#E2E8F0] font-medium truncate">
                                                        {note.title || 'Untitled Note'}
                                                    </span>
                                                    {note.tags && note.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {note.tags.map(tag => (
                                                                <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-[#E2E8F0] dark:bg-[#0F172A] rounded text-[#64748B] dark:text-[#94A3B8]">
                                                                    <Hash size={8} />
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-[#94A3B8] dark:text-[#64748B]">
                                    <Search size={32} className="mb-4 opacity-50" />
                                    <p className="text-sm">No notes found matching &quot;{searchQuery}&quot;</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar (File Explorer) */}
            <div className={`bg-[#1E293B] flex flex-col border-r border-white/5 flex-shrink-0 z-10 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[280px]' : 'w-0 border-r-0 overflow-hidden'}`}>
                <div className="px-5 py-5 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase flex items-center justify-between shrink-0">
                    <span className="opacity-80">Explorer</span>
                    <button onClick={() => handleCreateNote(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all" title="New Note">
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-2 outline-none custom-scrollbar">
                    {/* Projects List */}
                    {projects?.map(project => {
                        const isExpanded = expandedProjects[project.id]
                        const projectNotes = notes?.filter(n => n.projectIds?.includes(project.id)) || []

                        return (
                            <div key={project.id} className="mb-0.5">
                                <div className="group flex items-center justify-between pr-2 hover:bg-[#E2E8F0] dark:hover:bg-[#1F2937] transition-colors duration-120 rounded-md mx-2">
                                    <button
                                        onClick={() => toggleProject(project.id)}
                                        className="flex-1 flex items-center gap-1.5 px-2 py-1.5 cursor-pointer text-[14px] focus:outline-none"
                                    >
                                        <span className="text-[#94A3B8] dark:text-[#6B7280] transition-transform duration-150">
                                            {isExpanded ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
                                        </span>
                                        <span className="text-[#94A3B8] dark:text-[#6B7280]">
                                            {isExpanded ? <FolderOpen size={14} strokeWidth={1.5} /> : <Folder size={14} strokeWidth={1.5} />}
                                        </span>
                                        <span className="truncate flex-1 text-left pl-0.5 font-medium text-[#1E293B] dark:text-[#E5E7EB]">{project.title}</span>
                                    </button>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-120">
                                        <button onClick={(e) => { e.stopPropagation(); handleCreateNote(project.id) }} className="p-1 rounded text-[#94A3B8] dark:text-[#6B7280] hover:text-[#0F172A] dark:hover:text-[#E5E7EB] hover:bg-[#CBD5E1] dark:hover:bg-[#374151]" title="New File in Project">
                                            <Plus size={12} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="pb-1 mt-1">
                                        {projectNotes.map(note => renderNoteItem(note, "pl-8"))}
                                        {projectNotes.length === 0 && (
                                            <div className="pl-8 py-1.5 text-[13px] text-[#94A3B8] dark:text-[#6B7280] italic">Empty project</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Unassigned Notes */}
                    {unassignedNotes.length > 0 && (
                        <div className="mt-4 border-t border-[#E2E8F0] dark:border-[#1F2937] pt-2">
                            <div className="group flex items-center justify-between pr-2 hover:bg-[#E2E8F0] dark:hover:bg-[#1F2937] transition-colors duration-120 rounded-md mx-2">
                                <button
                                    onClick={() => setIsUnassignedExpanded(!isUnassignedExpanded)}
                                    className="flex-1 flex items-center gap-1.5 px-2 py-1.5 cursor-pointer text-[14px] focus:outline-none"
                                >
                                    <span className="text-[#94A3B8] dark:text-[#6B7280] transition-transform duration-150">
                                        {isUnassignedExpanded ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
                                    </span>
                                    <span className="text-[#94A3B8] dark:text-[#6B7280]">
                                        {isUnassignedExpanded ? <FolderOpen size={14} strokeWidth={1.5} /> : <Folder size={14} strokeWidth={1.5} />}
                                    </span>
                                    <span className="truncate flex-1 text-left pl-0.5 font-medium text-[#1E293B] dark:text-[#E5E7EB]">Unassigned Notes</span>
                                </button>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-120">
                                    <button onClick={(e) => { e.stopPropagation(); handleCreateNote(null) }} className="p-1 rounded text-[#94A3B8] dark:text-[#6B7280] hover:text-[#0F172A] dark:hover:text-[#E5E7EB] hover:bg-[#CBD5E1] dark:hover:bg-[#374151]" title="New Unassigned File">
                                        <Plus size={12} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>

                            {isUnassignedExpanded && (
                                <div className="pb-1 mt-1">
                                    {unassignedNotes.map(note => renderNoteItem(note, "pl-8"))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0F172A] relative overflow-hidden">
                {/* Tabs Bar */}
                <div className="flex items-center gap-2 bg-[#1E293B] border-b border-white/5 px-2 pt-2 shrink-0">
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors mb-1 mr-1 shrink-0"
                        title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                        {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </button>

                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors mb-1 mr-2 shrink-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        title="Search Notes (Ctrl+P)"
                    >
                        <Search size={16} />
                        <span className="hidden sm:inline-block border border-white/5 rounded px-1.5 py-0.5 bg-white/5">⌘P</span>
                    </button>

                    <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
                        {openTabs.map(tab => {
                            const isActive = activeTabId === tab.id
                            return (
                                <div
                                    key={tab.id}
                                    onClick={() => setActiveTabId(tab.id)}
                                    className={`
                                        group flex items-center gap-2 px-4 py-2 min-w-[120px] max-w-[200px] cursor-pointer relative transition-all duration-150 rounded-t-xl
                                        ${isActive ? 'bg-[#0F172A] text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                                    `}
                                >
                                    <span className="truncate text-xs font-bold select-none flex-1 tracking-tight">{tab.title || 'Untitled'}</span>
                                    <button
                                        onClick={(e) => closeTab(e, tab.id)}
                                        className={`p-1 rounded-md hover:bg-white/10 hover:text-white transition-all ${isActive ? 'opacity-100 text-slate-600' : 'opacity-0 group-hover:opacity-100 text-slate-600'}`}
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {!activeTabId ? (
                    <div className="flex-1 flex items-center justify-center bg-[#0F172A]">
                        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="w-24 h-24 rounded-3xl premium-gradient flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20">
                                <FileText size={48} className="text-white opacity-90" />
                            </div>
                            <h2 className="text-white text-3xl font-bold mb-4 tracking-tight select-none">Start creating something great</h2>
                            <p className="text-slate-500 mb-10 max-w-sm mx-auto">Select a note from the explorer or create a new one to begin your journey.</p>

                            <div className="flex flex-col gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto select-none border border-white/5 rounded-3xl p-8 glass-dark">
                                <div className="flex justify-between items-center group cursor-pointer hover:text-white transition-colors" onClick={() => handleCreateNote(null)}>
                                    <span className="flex items-center gap-3"><Plus size={16} strokeWidth={3} className="text-indigo-400" /> New Entry</span>
                                    <kbd className="font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-slate-500 group-hover:text-white transition-colors">Sidebar</kbd>
                                </div>
                                <div className="h-px bg-white/5 w-full" />
                                <div className="flex justify-between items-center group cursor-pointer hover:text-white transition-colors" onClick={() => handleSave()}>
                                    <span className="flex items-center gap-3"><Edit2 size={16} strokeWidth={3} className="text-indigo-400" /> Save Draft</span>
                                    <kbd className="font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-slate-500 group-hover:text-white transition-colors">⌘S</kbd>
                                </div>
                                <div className="h-px bg-white/5 w-full" />
                                <div className="flex justify-between items-center group cursor-pointer hover:text-white transition-colors" onClick={() => setIsSearchOpen(true)}>
                                    <span className="flex items-center gap-3"><Search size={16} strokeWidth={3} className="text-indigo-400" /> Quick Find</span>
                                    <kbd className="font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-slate-500 group-hover:text-white transition-colors">⌘P</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Editor Content Area */}
                {activeTabId && (
                    <div className="flex-1 overflow-y-auto bg-[#FFFFFF] dark:bg-[#0B1220] vscode-editor-container custom-scrollbar">
                        {loadingNoteId === activeTabId ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader />
                            </div>
                        ) : (
                            <div className="max-w-[720px] mx-auto py-12 px-6 lg:px-8 animate-in fade-in duration-300 relative">
                                <input
                                    value={activeNoteOriginal?.title || ''}
                                    onChange={(e) => {
                                        const newTitle = e.target.value
                                        updateNote(activeTabId, { title: newTitle })
                                        setOpenTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, title: newTitle } : t))
                                    }}
                                    placeholder="Untitled Note"
                                    className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-8 text-[#0F172A] dark:text-[#E5E7EB] placeholder-[#94A3B8] dark:placeholder-[#4B5563] tracking-tight transition-colors focus:placeholder-[#64748B] dark:focus:placeholder-[#374151]"
                                />
                                <div className="text-[#1E293B] dark:text-[#E5E7EB] bg-[#FFFFFF] dark:bg-[#0B1220] text-[15px] leading-relaxed">
                                    <BlockEditor
                                        blocks={activeBlocks}
                                        onChange={handleBlocksChange}
                                        isDiary={false}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Global Styles to override BlockEditor defaults for Minimal Premium theme */}
            <style jsx global>{`
                .vscode-editor-container [contenteditable="true"] {
                    color: inherit !important;
                    font-size: 15px;
                    line-height: 1.7;
                    font-family: 'Inter', 'Satoshi', 'Plus Jakarta Sans', sans-serif;
                }
                .dark .vscode-editor-container [contenteditable="true"] {
                    color: #E5E7EB !important;
                }
                .vscode-editor-container [data-placeholder]:empty:before {
                    color: #94A3B8 !important;
                }
                .dark .vscode-editor-container [data-placeholder]:empty:before {
                    color: #6B7280 !important;
                }
                .vscode-editor-container .notion-block-menu {
                    background-color: #FFFFFF !important;
                    border: 1px solid #E2E8F0 !important;
                    color: #1E293B !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                    border-radius: 8px !important;
                }
                .dark .vscode-editor-container .notion-block-menu {
                    background-color: #111827 !important;
                    border: 1px solid #1F2937 !important;
                    color: #E5E7EB !important;
                }
                .vscode-editor-container .notion-block-menu button:hover {
                    background-color: #F1F5F9 !important;
                    color: #0F172A !important;
                }
                .dark .vscode-editor-container .notion-block-menu button:hover {
                    background-color: #1F2937 !important;
                    color: white !important;
                }
                .vscode-editor-container ::selection {
                    background-color: rgba(99, 102, 241, 0.2) !important;
                    color: inherit !important;
                }
                .dark .vscode-editor-container ::selection {
                    background-color: rgba(99, 102, 241, 0.3) !important;
                    color: inherit !important;
                }
                
                /* Minimal Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: transparent;
                    border-radius: 4px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: #CBD5E1;
                }
                .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: #374151;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94A3B8;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #4B5563;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:active {
                    background: #64748B;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:active {
                    background: #6B7280;
                }
                
                /* Clean standard scrollbars */
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #F8FAFC;
                }
                .dark ::-webkit-scrollbar-track {
                    background: #0F172A;
                }
                ::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 4px;
                }
                .dark ::-webkit-scrollbar-thumb {
                    background: #1F2937;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
            `}</style>
        </div>
    )
}

