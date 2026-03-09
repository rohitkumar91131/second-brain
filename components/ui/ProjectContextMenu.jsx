'use client'

import { useEffect, useRef } from 'react'
import { Edit, Trash2, FolderMinus, X } from 'lucide-react'

export default function ProjectContextMenu({ x, y, onClose, onEdit, onDelete, onRemoveFromParent, isMobile }) {
    const menuRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchstart', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('touchstart', handleClickOutside)
        }
    }, [onClose])

    const menuStyles = isMobile ? {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--notion-bg)',
        borderTop: '1px solid var(--notion-border)',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        padding: '16px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        zIndex: 1000,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
    } : {
        position: 'fixed',
        top: y,
        left: x,
        backgroundColor: 'var(--notion-bg)',
        border: '1px solid var(--notion-border)',
        borderRadius: '6px',
        padding: '4px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        minWidth: '180px'
    }

    return (
        <>
            {isMobile && (
                <div
                    className="fixed inset-0 bg-black/20 z-[999] backdrop-blur-[1px]"
                    onClick={onClose}
                />
            )}
            <div ref={menuRef} style={menuStyles} className="sidebar-transition animate-in fade-in slide-in-from-bottom-2 duration-200">
                {isMobile && (
                    <div className="flex items-center justify-between mb-4 border-b border-notion-border pb-2">
                        <span className="text-sm font-bold text-notion-text uppercase tracking-wider">Project Options</span>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-notion-hover">
                            <X size={18} className="text-notion-muted" />
                        </button>
                    </div>
                )}

                <div className="flex flex-col gap-0.5">
                    <ContextItem
                        icon={<Edit size={14} />}
                        label="Edit Project"
                        onClick={() => { onEdit(); onClose(); }}
                        isMobile={isMobile}
                    />
                    <ContextItem
                        icon={<FolderMinus size={14} />}
                        label="Remove from Parent"
                        onClick={() => { onRemoveFromParent(); onClose(); }}
                        isMobile={isMobile}
                    />
                    <div className="h-px bg-notion-border my-1" />
                    <ContextItem
                        icon={<Trash2 size={14} />}
                        label="Delete Project"
                        onClick={() => { onDelete(); onClose(); }}
                        isMobile={isMobile}
                        danger
                    />
                </div>
            </div>
        </>
    )
}

function ContextItem({ icon, label, onClick, isMobile, danger }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-2.5 w-full rounded transition-colors
                ${isMobile ? 'py-3.5 px-3' : 'py-1.5 px-2.5 text-xs'}
                ${danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-notion-text hover:bg-notion-hover'
                }
            `}
        >
            <span className={danger ? 'text-red-500' : 'text-notion-muted'}>{icon}</span>
            <span className="font-medium">{label}</span>
        </button>
    )
}
