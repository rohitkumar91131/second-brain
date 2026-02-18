'use client'

import { useState } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import StatusTag from '@/components/properties/StatusTag'
import { Plus, GripVertical, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

const COLUMNS = ['Not Started', 'In Progress', 'Done', 'Blocked', 'On Hold']

const COLUMN_COLORS = {
    'Not Started': '#f1f1ef',
    'In Progress': '#dbeafe',
    'Done': '#dcfce7',
    'Blocked': '#fee2e2',
    'On Hold': '#fef3c7',
}

export default function BoardView({ items, onUpdate, onDelete, onAdd, entityType }) {
    const [activeId, setActiveId] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    )

    const getItemsByStatus = (status) => items.filter(i => i.status === status)

    const handleDragStart = ({ active }) => setActiveId(active.id)

    const handleDragEnd = ({ active, over }) => {
        setActiveId(null)
        if (!over) return
        const overItem = items.find(i => i.id === over.id)
        const overColumn = COLUMNS.find(col => col === over.id)
        const newStatus = overColumn || overItem?.status
        if (newStatus && active.id !== over.id) {
            onUpdate(active.id, { status: newStatus })
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
            <div className="flex gap-3 p-4 overflow-x-auto min-h-[400px]">
                {COLUMNS.map(status => {
                    const colItems = getItemsByStatus(status)
                    return (
                        <KanbanColumn
                            key={status}
                            status={status}
                            items={colItems}
                            color={COLUMN_COLORS[status]}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onAdd={() => onAdd(status)}
                            entityType={entityType}
                        />
                    )
                })}
            </div>

            <DragOverlay>
                {activeItem && <KanbanCard item={activeItem} isDragging />}
            </DragOverlay>
        </DndContext>
    )
}

function KanbanColumn({ status, items, color, onUpdate, onDelete, onAdd, entityType }) {
    return (
        <div className="flex-shrink-0 w-64">
            {/* Column header */}
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color === '#f1f1ef' ? '#9b9a97' : undefined, background: color !== '#f1f1ef' ? undefined : undefined }}
                    />
                    <StatusTag status={status} />
                    <span className="text-xs text-[#9b9a97]">{items.length}</span>
                </div>
                <button
                    onClick={onAdd}
                    className="p-1 rounded hover:bg-[#efefef] text-[#9b9a97] hover:text-[#37352f] transition-colors"
                >
                    <Plus size={13} />
                </button>
            </div>

            {/* Cards */}
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div
                    className="min-h-[100px] rounded-lg p-2 space-y-2"
                    style={{ backgroundColor: `${color}60` }}
                >
                    {items.map(item => (
                        <KanbanCard
                            key={item.id}
                            item={item}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                        />
                    ))}
                    {items.length === 0 && (
                        <div className="text-center py-6 text-xs text-[#9b9a97]">
                            No {entityType}s
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    )
}

function KanbanCard({ item, onUpdate, onDelete, isDragging }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.4 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white rounded-md p-3 shadow-sm border border-[#e9e9e7] group cursor-default ${isDragging ? 'shadow-lg rotate-1' : ''}`}
        >
            <div className="flex items-start gap-2">
                <button
                    {...attributes}
                    {...listeners}
                    className="mt-0.5 p-0.5 rounded hover:bg-[#efefef] text-[#d3d1cb] hover:text-[#9b9a97] cursor-grab active:cursor-grabbing flex-shrink-0"
                >
                    <GripVertical size={12} />
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#37352f] leading-snug">{item.title}</p>
                    {item.dueDate && (
                        <p className="text-xs text-[#9b9a97] mt-1">
                            {format(new Date(item.dueDate), 'MMM d')}
                        </p>
                    )}
                    {item.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 bg-[#f1f1ef] text-[#787774] text-[10px] rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    {item.progress !== undefined && (
                        <div className="mt-2">
                            <div className="w-full bg-gray-100 rounded-full h-1">
                                <div
                                    className="h-1 rounded-full bg-[#2eaadc]"
                                    style={{ width: `${item.progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onDelete(item.id)}
                    className="hover-reveal p-0.5 rounded hover:bg-red-50 text-red-400 flex-shrink-0"
                >
                    <Trash2 size={11} />
                </button>
            </div>
        </div>
    )
}
