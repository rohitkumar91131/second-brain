'use client'

import { useState, useEffect } from 'react'
import { Image as ImageIcon, Minus, Maximize2, X, Download } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'

export default function ImageBlock({ block, onUpdate, onDelete }) {
    const [isFullScreen, setIsFullScreen] = useState(false)

    // Esc key se full screen close karne ke liye
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsFullScreen(false)
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    return (
        <div className="group flex items-start gap-2 my-6 relative w-full">
            <div className="flex-1 w-full">
                {block.content ? (
                    <div className="relative inline-flex w-full justify-center group/img">
                        <img
                            src={block.content}
                            alt="Block"
                            onClick={() => setIsFullScreen(true)}
                            className="max-w-full h-auto object-contain rounded-lg border border-[#e9e9e7] cursor-zoom-in hover:brightness-95 transition-all"
                        />

                        {/* Hover hone par controls dikhenge */}
                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <button
                                onClick={() => setIsFullScreen(true)}
                                className="bg-white/90 p-1.5 rounded-md text-[#9b9a97] hover:text-[#2eaadc] shadow-sm transition-colors"
                                title="Full Screen"
                            >
                                <Maximize2 size={14} />
                            </button>
                            <button
                                onClick={onDelete}
                                className="bg-white/90 p-1.5 rounded-md text-[#9b9a97] hover:text-red-500 shadow-sm transition-colors"
                                title="Delete Image"
                            >
                                <Minus size={14} />
                            </button>
                        </div>

                        {/* --- FULL SCREEN MODAL --- */}
                        {isFullScreen && (
                            <div className="fixed inset-0 z-[9999] bg-[#37352f]/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
                                {/* Back/Close Button */}
                                <button
                                    onClick={() => setIsFullScreen(false)}
                                    className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm font-medium border border-white/10"
                                >
                                    <X size={18} />
                                    <span>Back</span>
                                </button>

                                {/* Quick Download Button */}
                                <a
                                    href={block.content}
                                    download
                                    target="_blank"
                                    className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10"
                                >
                                    <Download size={18} />
                                </a>

                                <img
                                    src={block.content}
                                    alt="Full view"
                                    className="max-w-full max-h-full object-contain rounded-sm shadow-2xl animate-zoom-in"
                                />

                                {/* Background click to close */}
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
                            }
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
                                    className="border border-dashed border-[#e9e9e7] bg-[#f7f7f5]/50 hover:bg-[#f7f7f5] transition-colors rounded-lg p-8 flex flex-col items-center justify-center text-sm text-[#9b9a97] w-full cursor-pointer"
                                >
                                    <ImageIcon size={24} className="mb-2 opacity-40" />
                                    <span className="font-medium hover:text-[#37352f] transition-colors">
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