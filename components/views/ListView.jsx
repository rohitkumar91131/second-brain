'use client'

import StatusTag from '@/components/properties/StatusTag'
import ProgressBar from '@/components/properties/ProgressBar'
import { Trash2, Plus, Check } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function ListView({ items, columns, onUpdate, onDelete, onAdd, entityType }) {
    const router = useRouter()

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
        <div className="divide-y divide-[#e9e9e7]">
            {items.map(item => (
                <ListRow
                    key={item.id}
                    item={item}
                    columns={columns}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    entityType={entityType}
                    onRowClick={() => handleRowClick(item)}
                />
            ))}
            <button
                onClick={onAdd}
                className="flex items-center gap-2 w-full px-4 py-3 text-xs text-[#9b9a97] hover:text-[#37352f] hover:bg-[#f7f7f5] transition-colors"
            >
                <Plus size={13} />
                New {entityType}
            </button>
        </div>
    )
}

function ListRow({ item, columns, onUpdate, onDelete, entityType, onRowClick }) {
    return (
        <div 
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] group cursor-pointer transition-colors"
            onClick={onRowClick}
        >
            {/* Checkbox if applicable */}
            {item.completed !== undefined && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onUpdate(item.id, {
                            completed: !item.completed,
                            status: !item.completed ? 'Done' : 'Not Started',
                        })
                    }}
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? 'bg-[#37352f] border-[#37352f]' : 'border-[#d3d1cb] hover:border-[#37352f]'
                        }`}
                >
                    {item.completed && <Check size={10} className="text-white" />}
                </button>
            )}

            {/* Title */}
            <span className={`flex-1 text-sm font-medium ${item.completed ? 'line-through text-[#9b9a97]' : 'text-[#37352f]'}`}>
                {item.title}
            </span>

            {/* Properties */}
            <div className="flex items-center gap-3 flex-shrink-0">
                {item.status && <StatusTag status={item.status} />}
                {item.dueDate && (
                    <span className="text-xs text-[#9b9a97]">{format(new Date(item.dueDate), 'MMM d')}</span>
                )}
                {item.progress !== undefined && (
                    <div className="w-24">
                        <ProgressBar value={item.progress} />
                    </div>
                )}
                {item.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-[#f1f1ef] text-[#787774] text-xs rounded hidden sm:inline">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Delete */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item.id)
                }}
                className="hover-reveal p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
            >
                <Trash2 size={13} />
            </button>
        </div>
    )
}
