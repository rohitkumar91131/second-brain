'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import ViewSwitcher from '@/components/views/ViewSwitcher'
import TableView from '@/components/views/TableView'
import BoardView from '@/components/views/BoardView'
import CalendarView from '@/components/views/CalendarView'
import ListView from '@/components/views/ListView'
import QuickAddModal from '@/components/ui/QuickAddModal'
import { Plus } from 'lucide-react'

const COLUMNS = [
    { key: 'title', label: 'Title', type: 'text', width: 250 },
    { key: 'status', label: 'Status', type: 'status', width: 130 },
    { key: 'progress', label: 'Progress', type: 'progress', width: 150 },
    { key: 'dueDate', label: 'Due Date', type: 'date', width: 100 },
    { key: 'tags', label: 'Tags', type: 'tags', width: 150 },
]

export default function ProjectsPage() {
    const { projects, addProject, updateProject, deleteProject, viewPreferences } = useApp()
    const [view, setView] = useState(viewPreferences['Projects'] || 'list')
    const [showAdd, setShowAdd] = useState(false)

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e9e9e7] flex-wrap">
                <ViewSwitcher activeView={view} onViewChange={setView} tabName="Projects" />
                <div className="ml-auto">
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#37352f] text-white text-xs font-medium rounded-md hover:bg-[#2f2d28] transition-colors"
                    >
                        <Plus size={13} />
                        New Project
                    </button>
                </div>
            </div>

            <div className="flex gap-4 px-6 py-2 border-b border-[#e9e9e7] text-xs text-[#9b9a97]">
                <span>{projects.filter(p => p.status === 'Active').length} active</span>
                <span>{projects.length} total</span>
            </div>

            <div className="flex-1 overflow-auto">
                {view === 'table' && (
                    <TableView items={projects} columns={COLUMNS} onUpdate={updateProject} onDelete={deleteProject} onAdd={() => setShowAdd(true)} entityType="project" />
                )}
                {view === 'board' && (
                    <BoardView items={projects} onUpdate={updateProject} onDelete={deleteProject} onAdd={(status) => addProject({ title: 'New Project', status: status || 'Not Started', tags: [], dueDate: '', progress: 0, areaId: null, description: '' })} entityType="project" />
                )}
                {view === 'calendar' && <CalendarView items={projects} onUpdate={updateProject} />}
                {view === 'list' && (
                    <ListView items={projects} columns={COLUMNS} onUpdate={updateProject} onDelete={deleteProject} onAdd={() => setShowAdd(true)} entityType="project" />
                )}
            </div>

            {showAdd && <QuickAddModal defaultType="project" onClose={() => setShowAdd(false)} />}
        </div>
    )
}
