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

    // Ensure projects are loaded when this note belongs to a project
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
                    } else if (activeBlocks.length === 0) {
                        // Keep current or wait for fetch
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
    }, [note, loading, id, initialized, activeBlocks?.length, setActiveBlocks])

    // Ensure at least one block if loading is done and none exist
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

    // Save on Ctrl/Cmd+S
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
        <div className="flex flex-col h-full bg-white relative">

            {/* Skeleton */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
                    <Loader />
                </div>
            )}

            {/* Not Found */}
            {!loading && !note && notFoundDelay && (
                <div className="flex items-center justify-center h-full transition-opacity duration-300 opacity-100">
                    <div className="text-center">
                        <p className="text-[#9b9a97] text-sm mb-3 font-medium">
                            Note not found
                        </p>
                        <Link href="/dashboard/notes" className="text-sm text-[#2eaadc] hover:underline font-semibold">
                            ← Back to Notes
                        </Link>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {!loading && note && (
                <div
                    className={`flex flex-col h-full transition-all duration-300 ease-out ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                >
                    <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e9e9e7] bg-white/80 backdrop-blur-md z-10">
                        <Link href="/dashboard/notes" className="p-1.5 rounded-lg hover:bg-[#efefef] text-[#9b9a97] hover:text-[#37352f] transition-all">
                            <ArrowLeft size={16} />
                        </Link>

                        <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#9b9a97] uppercase tracking-wider">Notes</span>
                            <span className="text-xs text-[#d3d1cb]">/</span>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-sm font-bold text-[#37352f] bg-transparent focus:outline-none flex-1 truncate"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            {project && (
                                <div className="group relative">
                                    <span className="text-sm font-bold text-[#37352f] cursor-help">
                                        {project.title}
                                    </span>
                                    <span className="absolute -top-8 right-0 bg-[#37352f] text-white text-[10px] font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        Project
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-[#2eaadc]'}`} />
                                <span className="text-[10px] font-bold text-[#9b9a97] uppercase tracking-tighter">
                                    {isSaving
                                        ? 'Saving...'
                                        : lastSaved === 'Draft (Unsaved)'
                                            ? 'Unsaved Draft'
                                            : lastSaved
                                                ? `Saved ${format(new Date(lastSaved), 'h:mm a')}`
                                                : 'Not saved'}
                                </span>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="p-1.5 rounded-lg hover:bg-[#efefef] text-[#9b9a97] hover:text-[#37352f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={15} />
                            </button>

                            <button
                                onClick={handleDelete}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-[#9b9a97] hover:text-red-500 transition-all"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto py-12 px-6 bg-[#fcfcfc]">
                        <div className="max-w-3xl mx-auto">
                            <div className="mb-10">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Untitled Note"
                                    className="w-full text-5xl font-extrabold text-[#37352f] bg-transparent focus:outline-none placeholder-[#d3d1cb] tracking-tight leading-tight"
                                />

                                <div className="flex flex-wrap items-center gap-2 mt-6">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f1f1ef] text-[#787774] text-xs font-bold rounded-lg border border-[#e9e9e7]/50 uppercase tracking-wider">
                                        <FileText size={12} />
                                        Note
                                    </div>

                                    {note.tags?.map(tag => (
                                        <span key={tag} className="px-2.5 py-1 bg-white text-[#9b9a97] text-xs font-semibold rounded-lg border border-[#e9e9e7] hover:border-[#2eaadc] transition-colors cursor-default">
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
