'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import Link from 'next/link'
import { Plus, BookMarked, Trash2, Smile } from 'lucide-react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'

const MOODS = ['Amazing', 'Good', 'Okay', 'Tough', 'Bad']
const MOOD_EMOJI = { Amazing: '🌟', Good: '😊', Okay: '😐', Tough: '😔', Bad: '😢' }

export default function JournalPage() {
    const router = useRouter()
    const { journal, addJournalEntry, deleteJournalEntry } = useApp()
    const [selectedMood, setSelectedMood] = useState('Good')

    const sorted = [...journal].sort((a, b) => new Date(b.date) - new Date(a.date))

    const handleNewEntry = () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const existing = journal.find(j => j.date === today)
        if (existing) {
            router.push(`/dashboard/journal/${existing.id}`)
            return
        }

        addJournalEntry({
            title: `Journal - ${format(new Date(), 'MMMM d, yyyy')}`,
            date: today,
            mood: selectedMood,
            content: [
                { id: 'b1', type: 'heading2', content: 'Morning Reflection' },
                { id: 'b2', type: 'paragraph', content: '' },
                { id: 'b3', type: 'heading2', content: 'Gratitude' },
                { id: 'b4', type: 'bullet', content: '' },
                { id: 'b5', type: 'heading2', content: 'Intentions' },
                { id: 'b6', type: 'bullet', content: '' },
            ],
        }).then(newEntry => {
            if (newEntry?.id) router.push(`/dashboard/journal/${newEntry.id}`)
        })
    }

    const getDateLabel = (dateStr) => {
        const d = parseISO(dateStr)
        if (isToday(d)) return 'Today'
        if (isYesterday(d)) return 'Yesterday'
        return format(d, 'EEEE, MMMM d, yyyy')
    }

    return (
        <div className="flex flex-col h-full bg-[#fcfaf7]">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-6 py-4 bg-white/50 backdrop-blur-md border-b border-[#e9e9e7] z-10">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-[#37352f] tracking-tight diary-serif">Personal Diary</h1>
                    <p className="text-[10px] font-bold text-[#9b9a97] uppercase tracking-widest mt-0.5">Chronological Archive</p>
                </div>

                <div className="mx-auto flex items-center gap-2 bg-[#f1f1ef]/50 p-1.5 rounded-full border border-[#e9e9e7]/50">
                    {MOODS.map(mood => (
                        <button
                            key={mood}
                            onClick={() => setSelectedMood(mood)}
                            title={`Add entry as ${mood}`}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${selectedMood === mood ? 'bg-white shadow-md scale-110' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                        >
                            <span className="text-lg">{MOOD_EMOJI[mood]}</span>
                        </button>
                    ))}
                </div>

                <div className="ml-auto">
                    <button
                        onClick={handleNewEntry}
                        className="group flex items-center gap-2 px-4 py-2 bg-[#37352f] text-white text-xs font-bold rounded-full hover:bg-[#2f2d28] transition-all hover:shadow-lg active:scale-95"
                    >
                        <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                        Write Today
                    </button>
                </div>
            </div>

            {/* Entries List */}
            <div className="flex-1 overflow-auto p-8 paper-texture">
                <div className="max-w-xl mx-auto space-y-6">
                    {sorted.length === 0 ? (
                        <div className="text-center py-32 bg-white/80 paper-shadow rounded-2xl border border-[#e9e9e7]/50">
                            <BookMarked size={48} className="mx-auto mb-4 text-[#d3d1cb]" />
                            <p className="text-sm font-medium text-[#9b9a97] diary-serif italic">Your diary is empty. Start your first entry today.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sorted.map((entry, idx) => (
                                <div
                                    key={entry.id}
                                    className="group relative animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <Link href={`/dashboard/journal/${entry.id}`}
                                        className="block bg-white p-6 rounded-sm paper-shadow border border-[#e9e9e7]/30 hover:border-[#2eaadc]/30 transition-all hover:-translate-y-1 hover:shadow-xl group"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 flex items-center justify-center bg-[#fcfaf7] rounded-full diary-serif text-2xl border border-[#f1f1ef] group-hover:scale-110 transition-transform">
                                                    {MOOD_EMOJI[entry.mood] || '📝'}
                                                </div>
                                                <div>
                                                    <p className="text-base font-bold text-[#37352f] diary-serif">{getDateLabel(entry.date)}</p>
                                                    <p className="text-xs font-bold text-[#9b9a97] uppercase tracking-widest">{entry.mood}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.preventDefault(); deleteJournalEntry(entry.id) }}
                                                className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-50 text-red-300 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>

                                        {/* Content Preview */}
                                        <div className="pl-16 relative">
                                            <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-[#f1f1ef]" />
                                            {entry.content && (
                                                <p className="text-sm text-[#787774] line-clamp-2 diary-serif leading-relaxed italic">
                                                    {entry.content.find(b => b.type === 'paragraph' && b.content)?.content || 'Dear Diary... content awaited.'}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-4 flex justify-end">
                                            <span className="text-[10px] font-bold text-[#d3d1cb] uppercase tracking-widest group-hover:text-[#2eaadc] transition-colors">Read Entry →</span>
                                        </div>
                                    </Link>

                                    {/* Stack effect */}
                                    <div className="absolute -bottom-1 -right-1 left-1 h-2 bg-[#f1f1ef] border border-[#e9e9e7] -z-10 rounded-sm" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
