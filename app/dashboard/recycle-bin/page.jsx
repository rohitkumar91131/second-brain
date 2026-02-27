'use client'

import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { Trash2, RotateCcw, FileText, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

export default function RecycleBinPage() {
    const { deletedNotes, restoreNote, deleteNotePermanently, fetchEndpoint, loading } = useApp()

    useEffect(() => {
        fetchEndpoint('notes?deleted=true')
    }, [fetchEndpoint])

    if (loading && deletedNotes.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-sm text-notion-muted">Loading recycle bin...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col gap-1 px-6 py-4 border-b border-notion-border">
                <h1 className="text-sm font-semibold text-notion-text flex items-center gap-2">
                    <Trash2 size={16} /> Recycle Bin
                </h1>
                <p className="text-xs text-notion-muted">Items in the recycle bin are deleted permanently after 30 days.</p>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {deletedNotes.length === 0 ? (
                    <div className="text-center py-16 text-notion-muted">
                        <Trash2 size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Recycle bin is empty</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {deletedNotes.map(item => (
                            <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-notion-bg border border-notion-border rounded-xl hover:bg-[#fafafa] group shadow-sm transition-all hover:shadow-md">
                                <FileText size={16} className="text-notion-muted" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-notion-text truncate font-medium">{item.title}</p>
                                    {item.preview && (
                                        <p className="text-xs text-notion-muted line-clamp-1 mb-0.5">{item.preview}</p>
                                    )}
                                    <p className="text-xs text-notion-muted">
                                        Note · Deleted on {format(new Date(item.deletedAt), 'MMM d, yyyy')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => restoreNote(item.id)}
                                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-[#f1f1ef] text-notion-text hover:bg-notion-border transition-all"
                                    >
                                        <RotateCcw size={13} />
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Permanently delete this item? This action cannot be undone.')) {
                                                deleteNotePermanently(item.id)
                                            }
                                        }}
                                        className="p-2 rounded-md hover:bg-red-50 text-red-400 hover:text-red-500 transition-all"
                                        title="Delete Permanently"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {deletedNotes.length > 0 && (
                <div className="px-6 py-4 bg-[#fff8f8] border-t border-red-50 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    <p className="text-[11px] text-red-500 font-medium">Deleted items cannot be recovered once they are permanently removed.</p>
                </div>
            )}
        </div>
    )
}
