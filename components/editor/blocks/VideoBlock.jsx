'use client'

import { useState, useEffect, useRef } from 'react'
import { Video, Minus, Maximize2, X, GripVertical } from 'lucide-react' // GripVertical import kiya

export default function VideoBlock({ block, onUpdate, onDelete, onDragHandleDown, onDragHandleUp }) { // Naye props add kiye
    const [isFullScreen, setIsFullScreen] = useState(false)
    const videoRef = useRef(null)

    const getEmbedInfo = (url) => {
        if (!url) return { type: 'none', url: '' };

        if (url.match(/\.(mp4|webm|ogg|mov)$/i)) {
            return { type: 'video', url };
        }

        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
            return { type: 'iframe', url: `https://www.youtube.com/embed/${videoId}?autoplay=1` };
        }

        if (url.includes('instagram.com')) {
            const parts = url.split('/p/') || url.split('/reel/');
            if (parts[1]) {
                const id = parts[1].split('/')[0];
                return { type: 'iframe', url: `https://www.instagram.com/p/${id}/embed` };
            }
            return { type: 'iframe', url: url.split('?')[0] + 'embed' };
        }

        if (url.includes('vimeo.com')) {
            const id = url.split('vimeo.com/')[1]?.split('/')[0];
            return { type: 'iframe', url: `https://player.vimeo.com/video/${id}` };
        }

        return { type: 'iframe', url };
    }

    const embedInfo = getEmbedInfo(block.content);

    // Escape key handling
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') setIsFullScreen(false) }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    return (
        <div className="group flex flex-col gap-2 my-6 relative w-full">

            {/* --- DRAG HANDLE ADD KIYA --- */}
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

            {block.content ? (
                <div className="relative w-full rounded-lg overflow-hidden bg-black/5 aspect-video border border-notion-border group/vid">
                    {embedInfo.type === 'video' ? (
                        <video
                            ref={videoRef}
                            src={embedInfo.url}
                            controls
                            className="w-full h-full object-contain bg-black"
                        />
                    ) : (
                        <iframe
                            src={embedInfo.url.replace('autoplay=1', '')} // Default state no autoplay
                            className="w-full h-full border-none"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    )}

                    {/* Controls Overlay */}
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/vid:opacity-100 transition-opacity z-20">
                        <button
                            onClick={() => setIsFullScreen(true)}
                            className="bg-notion-bg/90 p-1.5 rounded-md text-notion-muted hover:text-notion-accent shadow-sm transition-colors"
                        >
                            <Maximize2 size={14} />
                        </button>
                        <button
                            onClick={onDelete}
                            className="bg-notion-bg/90 p-1.5 rounded-md text-notion-muted hover:text-red-500 shadow-sm transition-colors"
                        >
                            <Minus size={14} />
                        </button>
                    </div>

                    {/* --- FULL SCREEN VIDEO MODAL --- */}
                    {isFullScreen && (
                        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 md:p-10 animate-fade-in">
                            <button
                                onClick={() => setIsFullScreen(false)}
                                className="absolute top-6 left-6 z-[10000] flex items-center gap-2 px-3 py-2 bg-notion-bg/10 hover:bg-notion-bg/20 text-white rounded-lg transition-all text-sm font-medium border border-white/10"
                            >
                                <X size={18} />
                                <span>Back</span>
                            </button>

                            <div className="w-full h-full max-w-6xl max-h-[80vh] aspect-video">
                                {embedInfo.type === 'video' ? (
                                    <video
                                        src={embedInfo.url}
                                        controls
                                        autoPlay
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <iframe
                                        src={embedInfo.url.includes('?') ? `${embedInfo.url}&autoplay=1` : `${embedInfo.url}?autoplay=1`}
                                        className="w-full h-full border-none shadow-2xl"
                                        allowFullScreen
                                        allow="autoplay; encrypted-media"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative w-full flex flex-col items-center gap-3 bg-notion-sidebar/50 border border-dashed border-notion-border rounded-xl p-8 transition-colors hover:bg-notion-sidebar">
                    <Video size={24} className="text-notion-muted opacity-40" />
                    <div className="w-full max-w-md flex items-center gap-2 bg-notion-bg border border-notion-border rounded-lg p-1 shadow-sm">
                        <input
                            autoFocus
                            placeholder="Paste video URL..."
                            onKeyDown={(e) => { if (e.key === 'Enter') onUpdate({ content: e.target.value }) }}
                            className="flex-1 text-sm p-2 outline-none bg-transparent"
                        />
                        <button
                            className="px-4 py-2 text-xs font-bold bg-[#37352f] text-white rounded-md hover:bg-[#2f2d28]"
                            onClick={(e) => {
                                const val = e.currentTarget.previousSibling.value;
                                if (val) onUpdate({ content: val })
                            }}
                        >
                            Embed
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}