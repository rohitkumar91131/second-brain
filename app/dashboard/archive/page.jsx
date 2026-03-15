'use client'

import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { Archive, Trash2, FileText } from 'lucide-react'
import { format } from 'date-fns'
import StatusTag from '@/components/properties/StatusTag'

export default function ArchivePage() {
    const { archivedNotes, restoreNote, recycleNote, fetchEndpoint, loading, isFetched } = useApp()

    useEffect(() => {
        if (!isFetched('notes?archived=true')) fetchEndpoint('notes?archived=true')
    }, [fetchEndpoint, isFetched])

    if (loading && archivedNotes.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-sm text-notion-muted">Loading archive...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-3 border-b border-notion-border">
                <p className="text-xs text-notion-muted">{archivedNotes.length} archived items</p>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {archivedNotes.length === 0 ? (
                    <div className="text-center py-16 text-notion-muted">
                        <Archive size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Archive is empty</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#e9e9e7] border border-notion-border rounded-xl overflow-hidden">
                        {archivedNotes.map(item => (
                            <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-notion-bg hover:bg-white/5 group">
                                <FileText size={16} className="text-notion-muted" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-notion-text truncate font-medium">{item.title}</p>
                                    {item.preview && (
                                        <p className="text-xs text-notion-muted line-clamp-1 mb-0.5">{item.preview}</p>
                                    )}
                                    <p className="text-xs text-notion-muted">
                                        Note · Last updated {format(new Date(item.updatedAt), 'MMM d, yyyy')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => restoreNote(item.id)}
                                        className="text-xs px-2 py-1 rounded bg-[#f1f1ef] text-notion-text hover:bg-notion-border transition-colors"
                                    >
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => recycleNote(item.id)}
                                        className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors"
                                        title="Move to Recycle Bin"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
