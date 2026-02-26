'use client'

import { useApp } from '@/context/AppContext'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BlockEditor from '@/components/editor/BlockEditor'
import { ArrowLeft, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

const MOOD_EMOJI = {
    Amazing: '🌟',
    Good: '😊',
    Okay: '😐',
    Tough: '😔',
    Bad: '😢'
}

export default function JournalEntryPage() {
    const { id } = useParams()
    const router = useRouter()
    const {
        journal,
        updateJournalEntry,
        deleteJournalEntry,
        loading,
        activeBlocks,
        fetchBlocks,
        bulkUpdateBlocks,
        setActiveBlocks,
        fetchEntity
    } = useApp()

    const entry = journal.find(j => j.id === id)

    useEffect(() => {
        if (id && !entry) {
            fetchEntity('JournalEntry', id).catch(e => console.error('Fetch entry failed', e))
        }
    }, [id, entry, fetchEntity])

    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)
    const [visible, setVisible] = useState(false)

    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        if (id) fetchBlocks(id, 'JournalEntry')
    }, [id, fetchBlocks])

    useEffect(() => {
        if (!loading && entry && !initialized) {
            setLastSaved(entry.updatedAt)
            setInitialized(true)
            requestAnimationFrame(() => setVisible(true))
        }
    }, [entry, loading, initialized])

    // Ensure at least one block if loading is done and none exist
    useEffect(() => {
        if (initialized && activeBlocks?.length === 0 && !loading) {
            setActiveBlocks([{ id: `b-init-${Date.now()}`, type: 'paragraph', content: '' }])
        }
    }, [initialized, activeBlocks?.length, loading, setActiveBlocks])

    const handleSave = useCallback(async () => {
        if (!entry) return
        setIsSaving(true)
        try {
            await Promise.all([
                updateJournalEntry(id, {}),
                bulkUpdateBlocks(id, 'JournalEntry', activeBlocks)
            ])
            setLastSaved(new Date())
        } catch (err) {
            console.error('Save failed', err)
        } finally {
            setIsSaving(false)
        }
    }, [entry, id, activeBlocks, updateJournalEntry, bulkUpdateBlocks])

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
    }, [handleSave])

    const handleDelete = async () => {
        await deleteJournalEntry(id)
        router.push('/dashboard/journal')
    }

    return (
        <div className="flex flex-col h-full bg-[#fcfaf7] overflow-hidden relative">

            {/* PREMIUM SKELETON */}
            <div
                className={`absolute inset-0 transition-opacity duration-300 ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            >
                <div className="flex flex-col h-full bg-[#fcfaf7] animate-pulse">

                    <div className="h-14 border-b border-[#e9e9e7] bg-white" />

                    <div className="flex-1 overflow-hidden py-12 px-6">
                        <div className="max-w-3xl mx-auto bg-white rounded-sm min-h-[80vh] border border-[#e9e9e7]/50 relative">

                            <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-[#f1f1ef] bg-[#fdfdfd]" />

                            <div className="pl-16 pr-12 pt-16 pb-24 space-y-8">

                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 rounded-full bg-gray-200" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-10 bg-gray-200 rounded w-2/3" />
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* NOT FOUND */}
            {!loading && !entry && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <p className="text-[#9b9a97] text-sm mb-3 font-medium">
                            Entry not found
                        </p>
                        <Link
                            href="/dashboard/journal"
                            className="text-sm text-[#2eaadc] hover:underline font-semibold"
                        >
                            ← Back to Journal
                        </Link>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            {!loading && entry && (
                <div
                    className={`flex flex-col h-full transition-all duration-300 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                >

                    {/* HEADER */}
                    <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e9e9e7] bg-white/60 backdrop-blur-md z-10">
                        <Link
                            href="/dashboard/journal"
                            className="p-1.5 rounded-lg hover:bg-[#efefef] text-[#9b9a97] hover:text-[#37352f] transition"
                        >
                            <ArrowLeft size={16} />
                        </Link>

                        <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#9b9a97] uppercase tracking-wider">
                                Diary
                            </span>
                            <span className="text-xs text-[#d3d1cb]">/</span>
                            <span className="text-sm font-bold text-[#37352f] truncate">
                                {entry.title}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div
                                    className={`w-1.5 h-1.5 rounded-full ${isSaving
                                        ? 'bg-yellow-500 animate-pulse'
                                        : 'bg-green-400'
                                        }`}
                                />
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
                                className="p-1.5 rounded-lg hover:bg-[#efefef] text-[#9b9a97] hover:text-[#37352f] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={15} />
                            </button>

                            <button
                                onClick={handleDelete}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-[#9b9a97] hover:text-red-500 transition"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>

                    {/* PAPER CONTENT */}
                    <div className="flex-1 overflow-auto paper-texture py-12 px-6">
                        <div className="max-w-3xl mx-auto bg-white paper-shadow rounded-sm min-h-[80vh] relative page-fold border border-[#e9e9e7]/50">

                            <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-[#f1f1ef] bg-[#fdfdfd] opacity-50" />

                            <div className="pl-16 pr-12 pt-16 pb-24">

                                <div className="flex items-start gap-5 mb-12 diary-serif">
                                    <span className="text-6xl">
                                        {MOOD_EMOJI[entry.mood] || '📝'}
                                    </span>

                                    <div className="pt-2">
                                        <h1 className="text-5xl font-extrabold text-[#37352f] tracking-tight leading-tight mb-2">
                                            {entry.title}
                                        </h1>

                                        <div className="flex items-center gap-3">
                                            <p className="text-base font-medium text-[#9b9a97] italic">
                                                {format(
                                                    parseISO(entry.date),
                                                    'EEEE, MMMM d, yyyy'
                                                )}
                                            </p>

                                            <span className="w-1 h-1 rounded-full bg-[#d3d1cb]" />

                                            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest">
                                                Feeling {entry.mood}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <BlockEditor
                                    blocks={activeBlocks}
                                    onChange={setActiveBlocks}
                                    isDiary={true}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
