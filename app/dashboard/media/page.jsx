'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { Image as ImageIcon, Video, Music, Plus, Search, ExternalLink } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'
import { format } from 'date-fns'

export default function MediaBankPage() {
    const { media, fetchMedia, addNote, loading } = useApp()
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchMedia()
    }, [fetchMedia])

    const filteredMedia = (media || []).filter(item =>
        item.noteTitle?.toLowerCase().includes(search.toLowerCase()) ||
        item.type?.toLowerCase().includes(search.toLowerCase())
    )

    if (loading && (!media || media.length === 0)) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Toolbar */}
            <div className="flex items-center gap-4 px-6 py-4 glass-dark border-white/5 rounded-3xl mb-8 sticky top-0 z-30 m-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 border border-white/5 rounded-xl bg-white/5 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all group">
                    <Search size={16} className="text-slate-500 group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Search your media bank, images, videos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 text-sm bg-transparent focus:outline-none text-white placeholder:text-slate-500 font-medium"
                    />
                </div>

                <CldUploadWidget
                    uploadPreset="notes second brain"
                    onSuccess={(result) => {
                        if (result.info?.secure_url) {
                            addNote({
                                title: `Media - ${new Date().toLocaleDateString()}`,
                                blocks: [
                                    { id: `b-${Date.now()}`, type: 'image', content: result.info.secure_url, order: 0 },
                                    { id: `b-${Date.now() + 1}`, type: 'paragraph', content: 'Uploaded to Media Bank', order: 1 }
                                ]
                            })
                        }
                    }}
                >
                    {({ open }) => (
                        <button
                            onClick={() => open()}
                            className="flex items-center gap-2 px-6 py-2.5 premium-gradient text-white text-sm font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Plus size={18} strokeWidth={3} />
                            Upload Media
                        </button>
                    )}
                </CldUploadWidget>
            </div>

            <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {filteredMedia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-48 glass rounded-3xl border-dashed border-white/10 border-2">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 shadow-xl">
                                <ImageIcon size={40} className="text-slate-600 opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Media Bank Empty</h3>
                            <p className="text-slate-500 max-w-xs text-center">Organize all your visuals and assets in one place.</p>
                        </div>
                    ) : (
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                            {filteredMedia.map((item, idx) => (
                                <div
                                    key={`${item.id}-${idx}`}
                                    className="group glass-dark rounded-3xl border border-white/5 overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col break-inside-avoid"
                                >
                                    <div className={`relative flex items-center justify-center bg-white/5 ${item.type === 'video' ? 'aspect-video' : 'aspect-auto'}`}>
                                        {item.type === 'image' && (
                                            <img
                                                src={item.content}
                                                alt={item.noteTitle || 'Media asset'}
                                                className="w-full h-auto object-contain"
                                            />
                                        )}

                                        {item.type === 'video' && (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-12">
                                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shadow-2xl">
                                                    <Video size={32} className="text-indigo-400 ml-1" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    Video Preview
                                                </span>
                                            </div>
                                        )}

                                        {item.type === 'audio' && (
                                            <div className="w-full h-32 flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                                    <Music size={32} className="text-green-400" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    Audio Track
                                                </span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                                            <Link
                                                href={`/dashboard/notes/${item.entityId}`}
                                                className="p-3 bg-white text-indigo-600 rounded-2xl hover:scale-110 transition-transform shadow-xl"
                                                title="View in Note"
                                            >
                                                <ExternalLink size={20} />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-sm font-bold text-white truncate mb-2">
                                            {item.noteTitle}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">
                                                {item.type === 'image' && <ImageIcon size={12} className="text-blue-400" />}
                                                {item.type === 'video' && <Video size={12} className="text-indigo-400" />}
                                                {item.type === 'audio' && <Music size={12} className="text-green-400" />}
                                                {item.type}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-600">
                                                {format(new Date(item.updatedAt), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}