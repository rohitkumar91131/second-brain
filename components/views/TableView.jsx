'use client'

import { useState } from 'react'
import StatusTag from '@/components/properties/StatusTag'
import ProgressBar from '@/components/properties/ProgressBar'
import { Trash2, Plus, Check } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function TableView({ items, columns, onUpdate, onDelete, onAdd, entityType }) {
    const [editingCell, setEditingCell] = useState(null) // { rowId, colKey }
    const router = useRouter()

    const handleCellEdit = (rowId, colKey, value, extraFields = {}) => {
        onUpdate(rowId, { [colKey]: value, ...extraFields })
        setEditingCell(null)
    }

    const handleRowClick = (item) => {
        if (entityType === 'project') {
            router.push(`/dashboard/projects/${item.id}`)
        } else if (entityType === 'note') {
            router.push(`/dashboard/notes/${item.id}`)
        } else if (entityType === 'task') {
            router.push(`/dashboard/tasks/${item.id}`)
        }
    }

    return (
        <div className="overflow-x-auto">
            <table className="notion-table">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} style={{ minWidth: col.width || 120 }}>
                                {col.label}
                            </th>
                        ))}
                        <th style={{ width: 40 }}></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} className="group hover:cursor-pointer" onClick={() => handleRowClick(item)}>
                            {columns.map(col => (
                                <td key={col.key} onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingCell({ rowId: item.id, colKey: col.key })
                                }}>
                                    <CellRenderer
                                        col={col}
                                        value={item[col.key]}
                                        isEditing={editingCell?.rowId === item.id && editingCell?.colKey === col.key}
                                        onSave={(val, extra) => handleCellEdit(item.id, col.key, val, extra)}
                                        onCancel={() => setEditingCell(null)}
                                    />
                                </td>
                            ))}
                            <td onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="hover-reveal p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Add row button */}
            <button
                onClick={onAdd}
                className="flex items-center gap-2 w-full px-4 py-2 text-xs text-notion-muted hover:text-notion-text hover:bg-notion-sidebar transition-colors border-t border-notion-border"
            >
                <Plus size={13} />
                New {entityType}
            </button>
        </div>
    )
}

function CellRenderer({ col, value, isEditing, onSave, onCancel }) {
    const [editVal, setEditVal] = useState(value)

    if (col.type === 'status') {
        return <StatusTag status={value} editable onChange={(v) => onSave(v)} />
    }

    if (col.type === 'progress') {
        return (
            <div className="w-32">
                {isEditing ? (
                    <input
                        autoFocus
                        type="number"
                        min="0" max="100"
                        defaultValue={value}
                        className="w-16 text-xs border border-[#2eaadc] rounded px-1 py-0.5"
                        onBlur={e => onSave(Number(e.target.value))}
                        onKeyDown={e => { if (e.key === 'Enter') onSave(Number(e.target.value)); if (e.key === 'Escape') onCancel() }}
                    />
                ) : (
                    <ProgressBar value={value} />
                )}
            </div>
        )
    }

    if (col.type === 'checkbox') {
        return (
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    // If this is the 'completed' checkbox, also sync status
                    if (col.key === 'completed') {
                        onSave(!value, { status: !value ? 'Done' : 'Not Started' })
                    } else {
                        onSave(!value)
                    }
                }}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${value ? 'bg-[#37352f] border-[#37352f]' : 'border-notion-border hover:border-[#37352f]'
                    }`}
            >
                {value && <Check size={10} className="text-white" />}
            </button>
        )
    }

    if (col.type === 'tags') {
        return (
            <div className="flex flex-wrap gap-1">
                {(value || []).map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-[#f1f1ef] text-notion-text text-xs rounded">
                        {tag}
                    </span>
                ))}
            </div>
        )
    }

    if (col.type === 'date') {
        if (isEditing) {
            return (
                <input
                    autoFocus
                    type="date"
                    defaultValue={value}
                    className="text-xs border border-[#2eaadc] rounded px-1 py-0.5"
                    onBlur={e => onSave(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Escape') onCancel() }}
                />
            )
        }
        return <span className="text-xs text-notion-muted">{value ? format(new Date(value), 'MMM d') : '—'}</span>
    }

    // Default: text
    if (isEditing) {
        return (
            <input
                autoFocus
                type="text"
                defaultValue={value}
                className="w-full text-sm border border-[#2eaadc] rounded px-1 py-0.5 focus:outline-none"
                onBlur={e => onSave(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onSave(e.target.value); if (e.key === 'Escape') onCancel() }}
            />
        )
    }

    return (
        <span className={`text-sm ${col.key === 'title' ? 'font-medium text-notion-text' : 'text-notion-muted'}`}>
            {value || <span className="text-[#d3d1cb]">Empty</span>}
        </span>
    )
}
