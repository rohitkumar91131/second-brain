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

    const handlePdfContent = (note) => {
        const preview = note.preview || ''
        const html = `<html><head><title>${note.title}</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6}h1{font-size:32px;margin-bottom:20px}p{font-size:16px;margin:10px 0;color:#333}</style></head><body><h1>${note.title}</h1><p>${preview}</p><p style="margin-top:50px;font-size:12px;color:grey;">Exported from Second Brain</p><script>window.onload=function(){window.print()}</script></body></html>`
        const win = window.open('', '_blank')
        win.document.write(html)
        win.document.close()
    }

    const handleShare = (note) => {
        if (navigator.share) {
            navigator.share({
                title: note.title,
                text: 'Check out this note on Second Brain Tracker.',
                url: window.location.href + '/' + note.id,
            }).catch(() => { })
        } else {
            navigator.clipboard.writeText(window.location.href + '/' + note.id)
            toast.success('Share copied to clipboard!')
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
                                project={projects?.find(p => p.id === note.projectId)}
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