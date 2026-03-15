'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import ViewSwitcher from '@/components/views/ViewSwitcher'
import TableView from '@/components/views/TableView'
import BoardView from '@/components/views/BoardView'
import CalendarView from '@/components/views/CalendarView'
import ListView from '@/components/views/ListView'
import QuickAddModal from '@/components/ui/QuickAddModal'
import { Plus } from 'lucide-react'
import Loader from '@/components/ui/Loader'

const COLUMNS = [
    { key: 'title', label: 'Title', type: 'text', width: 250 },
    { key: 'status', label: 'Status', type: 'status', width: 130 },
    { key: 'progress', label: 'Progress', type: 'progress', width: 150 },
    { key: 'dueDate', label: 'Due Date', type: 'date', width: 100 },
    { key: 'tags', label: 'Tags', type: 'tags', width: 150 },
]

export default function ProjectsPage() {
    const { projects, addProject, updateProject, deleteProject, viewPreferences, fetchEndpoint, isFetched } = useApp()
    const topLevelProjects = projects.filter(p => !p.parentProjectId)
    const [view, setView] = useState(viewPreferences['Projects'] || 'list')
    const [showAdd, setShowAdd] = useState(false)
    const [isLoading, setIsLoading] = useState(!projects || projects.length === 0)

    useEffect(() => {
        if (!isFetched('projects')) {
            fetchEndpoint('projects').then(() => setIsLoading(false))
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
            <div className="flex items-center gap-4 px-6 py-4 glass-dark border-b-0 border-white/5 rounded-3xl mb-6 flex-wrap m-2">
                <ViewSwitcher activeView={view} onViewChange={setView} tabName="Projects" />
                <div className="ml-auto">
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-5 py-2.5 premium-gradient text-white text-sm font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Plus size={16} strokeWidth={3} />
                        New Project
                    </button>
                </div>
            </div>

            <div className="flex gap-6 px-8 mb-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{topLevelProjects.filter(p => p.status === 'Active').length} Active Projects</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white/20" />
                    <span>{topLevelProjects.length} Total Projects</span>
                </div>
            </div>

            <div className="flex-1 overflow-auto px-2">
                {view === 'table' && (
                    <TableView items={topLevelProjects} columns={COLUMNS} onUpdate={updateProject} onDelete={deleteProject} onAdd={() => setShowAdd(true)} entityType="project" />
                )}
                {view === 'board' && (
                    <BoardView items={topLevelProjects} onUpdate={updateProject} onDelete={deleteProject} onAdd={(status) => addProject({ title: 'New Project', status: status || 'Not Started', tags: [], dueDate: '', progress: 0, areaId: null, description: '' })} entityType="project" />
                )}
                {view === 'calendar' && <CalendarView items={topLevelProjects} onUpdate={updateProject} />}
                {view === 'list' && (
                    <ListView items={topLevelProjects} columns={COLUMNS} onUpdate={updateProject} onDelete={deleteProject} onAdd={() => setShowAdd(true)} entityType="project" />
                )}
            </div>

            {showAdd && <QuickAddModal defaultType="project" onClose={() => setShowAdd(false)} />}
        </div>
    )
}
