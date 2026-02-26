'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Trash2, Archive, Share2, Download, ExternalLink } from 'lucide-react'
import gsap from 'gsap'

export default function ContextNoteCard({ note, project, onDelete, onArchive, onPdf, onShare }) {
    const cardRef = useRef(null)
    const menuRef = useRef(null)
    const [menuPos, setMenuPos] = useState(null)
    const pressTimer = useRef(null)

    const handleContextMenu = (e) => {
        e.preventDefault()
        const x = e.clientX
        const y = e.clientY
        setMenuPos({ x, y })
    }

    const handleTouchStart = (e) => {
        pressTimer.current = setTimeout(() => {
            const touch = e.touches[0]
            setMenuPos({ x: touch.clientX, y: touch.clientY })
        }, 600) // 600ms long press
    }

    const handleTouchEnd = () => {
        if (pressTimer.current) clearTimeout(pressTimer.current)
    }

    useEffect(() => {
        if (menuPos && menuRef.current) {
            gsap.fromTo(menuRef.current,
                { opacity: 0, scale: 0.9, y: -10 },
                { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" }
            )
        }
    }, [menuPos])

    useEffect(() => {
        const handleClickOutside = () => setMenuPos(null)
        window.addEventListener('click', handleClickOutside)
        return () => window.removeEventListener('click', handleClickOutside)
    }, [])

    const preview = note.preview || ''

    return (
        <>
            <div
                ref={cardRef}
                onContextMenu={handleContextMenu}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
                className="group relative border border-[#e9e9e7] rounded-xl p-4 bg-white hover:shadow-md transition-all cursor-context-menu"
            >
                <Link href={`/dashboard/notes/${note.id}`} className="block">
                    <h3 className="text-sm font-semibold text-[#37352f] mb-1 truncate">
                        {project ? `${note.title} / ${project.title}` : note.title}
                    </h3>

                    {preview && (
                        <p className="text-xs text-[#9b9a97] line-clamp-2 mb-2">
                            {preview}
                        </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-wrap gap-1">
                            {note.tags?.slice(0, 2).map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 bg-[#f1f1ef] text-[#787774] text-[10px] rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <span className="text-[10px] text-[#9b9a97]">
                            {note.updatedAt ? format(new Date(note.updatedAt), 'MMM d') : ''}
                        </span>
                    </div>
                </Link>

                <button
                    onClick={(e) => {
                        e.preventDefault()
                        onDelete(note.id)
                    }}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 size={12} />
                </button>
            </div>

            {menuPos && (
                <div
                    ref={menuRef}
                    className="fixed z-[100] bg-white border border-[#e9e9e7] rounded-xl shadow-xl py-2 w-48 text-sm text-[#37352f]"
                    style={{ top: menuPos.y, left: menuPos.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Link href={`/dashboard/notes/${note.id}`} className="flex items-center gap-2 px-4 py-2 hover:bg-[#f7f7f5] transition-colors w-full text-left">
                        <ExternalLink size={14} /> Open in Window
                    </Link>
                    <button onClick={() => { onArchive(note.id); setMenuPos(null) }} className="flex items-center gap-2 px-4 py-2 hover:bg-[#f7f7f5] transition-colors w-full text-left">
                        <Archive size={14} /> Archive Note
                    </button>
                    <button onClick={() => { onPdf(note); setMenuPos(null) }} className="flex items-center gap-2 px-4 py-2 hover:bg-[#f7f7f5] transition-colors w-full text-left">
                        <Download size={14} /> Download as PDF
                    </button>
                    <button onClick={() => { onShare(note); setMenuPos(null) }} className="flex items-center gap-2 px-4 py-2 hover:bg-[#f7f7f5] transition-colors w-full text-left">
                        <Share2 size={14} /> Share Note
                    </button>
                    <div className="h-px bg-[#e9e9e7] my-1" />
                    <button onClick={() => { onDelete(note.id); setMenuPos(null) }} className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors w-full text-left">
                        <Trash2 size={14} /> Move to Recycle Bin
                    </button>
                </div>
            )}
        </>
    )
}
