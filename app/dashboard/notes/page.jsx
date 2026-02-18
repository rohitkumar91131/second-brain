'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import Link from 'next/link'
import { Plus, FileText, Search, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import QuickAddModal from '@/components/ui/QuickAddModal'

export default function NotesPage() {
    const router = useRouter()
    const { notes, addNote, deleteNote } = useApp()
    const [search, setSearch] = useState('')
    const [showAdd, setShowAdd] = useState(false)

    const filtered = notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e9e9e7]">
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 border border-[#e9e9e7] rounded-md bg-[#f7f7f5]">
                    <Search size={13} className="text-[#9b9a97]" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 text-sm bg-transparent focus:outline-none text-[#37352f] placeholder-[#9b9a97]"
                    />
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#37352f] text-white text-xs font-medium rounded-md hover:bg-[#2f2d28] transition-colors"
                >
                    <Plus size={13} />
                    New Note
                </button>
            </div>

            {/* Notes grid */}
            <div className="flex-1 overflow-auto p-6">
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-[#9b9a97]">
                        <FileText size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No notes yet. Create your first note!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filtered.map(note => (
                            <NoteCard key={note.id} note={note} onDelete={deleteNote} />
                        ))}
                    </div>
                )}
            </div>

            {showAdd && <QuickAddModal defaultType="note" onClose={() => setShowAdd(false)} />}
        </div>
    )
}

function NoteCard({ note, onDelete }) {
    const preview = note.content?.find(b => b.type === 'paragraph' && b.content)?.content || ''

    return (
        <div className="group relative border border-[#e9e9e7] rounded-xl p-4 bg-white hover:shadow-md transition-all cursor-pointer">
            <Link href={`/dashboard/notes/${note.id}`} className="block">
                <h3 className="text-sm font-semibold text-[#37352f] mb-1 truncate">{note.title}</h3>
                {preview && <p className="text-xs text-[#9b9a97] line-clamp-2 mb-2">{preview}</p>}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-wrap gap-1">
                        {note.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-[#f1f1ef] text-[#787774] text-[10px] rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <span className="text-[10px] text-[#9b9a97]">
                        {format(new Date(note.updatedAt), 'MMM d')}
                    </span>
                </div>
            </Link>
            <button
                onClick={(e) => { e.preventDefault(); onDelete(note.id) }}
                className="absolute top-2 right-2 hover-reveal p-1 rounded hover:bg-red-50 text-red-400 transition-colors"
            >
                <Trash2 size={12} />
            </button>
        </div>
    )
}
