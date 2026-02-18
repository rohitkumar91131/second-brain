'use client'

import { useApp } from '@/context/AppContext'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'
import BlockEditor from '@/components/editor/BlockEditor'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

const MOOD_EMOJI = { Amazing: '🌟', Good: '😊', Okay: '😐', Tough: '😔', Bad: '😢' }

export default function JournalEntryPage() {
    const { id } = useParams()
    const router = useRouter()
    const { journal, updateJournalEntry, deleteJournalEntry } = useApp()
    const saveTimeout = useRef(null)

    const entry = journal.find(j => j.id === id)

    const handleBlocksChange = useCallback((blocks) => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current)
        saveTimeout.current = setTimeout(() => {
            updateJournalEntry(id, { content: blocks })
        }, 500)
    }, [id, updateJournalEntry])

    const handleDelete = () => {
        deleteJournalEntry(id)
        router.push('/dashboard/journal')
    }

    if (!entry) {
        return (
            <div className="flex items-center justify-center h-full bg-[#fcfaf7]">
                <div className="text-center">
                    <p className="text-[#9b9a97] text-sm mb-3 font-medium">Entry not found</p>
                    <Link href="/dashboard/journal" className="text-sm text-[#2eaadc] hover:underline font-semibold transition-all">← Back to Journal</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-[#fcfaf7] overflow-hidden">
            {/* Header / Toolbar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e9e9e7] bg-white/50 backdrop-blur-sm z-10">
                <Link href="/dashboard/journal" className="p-1.5 rounded-lg hover:bg-[#efefef] text-[#9b9a97] hover:text-[#37352f] transition-all">
                    <ArrowLeft size={16} />
                </Link>
                <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#9b9a97] uppercase tracking-wider">Diary</span>
                    <span className="text-xs text-[#d3d1cb]">/</span>
                    <span className="text-sm font-bold text-[#37352f] truncate">{entry.title}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-[#9b9a97] uppercase tracking-tighter">Auto-saved</span>
                    </div>
                    <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-[#9b9a97] hover:text-red-500 transition-all">
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* Immersive Paper Content */}
            <div className="flex-1 overflow-auto paper-texture py-12 px-6">
                <div className="max-w-3xl mx-auto bg-white paper-shadow rounded-sm min-h-[80vh] relative page-fold border border-[#e9e9e7]/50">
                    {/* Decorative paper edge */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-[#f1f1ef] bg-[#fdfdfd] flex flex-col items-center py-8 gap-4 opacity-50">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="w-3 h-3 rounded-full border border-[#e9e9e7] bg-[#f7f7f5]" />
                        ))}
                    </div>

                    <div className="pl-16 pr-12 pt-16 pb-24">
                        <div className="flex items-start gap-5 mb-12 diary-serif">
                            <span className="text-6xl filter grayscale-[0.2] hover:grayscale-0 transition-all cursor-default">{MOOD_EMOJI[entry.mood] || '📝'}</span>
                            <div className="pt-2">
                                <h1 className="text-5xl font-extrabold text-[#37352f] tracking-tight leading-tight mb-2">
                                    {entry.title}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <p className="text-base font-medium text-[#9b9a97] italic">
                                        {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
                                    </p>
                                    <span className="w-1 h-1 rounded-full bg-[#d3d1cb]" />
                                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest">
                                        Feeling {entry.mood}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="paper-edge">
                            <BlockEditor
                                blocks={entry.content || [{ id: 'b1', type: 'paragraph', content: '' }]}
                                onChange={handleBlocksChange}
                                isDiary={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
