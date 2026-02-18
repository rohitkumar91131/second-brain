'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, size = 'md' }) {
    const overlayRef = useRef(null)

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [onClose])

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 animate-fade-in"
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        >
            <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} animate-fade-in`}>
                {title && (
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#e9e9e7]">
                        <h2 className="text-sm font-semibold text-[#37352f]">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-[#efefef] text-[#9b9a97] hover:text-[#37352f] transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
                <div className="p-5">{children}</div>
            </div>
        </div>
    )
}
