'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import ViewSwitcher from '@/components/views/ViewSwitcher'
import TableView from '@/components/views/TableView'
import BoardView from '@/components/views/BoardView'
import CalendarView from '@/components/views/CalendarView'
import ListView from '@/components/views/ListView'
import QuickAddModal from '@/components/ui/QuickAddModal'
import { Plus, Filter } from 'lucide-react'

const COLUMNS = [
    { key: 'title', label: 'Title', type: 'text', width: 250 },
    { key: 'status', label: 'Status', type: 'status', width: 130 },
    { key: 'priority', label: 'Priority', type: 'text', width: 100 },
    { key: 'dueDate', label: 'Due Date', type: 'date', width: 100 },
    { key: 'tags', label: 'Tags', type: 'tags', width: 150 },
    { key: 'completed', label: 'Done', type: 'checkbox', width: 60 },
]

export default function TasksPage() {
    const { tasks, addTask, updateTask, deleteTask, viewPreferences } = useApp()
    const [view, setView] = useState(viewPreferences['Tasks'] || 'list')
    const [showAdd, setShowAdd] = useState(false)
    const [filter, setFilter] = useState('all')

    const filteredTasks = tasks.filter(t => {
        if (filter === 'active') return !t.completed
        if (filter === 'completed') return t.completed
        return true
    })

    const handleAddWithStatus = (status) => {
        addTask({
            title: 'New Task',
            status: status || 'Not Started',
            tags: [],
            dueDate: '',
            completed: false,
            priority: 'Medium',
            projectId: null,
            notes: '',
        })
    }

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e9e9e7] flex-wrap">
                <ViewSwitcher activeView={view} onViewChange={setView} tabName="Tasks" />

                {/* Filter tabs */}
                <div className="flex gap-1 ml-2">
                    {['all', 'active', 'completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-[#37352f] text-white' : 'text-[#9b9a97] hover:text-[#37352f] hover:bg-[#efefef]'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="ml-auto">
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#37352f] text-white text-xs font-medium rounded-md hover:bg-[#2f2d28] transition-colors"
                    >
                        <Plus size={13} />
                        New Task
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 px-6 py-2 border-b border-[#e9e9e7] text-xs text-[#9b9a97]">
                <span>{tasks.filter(t => !t.completed).length} active</span>
                <span>{tasks.filter(t => t.completed).length} completed</span>
                <span>{tasks.length} total</span>
            </div>

            {/* View */}
            <div className="flex-1 overflow-auto">
                {view === 'table' && (
                    <TableView
                        items={filteredTasks}
                        columns={COLUMNS}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                        onAdd={() => setShowAdd(true)}
                        entityType="task"
                    />
                )}
                {view === 'board' && (
                    <BoardView
                        items={filteredTasks}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                        onAdd={handleAddWithStatus}
                        entityType="task"
                    />
                )}
                {view === 'calendar' && (
                    <CalendarView items={filteredTasks} onUpdate={updateTask} />
                )}
                {view === 'list' && (
                    <ListView
                        items={filteredTasks}
                        columns={COLUMNS}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                        onAdd={() => setShowAdd(true)}
                        entityType="task"
                    />
                )}
            </div>

            {showAdd && <QuickAddModal defaultType="task" onClose={() => setShowAdd(false)} />}
        </div>
    )
}
