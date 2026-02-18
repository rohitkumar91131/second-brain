'use client'

import { useApp } from '@/context/AppContext'
import { Archive, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import StatusTag from '@/components/properties/StatusTag'

export default function ArchivePage() {
    const { archive, updateArchive } = useApp()

    const handleDelete = (id) => {
        updateArchive(archive.filter(a => a.id !== id))
    }

    const handleClearAll = () => {
        if (confirm('Clear all archived items?')) updateArchive([])
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#e9e9e7]">
                <p className="text-xs text-[#9b9a97]">{archive.length} archived items</p>
                {archive.length > 0 && (
                    <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                        Clear all
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-auto p-6">
                {archive.length === 0 ? (
                    <div className="text-center py-16 text-[#9b9a97]">
                        <Archive size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Archive is empty</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#e9e9e7] border border-[#e9e9e7] rounded-xl overflow-hidden">
                        {archive.map(item => (
                            <div key={`${item.id}-${item.archivedAt}`} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#fafafa] group">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[#37352f] truncate">{item.title}</p>
                                    <p className="text-xs text-[#9b9a97]">
                                        {item.type} · Archived {format(new Date(item.archivedAt), 'MMM d, yyyy')}
                                    </p>
                                </div>
                                {item.status && <StatusTag status={item.status} />}
                                <button
                                    onClick={() => handleDelete(`${item.id}-${item.archivedAt}`)}
                                    className="hover-reveal p-1 rounded hover:bg-red-50 text-red-400 transition-colors"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
