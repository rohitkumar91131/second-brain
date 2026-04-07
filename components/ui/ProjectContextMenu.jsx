'use client'

import { useEffect, useRef } from 'react'
import { Edit, Trash2, FolderMinus, X, Check, Download } from 'lucide-react'

export default function ProjectContextMenu({ x, y, onClose, onEdit, onDelete, onRemoveFromParent, onMakeOffline, isMobile }) {
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
        zIndex: 1000,
    } : {
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 1000,
        minWidth: '200px'
    }

    return (
        <>
            {isMobile && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-[999] backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}
            <div
                ref={menuRef}
                style={menuStyles}
                className={`
                    sidebar-transition animate-in fade-in slide-in-from-bottom-2 duration-200
                    ${isMobile
                        ? 'bg-slate-900 border-t border-white/10 rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]'
                        : 'bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl'}
                `}
            >
                {isMobile && (
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="text-sm font-black text-white uppercase tracking-[0.2em]">Project Options</span>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Management Console</p>
                        </div>
                        <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <ContextItem
                        icon={<Edit size={isMobile ? 18 : 14} />}
                        label="Edit Project"
                        onClick={() => { onEdit(); onClose(); }}
                        isMobile={isMobile}
                    />
                    {onMakeOffline && (
                        <ContextItem
                            icon={<Download size={isMobile ? 18 : 14} />}
                            label="Make Available Offline"
                            onClick={() => { onMakeOffline(); onClose(); }}
                            isMobile={isMobile}
                        />
                    )}
                    <ContextItem
                        icon={<FolderMinus size={isMobile ? 18 : 14} />}
                        label="Remove from Parent"
                        onClick={() => { onRemoveFromParent(); onClose(); }}
                        isMobile={isMobile}
                    />
                    <div className={`h-px bg-white/5 my-1 ${isMobile ? 'my-3' : 'my-1'}`} />
                    <ContextItem
                        icon={<Trash2 size={isMobile ? 18 : 14} />}
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
                flex items-center gap-3 w-full rounded-xl transition-all font-bold
                ${isMobile ? 'py-4 px-4 text-base' : 'py-2 px-3 text-xs'}
                ${danger
                    ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }
            `}
        >
            <span className={`${danger ? 'text-red-500' : 'text-slate-500 transition-colors'}`}>{icon}</span>
            <span className="tracking-wide">{label}</span>
        </button>
    )
}
