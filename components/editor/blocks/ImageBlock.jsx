'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Image as ImageIcon, Minus, Maximize2, X, Download, GripVertical } from 'lucide-react' // GripVertical import kiya
import { CldUploadWidget } from 'next-cloudinary'
import { toast } from 'sonner'
import { cacheOfflineImage, getOfflineImage } from '@/lib/offlineDb'

// Naye props onDragHandleDown aur onDragHandleUp receive kiye
export default function ImageBlock({ block, onUpdate, onDelete, onDragHandleDown, onDragHandleUp }) {
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [offlineSrc, setOfflineSrc] = useState(null)
    const [cachedBlob, setCachedBlob] = useState(null)

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsFullScreen(false)
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    useEffect(() => {
        let isActive = true
        let objectUrl = null
        const resolveImage = async () => {
            if (!block.content) {
                setOfflineSrc(null)
                setCachedBlob(null)
                return
            }
            const applyBlob = (blob) => {
                objectUrl = URL.createObjectURL(blob)
                if (isActive) {
                    setOfflineSrc(objectUrl)
                    setCachedBlob(blob)
                }
            }
            try {
                const cached = await getOfflineImage(block.content)
                if (cached) {
                    applyBlob(cached)
                    return
                }
                const downloaded = await cacheOfflineImage(block.content)
                if (downloaded) {
                    applyBlob(downloaded)
                    return
                }
                if (isActive) {
                    setOfflineSrc(null)
                    setCachedBlob(null)
                }
            } catch (error) {
                console.error('Failed to resolve offline image', block.content, error)
                if (isActive) {
                    setOfflineSrc(null)
                    setCachedBlob(null)
                }
            }
        }

        resolveImage()
        return () => {
            isActive = false
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl)
            }
        }
    }, [block.content])

    const handleDownload = async (imageUrl) => {
        try {
            setIsDownloading(true)
            let blob = cachedBlob
            if (!blob) {
                const response = await fetch(imageUrl)
                blob = await response.blob()
            }
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `second-brain-img-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            window.open(imageUrl, '_blank');
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className="group flex items-start gap-2 my-6 relative w-full">

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

            <div className="flex-1 w-full">
                {block.content ? (
                    <div className="relative inline-flex w-full justify-center group/img">
                        <Image
                            src={offlineSrc || block.content}
                            alt="Note image"
                            width={800}
                            height={600}
                            unoptimized={true}
                            referrerPolicy="no-referrer"
                            onClick={() => setIsFullScreen(true)}
                            className="max-w-full h-auto object-contain rounded-lg border border-notion-border cursor-zoom-in hover:brightness-95 transition-all"
                        />

                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <button
                                onClick={() => setIsFullScreen(true)}
                                className="bg-notion-bg/90 p-1.5 rounded-md text-notion-muted hover:text-notion-accent shadow-sm transition-colors"
                                title="Full Screen"
                            >
                                <Maximize2 size={14} />
                            </button>
                            <button
                                onClick={onDelete}
                                className="bg-notion-bg/90 p-1.5 rounded-md text-notion-muted hover:text-red-500 shadow-sm transition-colors"
                                title="Delete Image"
                            >
                                <Minus size={14} />
                            </button>
                        </div>

                        {/* FULL SCREEN MODAL */}
                        {isFullScreen && (
                            <div className="fixed inset-0 z-[9999] bg-[#37352f]/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
                                <button
                                    onClick={() => setIsFullScreen(false)}
                                    className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 bg-notion-bg/10 hover:bg-notion-bg/20 text-white rounded-lg transition-all text-sm font-medium border border-white/10"
                                >
                                    <X size={18} />
                                    <span>Back</span>
                                </button>

                                <button
                                    onClick={() => handleDownload(block.content)}
                                    disabled={isDownloading}
                                    className="absolute top-6 right-6 p-2.5 bg-notion-bg/10 hover:bg-notion-bg/20 text-white rounded-lg transition-all border border-white/10 disabled:opacity-50"
                                >
                                    <Download size={18} className={isDownloading ? 'animate-bounce' : ''} />
                                </button>

                                <Image
                                    src={offlineSrc || block.content}
                                    alt="Full view"
                                    width={1200}
                                    height={800}
                                    className="max-w-full max-h-full object-contain rounded-sm shadow-2xl animate-zoom-in"
                                />

                                <div
                                    className="absolute inset-0 -z-10"
                                    onClick={() => setIsFullScreen(false)}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <CldUploadWidget
                        uploadPreset="notes second brain"
                        onSuccess={(result) => {
                            if (result.info?.secure_url) {
                                onUpdate({ content: result.info.secure_url });
                            } else {
                                toast.error("image upload failed");
                                onDelete();
                            }
                        }}
                        onError={() => {
                            toast.error("image upload failed");
                            onDelete();
                        }}
                        options={{
                            multiple: false,
                            resourceType: "image",
                            clientAllowedFormats: ["jpeg", "png", "jpg", "webp", "gif"],
                        }}
                    >
                        {({ open }) => {
                            return (
                                <div
                                    onClick={(e) => {
                                        e.preventDefault();
                                        open();
                                    }}
                                    className="border border-dashed border-notion-border bg-notion-sidebar/50 hover:bg-notion-sidebar transition-colors rounded-lg p-8 flex flex-col items-center justify-center text-sm text-notion-muted w-full cursor-pointer"
                                >
                                    <ImageIcon size={24} className="mb-2 opacity-40" />
                                    <span className="font-medium hover:text-notion-text transition-colors">
                                        Click to add image via link, device, or camera
                                    </span>
                                </div>
                            )
                        }}
                    </CldUploadWidget>
                )}
            </div>
        </div>
    )
}
