'use client'
import { useState, useEffect } from 'react'
import { GripVertical, StickyNote, X, Check, Search } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import Link from 'next/link'

export default function NoteReferenceBlock({ block, onUpdate, onDelete, onDragHandleDown, onDragHandleUp }) {
    const { notes } = useApp()
    const [isMenuOpen, setIsMenuOpen] = useState(!block.content) // Open if no notes selected yet
    const [searchQuery, setSearchQuery] = useState('')

    // block.content stores comma-separated note IDs
    const selectedIds = block.content ? block.content.split(',') : []
    const selectedNotes = selectedIds.map(id => notes.find(n => n.id === id)).filter(Boolean)

    const filteredNotes = notes.filter(n =>
        n.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const toggleSelection = (noteId) => {
        const newSelection = selectedIds.includes(noteId)
            ? selectedIds.filter(id => id !== noteId)
            : [...selectedIds, noteId]

        onUpdate({ content: newSelection.join(',') })
    }

    return (
        <div className="group flex items-start gap-2 my-2 relative w-full">
            <div
                className="absolute -left-6 top-1 opacity-0 group-hover:opacity-100 cursor-grab text-notion-muted hover:bg-notion-border rounded w-5 h-6 flex items-center justify-center transition-all z-10"
                onMouseDown={onDragHandleDown}
                onMouseUp={onDragHandleUp}
                onMouseLeave={onDragHandleUp}
                onTouchStart={onDragHandleDown}
                onTouchEnd={onDragHandleUp}
            >
                <GripVertical size={14} />
            </div>

            <div className="flex-1 w-full bg-notion-bg/50 border border-notion-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-notion-muted uppercase flex items-center gap-1.5">
                        <StickyNote size={14} /> Note References
                    </span>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[10px] text-notion-accent font-semibold hover:underline px-2 py-0.5 rounded border border-notion-accent/20 bg-notion-accent/5">
                        {isMenuOpen ? 'Done' : 'Select Notes'}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="bg-notion-bg border text-sm border-notion-border rounded-lg shadow-sm mb-3">
                        <div className="flex items-center px-3 py-2 border-b border-notion-border bg-notion-sidebar/50 rounded-t-lg">
                            <Search size={14} className="text-notion-muted mr-2" />
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search all notes..."
                                className="bg-transparent flex-1 outline-none text-xs"
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {filteredNotes.length === 0 ? (
                                <p className="p-3 text-xs text-notion-muted text-center">No notes found.</p>
                            ) : (
                                filteredNotes.map(n => {
                                    const isSelected = selectedIds.includes(n.id)
                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => toggleSelection(n.id)}
                                            className="flex items-center justify-between px-3 py-2 hover:bg-notion-hover cursor-pointer border-b border-notion-border last:border-0"
                                        >
                                            <span className="truncate text-xs text-notion-text pr-2">{n.title || 'Untitled'}</span>
                                            {isSelected && <Check size={14} className="text-blue-500 flex-shrink-0" />}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}

                {selectedNotes.length === 0 && !isMenuOpen ? (
                    <p className="text-xs text-notion-muted italic">No notes referenced.</p>
                ) : (
                    <div className="flex flex-col gap-1.5 mt-2">
                        {selectedNotes.map(note => (
                            <Link href={`/dashboard/notes/${note.id}`} target="_blank" key={note.id} className="flex items-center gap-2 p-2 bg-notion-bg hover:bg-notion-sidebar border border-notion-border rounded-md group/link transition-colors shadow-sm">
                                <StickyNote size={13} className="text-notion-muted" />
                                <span className="text-xs font-semibold text-notion-text group-hover/link:text-blue-600 transition-colors underline-offset-2 w-full truncate">{note.title || 'Untitled'}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <button onClick={onDelete} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-notion-muted hover:text-red-500 rounded transition-all flex-shrink-0">
                <X size={14} />
            </button>
        </div>
    )
}
