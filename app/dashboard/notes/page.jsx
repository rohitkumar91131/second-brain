'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import Link from 'next/link'
import { Plus, FileText, Search, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import QuickAddModal from '@/components/ui/QuickAddModal'
import LoadingScreen from '@/components/ui/LoadingScreen'
import ContextNoteCard from '@/components/ui/ContextNoteCard'

export default function NotesPage() {
    const { notes, updateNote, archiveNote, recycleNote, loading, projects, fetchEndpoint } = useApp()
    const [search, setSearch] = useState('')
    const [showAdd, setShowAdd] = useState(false)

    useEffect(() => {
        fetchEndpoint('notes')
    }, [fetchEndpoint])

    if (loading) {
        return <LoadingScreen />
    }

    const filtered = notes.filter(n =>
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    )

    const handlePdfContent = async (note) => {
        const toastId = toast.loading(`Generating PDF for "${note.title}"...`)
        try {
            const response = await fetch(`/api/notes/${note.id}/pdf?theme=light`)
            if (!response.ok) throw new Error('PDF conversion failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${note.title || 'Note'}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            toast.success('PDF downloaded successfully!', { id: toastId })
        } catch (err) {
            console.error('PDF generation failed', err)
            toast.error('PDF generation failed. Please try again.', { id: toastId })
        }
    }

    const handleShare = async (note) => {
        const toastId = toast.loading(`Preparing share link for "${note.title}"...`)
        try {
            const res = await fetch(`/api/notes/${note.id}/share`, { method: 'POST' })
            if (!res.ok) throw new Error('Share request failed')

            const { id: sharedId } = await res.json()
            const url = `${window.location.origin}/share/${sharedId}`

            if (navigator.share) {
                await navigator.share({
                    title: note.title,
                    text: 'Check out this note on Second Brain Tracker.',
                    url: url,
                })
            } else {
                await navigator.clipboard.writeText(url)
                toast.success('Share link copied to clipboard!', { id: toastId })
            }
        } catch (err) {
            console.error('Share failed', err)
            toast.error('Failed to generate share link.', { id: toastId })
        }
    }

    const handleArchive = async (noteId) => {
        await archiveNote(noteId)
    }

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Search & Actions */}
            <div className="flex items-center gap-4 px-6 py-4 glass-dark border-white/5 rounded-3xl mb-8 m-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 border border-white/5 rounded-xl bg-white/5 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all group">
                    <Search size={16} className="text-slate-500 group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Search your notes, ideas, tags..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 text-sm bg-transparent focus:outline-none text-white placeholder:text-slate-500 font-medium"
                    />
                </div>

                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-6 py-2.5 premium-gradient text-white text-sm font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>New Note</span>
                </button>
            </div>

            <div className="flex-1 overflow-auto px-6">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 glass rounded-3xl border-dashed border-white/10 border-2">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 shadow-xl">
                            <FileText size={40} className="text-slate-600 opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No notes found</h3>
                        <p className="text-slate-500 max-w-xs text-center">Capture your thoughts, ideas, and knowledge. Start by creating a new note.</p>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/5 active:scale-95"
                        >
                            Create First Note
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(note => (
                            <ContextNoteCard
                                key={note.id}
                                note={note}
                                project={projects?.find(p => note.projectIds?.includes(p.id))}
                                onUpdate={(id, updates) => updateNote(id, updates)}
                                onDelete={async (id) => {
                                    await recycleNote(id)
                                }}
                                onArchive={handleArchive}
                                onPdf={handlePdfContent}
                                onShare={handleShare}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showAdd && (
                <QuickAddModal
                    defaultType="note"
                    onClose={() => setShowAdd(false)}
                />
            )}
        </div>
    )
}