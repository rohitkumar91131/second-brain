'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    useEffect(() => {
        window.showToast = (message, type = 'success', duration = 3000) => {
            const id = Math.random()
            setToasts(prev => [...prev, { id, message, type }])
            if (duration > 0) {
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== id))
                }, duration)
            }
            return id
        }
    }, [])

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    return (
        <>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </>
    )
}

function Toast({ message, type, onClose }) {
    const bgColor = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        loading: 'bg-blue-50 border-blue-200',
        info: 'bg-blue-50 border-blue-200',
    }[type]

    const textColor = {
        success: 'text-green-800',
        error: 'text-red-800',
        loading: 'text-blue-800',
        info: 'text-blue-800',
    }[type]

    const iconColor = {
        success: 'text-green-600',
        error: 'text-red-600',
        loading: 'text-blue-600',
        info: 'text-blue-600',
    }[type]

    const Icon = {
        success: CheckCircle,
        error: AlertCircle,
        loading: Info,
        info: Info,
    }[type]

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColor} pointer-events-auto animate-in slide-in-from-top fade-in duration-300`}>
            <Icon size={18} className={`flex-shrink-0 ${iconColor} ${type === 'loading' ? 'animate-spin' : ''}`} />
            <span className={`text-sm font-medium ${textColor}`}>
                {message}
            </span>
            <button
                onClick={onClose}
                className={`ml-2 p-0.5 rounded hover:bg-black/10 transition-colors`}
            >
                <X size={16} className={textColor} />
            </button>
        </div>
    )
}
