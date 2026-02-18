'use client'

import { useApp } from '@/context/AppContext'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import BlockEditor from '@/components/editor/BlockEditor'
import { ArrowLeft, Trash2, FileText } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function NoteEditorPage() {
    const { id } = useParams()
    const router = useRouter()
    const { notes, updateNote, deleteNote } = useApp()
    const saveTimeout = useRef(null)

    const note = notes.find(n => n.id === id)

    const handleBlocksChange = useCallback((blocks) => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current)
        saveTimeout.current = setTimeout(() => {
            updateNote(id, { content: blocks })
        }, 500)
    }, [id, updateNote])

    const handleTitleChange = useCallback((e) => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current)
        saveTimeout.current = setTimeout(() => {
            updateNote(id, { title: e.target.value })
        }, 500)
    }, [id, updateNote])

    const handleDelete = () => {
        deleteNote(id)
        router.push('/dashboard/notes')
    }

    if (!note) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-[#9b9a97] text-sm mb-3 font-medium">Note not found</p>
                    <Link href="/dashboard/notes" className="text-sm text-[#2eaadc] hover:underline font-semibold">← Back to Notes</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Toolbar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e9e9e7] bg-white/80 backdrop-blur-md z-10">
                <Link href="/dashboard/notes" className="p-1.5 rounded-lg hover:bg-[#efefef] text-[#9b9a97] hover:text-[#37352f] transition-all">
                    <ArrowLeft size={16} />
                </Link>
                <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#9b9a97] uppercase tracking-wider">Notes</span>
                    <span className="text-xs text-[#d3d1cb]">/</span>
                    <input
                        defaultValue={note.title}
                        onChange={handleTitleChange}
                        className="text-sm font-bold text-[#37352f] bg-transparent focus:outline-none flex-1 truncate"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2eaadc] animate-pulse" />
                        <span className="text-[10px] font-bold text-[#9b9a97] uppercase tracking-tighter">
                            Saved {format(new Date(note.updatedAt), 'h:mm a')}
                        </span>
                    </div>
                    <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-[#9b9a97] hover:text-red-500 transition-all">
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-auto py-12 px-6 bg-[#fcfcfc]">
                <div className="max-w-3xl mx-auto animate-fade-in-up">
                    {/* Note Meta */}
                    <div className="mb-10">
                        <input
                            defaultValue={note.title}
                            onChange={handleTitleChange}
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

                    {/* Writing Area */}
                    <div className="min-h-[60vh] pb-32">
                        <BlockEditor
                            blocks={note.content || [{ id: 'b1', type: 'paragraph', content: '' }]}
                            onChange={handleBlocksChange}
                            isDiary={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
