'use client'

import { useApp } from '@/context/AppContext'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import BlockEditor from '@/components/editor/BlockEditor'
import { ArrowLeft, Trash2, FileText, Save } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import Loader from '@/components/ui/Loader'

export default function NoteEditorPage() {
    const { id } = useParams()
    const router = useRouter()
    const {
        notes, updateNote, deleteNote, loading, projects, fetchEndpoint,
        activeBlocks, fetchBlocks, bulkUpdateBlocks, setActiveBlocks, fetchEntity
    } = useApp()

    const note = notes.find(n => n.id === id)

    useEffect(() => {
        if (id && !note) {
            fetchEntity('Note', id).catch(e => console.error('Fetch note failed', e))
        }
    }, [id, note, fetchEntity])
    const project = projects?.find(p => p.id === note?.projectId)

    useEffect(() => {
        if (!note?.projectId) return
        const has = projects && projects.find(p => p.id === note.projectId)
        if (!has) fetchEndpoint('projects')
    }, [note?.projectId, projects, fetchEndpoint])

    const [title, setTitle] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)
    const [ready, setReady] = useState(false)
    const [notFoundDelay, setNotFoundDelay] = useState(false)
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        if (id) fetchBlocks(id, 'Note')
    }, [id, fetchBlocks])

    useEffect(() => {
        if (!loading && note && !initialized) {
            const draftStr = localStorage.getItem(`note_draft_${id}`)
            if (draftStr) {
                try {
                    const draft = JSON.parse(draftStr)
                    setTitle(draft.title || note.title || '')
                    if (draft.blocks && draft.blocks.length > 0) {
                        setActiveBlocks(draft.blocks)
                    }
                    setLastSaved('Draft (Unsaved)')
                } catch (e) {
                    setTitle(note.title || '')
                }
            } else {
                setTitle(note.title || '')
                setLastSaved(note.updatedAt)
            }

            setInitialized(true)
            setTimeout(() => setReady(true), 100)
            setNotFoundDelay(false)
        } else if (!loading && !note) {
            const timer = setTimeout(() => { setNotFoundDelay(true) }, 400)
            return () => clearTimeout(timer)
        }
    }, [note, loading, id, initialized, setActiveBlocks])

    useEffect(() => {
        if (initialized && activeBlocks?.length === 0 && !loading) {
            setActiveBlocks([{ id: `b-init-${Date.now()}`, type: 'paragraph', content: '', order: 0 }])
        }
    }, [initialized, activeBlocks?.length, loading, setActiveBlocks])

    useEffect(() => {
        if (ready) {
            localStorage.setItem(`note_draft_${id}`, JSON.stringify({ title, blocks: activeBlocks }))
        }
    }, [title, activeBlocks, ready, id])

    const handleSave = useCallback(async () => {
        if (!note) return
        setIsSaving(true)
        try {
            await Promise.all([
                updateNote(id, { title }),
                bulkUpdateBlocks(id, 'Note', activeBlocks)
            ])
            localStorage.removeItem(`note_draft_${id}`)
            setLastSaved(new Date())
        } catch (err) {
            console.error('Save failed', err)
        } finally {
            setIsSaving(false)
        }
    }, [note, id, title, activeBlocks, updateNote, bulkUpdateBlocks])

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

    const handleDelete = () => {
        deleteNote(id)
        router.push('/dashboard/notes')
    }

    return (
        <div className="flex flex-col h-full bg-notion-bg relative">

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-notion-bg/50 backdrop-blur-sm z-50">
                    <Loader />
                </div>
            )}

            {!loading && !note && notFoundDelay && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <p className="text-notion-muted text-sm mb-3 font-medium">Note not found</p>
                        <Link href="/dashboard/notes" className="text-sm text-notion-accent hover:underline font-semibold">
                            ← Back to Notes
                        </Link>
                    </div>
                </div>
            )}

            {!loading && note && (
                <div className={`flex flex-col h-full transition-all duration-300 ease-out ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

                    {/* Header: Responsive Gap and Padding */}
                    <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 border-b border-notion-border bg-notion-bg/80 backdrop-blur-md z-10 sticky top-0">
                        <Link href="/dashboard/notes" className="p-1.5 rounded-lg hover:bg-notion-hover text-notion-muted hover:text-notion-text transition-all flex-shrink-0">
                            <ArrowLeft size={16} />
                        </Link>

                        <div className="flex-1 flex items-center gap-2 min-w-0">
                            <span className="hidden sm:inline text-xs font-semibold text-notion-muted uppercase tracking-wider">Notes</span>
                            <span className="hidden sm:inline text-xs text-[#d3d1cb]">/</span>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-sm font-bold text-notion-text bg-transparent focus:outline-none flex-1 truncate"
                            />
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                            {project && (
                                <div className="group relative hidden md:block">
                                    <span className="text-sm font-bold text-notion-text cursor-help">{project.title}</span>
                                    <span className="absolute -top-8 right-0 bg-[#37352f] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">Project</span>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-[#2eaadc]'}`} />
                                <span className="text-[9px] sm:text-[10px] font-bold text-notion-muted uppercase tracking-tighter max-w-[60px] sm:max-w-none truncate">
                                    {isSaving ? 'Saving...' : lastSaved === 'Draft (Unsaved)' ? 'Draft' : lastSaved ? `Saved ${format(new Date(lastSaved), 'h:mm')}` : 'New'}
                                </span>
                            </div>

                            <button onClick={handleSave} disabled={isSaving} className="p-1.5 rounded-lg hover:bg-notion-hover text-notion-muted transition-all">
                                <Save size={15} />
                            </button>

                            <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-notion-muted hover:text-red-500">
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto py-8 md:py-12 px-4 md:px-6 bg-notion-card">
                        <div className="max-w-3xl mx-auto">
                            <div className="mb-6 md:mb-10">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Untitled Note"
                                    className="w-full text-3xl md:text-5xl font-extrabold text-notion-text bg-transparent focus:outline-none placeholder-[#d3d1cb] tracking-tight leading-tight"
                                />

                                <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-6">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f1f1ef] text-notion-muted text-[10px] md:text-xs font-bold rounded-lg border border-notion-border/50 uppercase tracking-wider">
                                        <FileText size={12} /> Note
                                    </div>

                                    {note.tags?.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 md:px-2.5 md:py-1 bg-notion-bg text-notion-muted text-[10px] md:text-xs font-semibold rounded-lg border border-notion-border">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="min-h-[60vh] pb-32">
                                <BlockEditor
                                    blocks={activeBlocks}
                                    onChange={setActiveBlocks}
                                    isDiary={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}