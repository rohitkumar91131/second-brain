'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { Image as ImageIcon, Video, Music, Plus, Search, ExternalLink } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'

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
        <div className="flex flex-col h-full bg-[#fcfaf7]">
            {/* Header / Search */}
            <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-[#e9e9e7] sticky top-0 z-10">
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 border border-[#e9e9e7] rounded-md bg-[#f7f7f5]">
                    <Search size={14} className="text-[#9b9a97]" />
                    <input
                        type="text"
                        placeholder="Search media..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 text-sm bg-transparent focus:outline-none text-[#37352f]"
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
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#37352f] text-white text-xs font-bold rounded-md hover:bg-[#2f2d28] transition-all shadow-sm active:scale-95"
                        >
                            <Plus size={14} />
                            Upload Media
                        </button>
                    )}
                </CldUploadWidget>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-6xl mx-auto">
                    {filteredMedia.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-2xl border border-dashed border-[#e9e9e7]">
                            <ImageIcon size={48} className="mx-auto mb-4 text-[#d3d1cb]" />
                            <p className="text-sm font-medium text-[#9b9a97]">No media found. Upload your first item!</p>
                        </div>
                    ) : (
                        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                            {filteredMedia.map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="group bg-white rounded-xl border border-[#e9e9e7] overflow-hidden hover:shadow-lg transition-all flex flex-col break-inside-avoid">
                                    <div className={`relative flex items-center justify-center bg-[#f7f7f5] ${item.type === 'video' ? 'aspect-video' : 'aspect-auto'}`}>
                                        {item.type === 'image' && (
                                            <img src={item.content} alt={item.noteTitle} className="w-full h-auto object-contain" />
                                        )}
                                        {item.type === 'video' && (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                <Video size={40} className="text-[#9b9a97]" />
                                                <span className="text-[10px] font-bold text-[#9b9a97] uppercase">Video Embed</span>
                                            </div>
                                        )}
                                        {item.type === 'audio' && (
                                            <div className="w-full h-24 flex flex-col items-center justify-center gap-2">
                                                <Music size={40} className="text-[#9b9a97]" />
                                                <span className="text-[10px] font-bold text-[#9b9a97] uppercase">Audio Embed</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Link href={`/dashboard/notes/${item.entityId}`} className="p-2 bg-white rounded-full hover:scale-110 transition-transform text-[#37352f]" title="Open Note">
                                                <ExternalLink size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white">
                                        <p className="text-xs font-semibold text-[#37352f] truncate mb-1">{item.noteTitle}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#9b9a97] uppercase tracking-widest">
                                                {item.type === 'image' && <ImageIcon size={10} />}
                                                {item.type === 'video' && <Video size={10} />}
                                                {item.type === 'audio' && <Music size={10} />}
                                                {item.type}
                                            </span>
                                            <span className="text-[10px] text-[#d3d1cb]">
                                                {new Date(item.updatedAt).toLocaleDateString()}
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
