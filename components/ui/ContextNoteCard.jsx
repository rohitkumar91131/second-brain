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
                className="group relative border border-notion-border rounded-xl p-4 bg-notion-bg hover:shadow-md transition-all cursor-context-menu"
            >
                <Link href={`/dashboard/notes/${note.id}`} target="_blank" className="block">
                    <h3 className="text-sm font-semibold text-notion-text mb-1 truncate">
                        {project ? `${note.title} / ${project.title}` : note.title}
                    </h3>

                    {preview && (
                        <p className="text-xs text-notion-muted line-clamp-2 mb-2">
                            {preview}
                        </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-wrap gap-1">
                            {note.tags?.slice(0, 2).map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 bg-[#f1f1ef] dark:bg-notion-sidebar text-notion-muted text-[10px] rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <span className="text-[10px] text-notion-muted">
                            {note.updatedAt ? format(new Date(note.updatedAt), 'MMM d') : ''}
                        </span>
                    </div>
                </Link>

                <button
                    onClick={(e) => {
                        e.preventDefault()
                        onDelete(note.id)
                    }}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 size={12} />
                </button>
            </div>

            {menuPos && (
                <div
                    ref={menuRef}
                    className="fixed z-[100] bg-notion-bg border border-notion-border rounded-xl shadow-xl py-2 w-48 text-sm text-notion-text"
                    style={{ top: menuPos.y, left: menuPos.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Link href={`/dashboard/notes/${note.id}`} target="_blank" className="flex items-center gap-2 px-4 py-2 hover:bg-notion-sidebar transition-colors w-full text-left">
                        <ExternalLink size={14} /> Open in Window
                    </Link>
                    <button onClick={() => { onArchive(note.id); setMenuPos(null) }} className="flex items-center gap-2 px-4 py-2 hover:bg-notion-sidebar transition-colors w-full text-left">
                        <Archive size={14} /> Archive Note
                    </button>
                    <button onClick={() => { onPdf(note); setMenuPos(null) }} className="flex items-center gap-2 px-4 py-2 hover:bg-notion-sidebar transition-colors w-full text-left">
                        <Download size={14} /> Download as PDF
                    </button>
                    <button onClick={() => { onShare(note); setMenuPos(null) }} className="flex items-center gap-2 px-4 py-2 hover:bg-notion-sidebar transition-colors w-full text-left">
                        <Share2 size={14} /> Share Note
                    </button>
                    <div className="h-px bg-notion-border my-1" />
                    <button onClick={() => { onDelete(note.id); setMenuPos(null) }} className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors w-full text-left">
                        <Trash2 size={14} /> Move to Recycle Bin
                    </button>
                </div>
            )}
        </>
    )
}
