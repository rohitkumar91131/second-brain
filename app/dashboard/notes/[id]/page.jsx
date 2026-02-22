'use client'

import { useApp } from '@/context/AppContext'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BlockEditor from '@/components/editor/BlockEditor'
import { ArrowLeft, Trash2, FileText, Save } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function NoteEditorPage() {
    const { id } = useParams()
    const router = useRouter()
    const { notes, updateNote, deleteNote, loading, projects, fetchEndpoint } = useApp()

    const note = notes.find(n => n.id === id)
    const project = projects?.find(p => p.id === note?.projectId)

    // Ensure projects are loaded when this note belongs to a project
    useEffect(() => {
        if (!note?.projectId) return
        const has = projects && projects.find(p => p.id === note.projectId)
        if (!has) fetchEndpoint('projects')
    }, [note?.projectId, projects, fetchEndpoint])

    const [title, setTitle] = useState('')
    const [blocks, setBlocks] = useState([])
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (!loading && note) {
            setTitle(note.title || '')
            setBlocks(note.content || [{ id: 'b1', type: 'paragraph', content: '' }])
            setLastSaved(note.updatedAt)
            setTimeout(() => setReady(true), 50)
        }
    }, [note, loading])

    const handleSave = async () => {
        if (!note) return
        setIsSaving(true)
        await updateNote(id, { title, content: blocks })
        setLastSaved(new Date())
        setIsSaving(false)
    }

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
    }, [title, blocks, note])

    const handleDelete = () => {
        deleteNote(id)
        router.push('/dashboard/notes')
    }

    return (
        <div className="flex flex-col h-full bg-white relative">

            {/* Skeleton */}
            {loading && (
                <div className="absolute inset-0 animate-pulse transition-opacity duration-300">
                    <div className="h-14 border-b border-[#e9e9e7] bg-[#f5f5f5]" />
                    <div className="flex-1 py-12 px-6 bg-[#fcfcfc]">
                        <div className="max-w-3xl mx-auto">
                            <div className="h-12 bg-[#e5e5e5] rounded w-2/3 mb-10" />
                            <div className="space-y-4">
                                <div className="h-4 bg-[#e5e5e5] rounded w-full" />
                                <div className="h-4 bg-[#e5e5e5] rounded w-5/6" />
                                <div className="h-4 bg-[#e5e5e5] rounded w-4/6" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Not Found */}
            {!loading && !note && (
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
                    className={`flex flex-col h-full transition-all duration-300 ease-out ${
                        ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
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
                                    blocks={blocks}
                                    onChange={setBlocks}
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
