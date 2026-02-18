'use client'

import { useApp } from '@/context/AppContext'
import { Map, Plus, Trash2 } from 'lucide-react'

const AREA_COLORS = ['#2eaadc', '#0f7b6c', '#6940a5', '#d9730d', '#e03e3e', '#0b6e99', '#37352f']

export default function AreasPage() {
    const { areas, updateAreas } = useApp()

    const addArea = () => {
        const newArea = {
            id: `area-${Date.now()}`,
            title: 'New Area',
            icon: '📌',
            description: '',
            color: AREA_COLORS[areas.length % AREA_COLORS.length],
        }
        updateAreas([...areas, newArea])
    }

    const updateArea = (id, updates) => {
        updateAreas(areas.map(a => a.id === id ? { ...a, ...updates } : a))
    }

    const deleteArea = (id) => {
        updateAreas(areas.filter(a => a.id !== id))
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#e9e9e7]">
                <p className="text-xs text-[#9b9a97]">Areas of life to organize your projects and goals</p>
                <button
                    onClick={addArea}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#37352f] text-white text-xs font-medium rounded-md hover:bg-[#2f2d28] transition-colors"
                >
                    <Plus size={13} />
                    New Area
                </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {areas.length === 0 ? (
                    <div className="text-center py-16 text-[#9b9a97]">
                        <Map size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No areas yet. Add your first area of life!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {areas.map(area => (
                            <div
                                key={area.id}
                                className="group border border-[#e9e9e7] rounded-xl p-4 bg-white hover:shadow-sm transition-shadow"
                                style={{ borderLeftColor: area.color, borderLeftWidth: 3 }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{area.icon}</span>
                                        <input
                                            value={area.title}
                                            onChange={e => updateArea(area.id, { title: e.target.value })}
                                            className="text-sm font-semibold text-[#37352f] bg-transparent focus:outline-none border-b border-transparent focus:border-[#e9e9e7]"
                                        />
                                    </div>
                                    <button
                                        onClick={() => deleteArea(area.id)}
                                        className="hover-reveal p-1 rounded hover:bg-red-50 text-red-400 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                <input
                                    value={area.description}
                                    onChange={e => updateArea(area.id, { description: e.target.value })}
                                    placeholder="Description..."
                                    className="text-xs text-[#9b9a97] bg-transparent focus:outline-none w-full"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
