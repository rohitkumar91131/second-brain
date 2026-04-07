'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import StatusTag from '@/components/properties/StatusTag'

export default function CalendarView({ items, onUpdate }) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Pad start with empty days
    const startPad = getDay(monthStart)
    const paddedDays = [...Array(startPad).fill(null), ...days]

    const getItemsForDay = (day) => {
        if (!day) return []
        return items.filter(item => item.dueDate && isSameDay(new Date(item.dueDate), day))
    }

    return (
        <div className="p-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1.5 rounded hover:bg-notion-hover text-notion-muted hover:text-notion-text transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <h3 className="text-sm font-semibold text-notion-text">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1.5 rounded hover:bg-notion-hover text-notion-muted hover:text-notion-text transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-xs font-medium text-notion-muted py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-notion-border border border-notion-border rounded-lg overflow-hidden">
                {paddedDays.map((day, idx) => {
                    const dayItems = getItemsForDay(day)
                    const isCurrentDay = day && isToday(day)
                    return (
                        <div
                            key={idx}
                            className={`calendar-day bg-notion-bg p-1.5 ${!day ? 'bg-notion-sidebar' : ''}`}
                        >
                            {day && (
                                <>
                                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isCurrentDay ? 'bg-[#37352f] text-white' : 'text-notion-text'
                                        }`}>
                                        {format(day, 'd')}
                                    </div>
                                    <div className="space-y-0.5">
                                        {dayItems.slice(0, 3).map(item => (
                                            <div
                                                key={item.id}
                                                className="text-[10px] px-1 py-0.5 rounded truncate"
                                                style={{
                                                    backgroundColor: item.status === 'Done' ? '#dcfce7' : item.status === 'In Progress' ? '#dbeafe' : '#f1f1ef',
                                                    color: item.status === 'Done' ? '#166534' : item.status === 'In Progress' ? '#1d4ed8' : 'var(--notion-muted)',
                                                }}
                                            >
                                                {item.title}
                                            </div>
                                        ))}
                                        {dayItems.length > 3 && (
                                            <div className="text-[10px] text-notion-muted px-1">+{dayItems.length - 3} more</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
