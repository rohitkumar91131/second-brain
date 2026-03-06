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
        <div className="flex flex-col h-full">

            <div className="flex items-center gap-3 px-6 py-3 border-b border-notion-border">
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 border border-notion-border rounded-md bg-notion-sidebar">
                    <Search size={13} className="text-notion-muted" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 text-sm bg-transparent focus:outline-none text-notion-text"
                    />
                </div>

                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#37352f] text-white text-xs font-medium rounded-md hover:bg-[#2f2d28]"
                >
                    <Plus size={13} />
                    New Note
                </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-notion-muted">
                        <FileText size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No notes yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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