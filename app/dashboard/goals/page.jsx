'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import ViewSwitcher from '@/components/views/ViewSwitcher'
import TableView from '@/components/views/TableView'
import BoardView from '@/components/views/BoardView'
import CalendarView from '@/components/views/CalendarView'
import ListView from '@/components/views/ListView'
import QuickAddModal from '@/components/ui/QuickAddModal'
import ProgressBar from '@/components/properties/ProgressBar'
import { Plus } from 'lucide-react'

const COLUMNS = [
    { key: 'title', label: 'Title', type: 'text', width: 250 },
    { key: 'status', label: 'Status', type: 'status', width: 130 },
    { key: 'progress', label: 'Progress', type: 'progress', width: 150 },
    { key: 'metric', label: 'Metric', type: 'text', width: 150 },
    { key: 'dueDate', label: 'Due Date', type: 'date', width: 100 },
    { key: 'tags', label: 'Tags', type: 'tags', width: 150 },
]

export default function GoalsPage() {
    const { goals, addGoal, updateGoal, deleteGoal, viewPreferences } = useApp()
    const [view, setView] = useState(viewPreferences['Goals'] || 'list')
    const [showAdd, setShowAdd] = useState(false)

    const avgProgress = goals.length > 0
        ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length)
        : 0

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e9e9e7] flex-wrap">
                <ViewSwitcher activeView={view} onViewChange={setView} tabName="Goals" />
                <div className="ml-auto">
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#37352f] text-white text-xs font-medium rounded-md hover:bg-[#2f2d28] transition-colors"
                    >
                        <Plus size={13} />
                        New Goal
                    </button>
                </div>
            </div>

            {/* Overall progress */}
            <div className="flex items-center gap-4 px-6 py-2 border-b border-[#e9e9e7]">
                <span className="text-xs text-[#9b9a97]">Overall progress</span>
                <div className="flex-1 max-w-xs">
                    <ProgressBar value={avgProgress} color="#f97316" />
                </div>
                <span className="text-xs text-[#9b9a97]">{goals.filter(g => g.status === 'Active').length} active goals</span>
            </div>

            <div className="flex-1 overflow-auto">
                {view === 'table' && (
                    <TableView items={goals} columns={COLUMNS} onUpdate={updateGoal} onDelete={deleteGoal} onAdd={() => setShowAdd(true)} entityType="goal" />
                )}
                {view === 'board' && (
                    <BoardView items={goals} onUpdate={updateGoal} onDelete={deleteGoal} onAdd={(status) => addGoal({ title: 'New Goal', status: status || 'Not Started', tags: [], dueDate: '', progress: 0, areaId: null, metric: '' })} entityType="goal" />
                )}
                {view === 'calendar' && <CalendarView items={goals} onUpdate={updateGoal} />}
                {view === 'list' && (
                    <ListView items={goals} columns={COLUMNS} onUpdate={updateGoal} onDelete={deleteGoal} onAdd={() => setShowAdd(true)} entityType="goal" />
                )}
            </div>

            {showAdd && <QuickAddModal defaultType="goal" onClose={() => setShowAdd(false)} />}
        </div>
    )
}
