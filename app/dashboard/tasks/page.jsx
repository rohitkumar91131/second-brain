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
        <div className="flex flex-col h-full bg-transparent">
            {/* Toolbar */}
            <div className="flex items-center gap-4 px-6 py-4 glass-dark border-b-0 border-white/5 rounded-3xl mb-6 flex-wrap m-2">
                <ViewSwitcher activeView={view} onViewChange={setView} tabName="Tasks" />

                {/* Combined filter dropdown */}
                <div className="ml-2 relative group">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="appearance-none px-4 py-2 pr-10 text-xs font-bold uppercase tracking-wider border border-white/5 rounded-xl bg-white/5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer hover:bg-white/10"
                    >
                        <option value="all">Filter: All</option>
                        <option value="active">Filter: Active</option>
                        <option value="completed">Filter: Completed</option>
                        <option value="Not Started">Status: Not Started</option>
                        <option value="In Progress">Status: In Progress</option>
                        <option value="Done">Status: Done</option>
                        <option value="Blocked">Status: Blocked</option>
                        <option value="On Hold">Status: On Hold</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <Filter size={12} />
                    </div>
                </div>

                <div className="ml-auto">
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-5 py-2.5 premium-gradient text-white text-sm font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Plus size={16} strokeWidth={3} />
                        New Task
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 px-8 mb-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>{tasks.filter(t => !t.completed).length} Tasks Active</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{tasks.filter(t => t.completed).length} Tasks Done</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white/20" />
                    <span>{tasks.length} Total</span>
                </div>
            </div>

            {/* View */}
            <div className="flex-1 overflow-auto px-2">
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
