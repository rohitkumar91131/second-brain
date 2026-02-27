'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import ViewSwitcher from '@/components/views/ViewSwitcher'
import TableView from '@/components/views/TableView'
import BoardView from '@/components/views/BoardView'
import CalendarView from '@/components/views/CalendarView'
import ListView from '@/components/views/ListView'
import QuickAddModal from '@/components/ui/QuickAddModal'
import { Plus, Filter } from 'lucide-react'
import Loader from '@/components/ui/Loader'

const COLUMNS = [
    { key: 'title', label: 'Title', type: 'text', width: 250 },
    { key: 'status', label: 'Status', type: 'status', width: 130 },
    { key: 'priority', label: 'Priority', type: 'text', width: 100 },
    { key: 'dueDate', label: 'Due Date', type: 'date', width: 100 },
    { key: 'tags', label: 'Tags', type: 'tags', width: 150 },
    { key: 'completed', label: 'Done', type: 'checkbox', width: 60 },
]

export default function TasksPage() {
    const { tasks, addTask, updateTask, deleteTask, viewPreferences, fetchEndpoint, isFetched } = useApp()
    const [view, setView] = useState(viewPreferences['Tasks'] || 'list')
    const [showAdd, setShowAdd] = useState(false)
    const [filter, setFilter] = useState('all')
    const [isLoading, setIsLoading] = useState(!tasks || tasks.length === 0)

    // Apply combined filter: 'all' | 'active' | 'completed' | <status>
    const filteredTasks = tasks.filter(t => {
        if (filter === 'active' && t.completed) return false
        if (filter === 'completed' && !t.completed) return false
        const statuses = ['Not Started', 'In Progress', 'Done', 'Blocked', 'On Hold']
        if (statuses.includes(filter) && t.status !== filter) return false
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

    useEffect(() => {
        if (!isFetched('tasks')) {
            fetchEndpoint('tasks').then(() => setIsLoading(false))
        } else {
            setIsLoading(false)
        }
    }, [isFetched, fetchEndpoint])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full w-full relative overflow-hidden bg-notion-bg/50 backdrop-blur-sm z-50">
                <Loader />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-notion-border flex-wrap">
                <ViewSwitcher activeView={view} onViewChange={setView} tabName="Tasks" />

                {/* Combined filter dropdown (All / Active / Completed / Status) */}
                <div className="ml-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-1 text-sm border border-notion-border rounded-md bg-notion-bg text-notion-text"
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Blocked">Blocked</option>
                        <option value="On Hold">On Hold</option>
                    </select>
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
            <div className="flex gap-4 px-6 py-2 border-b border-notion-border text-xs text-notion-muted">
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
