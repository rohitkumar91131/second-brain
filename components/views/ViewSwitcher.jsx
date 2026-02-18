'use client'

import { useState, useEffect } from 'react'
import { Table2, Columns, Calendar, List } from 'lucide-react'
import { useApp } from '@/context/AppContext'

const VIEWS = [
    { key: 'table', label: 'Table', icon: Table2 },
    { key: 'board', label: 'Board', icon: Columns },
    { key: 'calendar', label: 'Calendar', icon: Calendar },
    { key: 'list', label: 'List', icon: List },
]

export default function ViewSwitcher({ activeView, onViewChange, tabName = 'Tasks' }) {
    const { setViewPreference } = useApp()
    const [menu, setMenu] = useState(null)

    const handleContextMenu = (e, key) => {
        e.preventDefault()
        setMenu({ x: e.clientX, y: e.clientY, key })
    }

    const handleSetDefault = () => {
        if (menu) {
            setViewPreference(tabName, menu.key)
            setMenu(null)
        }
    }

    useEffect(() => {
        const handleClick = () => setMenu(null)
        window.addEventListener('click', handleClick)
        return () => window.removeEventListener('click', handleClick)
    }, [])

    return (
        <div className="relative">
            <div className="flex items-center gap-0.5 border border-[#e9e9e7] rounded-md p-0.5 bg-[#f7f7f5]">
                {VIEWS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => onViewChange(key)}
                        onContextMenu={(e) => handleContextMenu(e, key)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${activeView === key
                            ? 'bg-white shadow-sm text-[#37352f]'
                            : 'text-[#9b9a97] hover:text-[#37352f]'
                            }`}
                    >
                        <Icon size={13} />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>

            {menu && (
                <div
                    className="fixed z-[999] bg-white border border-[#e9e9e7] rounded-lg shadow-xl py-1 min-w-[200px] animate-in fade-in zoom-in duration-100"
                    style={{ top: menu.y, left: menu.x }}
                >
                    <button
                        onClick={handleSetDefault}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-[#37352f] hover:bg-[#f1f1ef] transition-colors flex items-center gap-2"
                    >
                        <span className="w-2 h-2 rounded-full bg-[#2eaadc] shadow-sm shadow-[#2eaadc]/30" />
                        Set as default for {tabName}
                    </button>
                </div>
            )}
        </div>
    )
}
