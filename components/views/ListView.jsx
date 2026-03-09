'use client'

import StatusTag from '@/components/properties/StatusTag'
import ProgressBar from '@/components/properties/ProgressBar'
import { Trash2, Plus, Check, GripVertical } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
    DndContext,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function ListView({ items, columns, onUpdate, onDelete, onAdd, entityType }) {
    const router = useRouter()
    const [activeId, setActiveId] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    )

    const handleDragStart = ({ active }) => setActiveId(active.id)

    const handleDragEnd = ({ active, over }) => {
        setActiveId(null)
        if (!over) return

        const dragId = active.id
        const dropId = over.id

        if (dragId === dropId) return

        const overItem = items.find(i => i.id === dropId)

        // If dropping onto another project, make it a subproject
        if (overItem && entityType === 'project') {
            onUpdate(dragId, { parentProjectId: overItem.id })
            return
        }
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

    const activeItem = items.find(i => i.id === activeId)

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="divide-y divide-[#e9e9e7]">
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
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
                </SortableContext>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 w-full px-4 py-3 text-xs text-notion-muted hover:text-notion-text hover:bg-notion-sidebar transition-colors"
                >
                    <Plus size={13} />
                    New {entityType}
                </button>
            </div>

            <DragOverlay>
                {activeItem && (
                    <div className="bg-white shadow-xl border border-notion-border opacity-80 pointer-events-none">
                        <div className="flex items-center gap-3 px-4 py-2.5">
                            <GripVertical size={12} className="text-notion-muted" />
                            <span className="text-sm font-medium text-notion-text">{activeItem.title}</span>
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}

function ListRow({ item, columns, onUpdate, onDelete, entityType, onRowClick }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        backgroundColor: isDragging ? '#fafafa' : undefined,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] group cursor-pointer transition-colors relative"
            onClick={onRowClick}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="hover-reveal p-0.5 rounded hover:bg-notion-hover text-[#d3d1cb] hover:text-notion-muted cursor-grab active:cursor-grabbing flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical size={12} />
            </button>

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
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? 'bg-[#37352f] border-[#37352f]' : 'border-notion-border hover:border-[#37352f]'
                        }`}
                >
                    {item.completed && <Check size={10} className="text-white" />}
                </button>
            )}

            {/* Title */}
            <span className={`flex-1 text-sm font-medium ${item.completed ? 'line-through text-notion-muted' : 'text-notion-text'}`}>
                {item.title}
            </span>

            {/* Properties */}
            <div className="flex items-center gap-3 flex-shrink-0">
                {item.status && <StatusTag status={item.status} />}
                {item.dueDate && (
                    <span className="text-xs text-notion-muted">{format(new Date(item.dueDate), 'MMM d')}</span>
                )}
                {item.progress !== undefined && (
                    <div className="w-24">
                        <ProgressBar value={item.progress} />
                    </div>
                )}
                {item.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-[#f1f1ef] text-notion-muted text-xs rounded hidden sm:inline">
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
