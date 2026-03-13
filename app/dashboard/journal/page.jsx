'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import Link from 'next/link'
import { Plus, BookMarked, Trash2, Smile } from 'lucide-react'
import Loader from '@/components/ui/Loader'
import { format, isToday, isYesterday, parseISO } from 'date-fns'

const MOODS = ['Amazing', 'Good', 'Okay', 'Tough', 'Bad']
const MOOD_EMOJI = { Amazing: '🌟', Good: '😊', Okay: '😐', Tough: '😔', Bad: '😢' }

export default function JournalPage() {
    const { journal, addJournalEntry, loading, bulkUpdateBlocks } = useApp()
    const router = useRouter()
    const [selectedMood, setSelectedMood] = useState('Good')

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full relative overflow-hidden bg-notion-bg/50 backdrop-blur-sm z-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    const sorted = [...journal].sort((a, b) => new Date(b.date) - new Date(a.date))

    const handleNewEntry = async () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const existing = journal.find(j => j.date === today)
        if (existing) {
            router.push(`/dashboard/journal/${existing.id}`)
            return
        }

        try {
            const newEntry = await addJournalEntry({
                title: `Journal - ${format(new Date(), 'MMMM d, yyyy')}`,
                date: today,
                mood: selectedMood,
            })

            if (newEntry?.id) {
                const initialBlocks = [
                    { type: 'heading2', content: 'Morning Reflection', order: 100 },
                    { type: 'paragraph', content: '', order: 200 },
                    { type: 'heading2', content: 'Gratitude', order: 300 },
                    { type: 'bullet', content: '', order: 400 },
                    { type: 'heading2', content: 'Intentions', order: 500 },
                    { type: 'bullet', content: '', order: 600 },
                ]

                await bulkUpdateBlocks(newEntry.id, 'JournalEntry', initialBlocks)
                router.push(`/dashboard/journal/${newEntry.id}`)
            }
        } catch (err) {
            console.error('Failed to create entry:', err)
        }
    }

    const getDateLabel = (dateStr) => {
        const d = parseISO(dateStr)
        if (isToday(d)) return 'Today'
        if (isYesterday(d)) return 'Yesterday'
        return format(d, 'EEEE, MMMM d, yyyy')
    }

    return (
        <div className="flex flex-col h-full bg-[#fcfaf7] dark:bg-[#121212] transition-colors duration-300">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-6 py-4 bg-white/50 dark:bg-[#18181A]/50 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#27272A] z-10 transition-colors duration-300">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-[#111827] dark:text-[#F3F4F6] tracking-tight diary-serif">Personal Diary</h1>
                    <p className="text-[10px] font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-widest mt-0.5">Chronological Archive</p>
                </div>

                <div className="mx-auto flex items-center gap-2 bg-[#F3F4F6]/50 dark:bg-[#27272A]/50 p-1.5 rounded-full border border-[#E5E7EB]/50 dark:border-[#3F3F46]/50 transition-colors duration-300">
                    {MOODS.map(mood => (
                        <button
                            key={mood}
                            onClick={() => setSelectedMood(mood)}
                            title={`Add entry as ${mood}`}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${selectedMood === mood ? 'bg-white dark:bg-[#3F3F46] shadow-sm scale-110' : 'opacity-50 hover:opacity-100 hover:scale-105 filter grayscale hover:grayscale-0'}`}
                        >
                            <span className="text-lg">{MOOD_EMOJI[mood]}</span>
                        </button>
                    ))}
                </div>

                <div className="ml-auto">
                    <button
                        onClick={handleNewEntry}
                        className="group flex items-center gap-2 px-4 py-2 bg-[#111827] dark:bg-[#F3F4F6] text-white dark:text-[#111827] text-xs font-bold rounded-full hover:bg-[#374151] dark:hover:bg-[#FFFFFF] transition-all hover:shadow-lg active:scale-95"
                    >
                        <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                        Write Today
                    </button>
                </div>
            </div>

            {/* Entries List */}
            <div className="flex-1 overflow-auto p-8 paper-texture dark:bg-none dark:bg-[#121212] transition-colors duration-300">
                <div className="max-w-xl mx-auto space-y-6">
                    {sorted.length === 0 ? (
                        <div className="text-center py-32 bg-white/80 dark:bg-[#18181A]/80 paper-shadow dark:shadow-none rounded-2xl border border-[#E5E7EB]/50 dark:border-[#27272A]/50 transition-colors duration-300">
                            <BookMarked size={48} className="mx-auto mb-4 text-[#D1D5DB] dark:text-[#3F3F46]" />
                            <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] diary-serif italic">Your diary is empty. Start your first entry today.</p>
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
                                        className="block bg-white dark:bg-[#18181A] p-6 rounded-sm paper-shadow dark:shadow-none border border-[#E5E7EB]/50 dark:border-[#27272A] hover:border-[#6366F1]/50 dark:hover:border-[#818CF8]/50 transition-all hover:-translate-y-1 hover:shadow-lg group"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 flex items-center justify-center bg-[#F9FAFB] dark:bg-[#27272A] rounded-full diary-serif text-2xl border border-[#F3F4F6] dark:border-[#3F3F46] group-hover:scale-110 transition-transform duration-300">
                                                    {MOOD_EMOJI[entry.mood] || '📝'}
                                                </div>
                                                <div>
                                                    <p className="text-base font-bold text-[#111827] dark:text-[#F3F4F6] diary-serif">{getDateLabel(entry.date)}</p>
                                                    <p className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-widest">{entry.mood}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.preventDefault(); deleteJournalEntry(entry.id) }}
                                                className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>

                                        {/* Content Preview */}
                                        <div className="pl-16 relative">
                                            <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-[#F3F4F6] dark:bg-[#27272A]" />
                                            <p className="text-sm text-[#4B5563] dark:text-[#A1A1AA] line-clamp-2 diary-serif leading-relaxed italic">
                                                {entry.preview || 'Dear Diary... content awaited.'}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex justify-end">
                                            <span className="text-[10px] font-bold text-[#D1D5DB] dark:text-[#52525B] uppercase tracking-widest group-hover:text-[#6366F1] dark:group-hover:text-[#818CF8] transition-colors">Read Entry →</span>
                                        </div>
                                    </Link>

                                    {/* Stack effect */}
                                    <div className="absolute -bottom-1 -right-1 left-1 h-2 bg-[#F3F4F6] dark:bg-[#18181A] border border-[#E5E7EB] dark:border-[#27272A] -z-10 rounded-sm transition-colors duration-300" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
