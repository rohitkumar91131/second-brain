'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { format, parseISO } from 'date-fns'
import { Calendar, FileText, CheckSquare, ChevronLeft, ChevronRight, Plus, Save, Trash2, LoaderIcon } from 'lucide-react'
import Link from 'next/link'
import QuickAddModal from '@/components/ui/QuickAddModal'
import BlockEditor from '@/components/editor/BlockEditor'
import Loader from '@/components/ui/Loader'

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.id
    const { projects, tasks, notes, addTask, updateTask, deleteTask, loading, updateNote, deleteNote, fetchEndpoint } = useApp()

    const [selectedDate, setSelectedDate] = useState(new Date())
    const [project, setProject] = useState(null)
    const [projectsLoaded, setProjectsLoaded] = useState(false)
    const [showAddTask, setShowAddTask] = useState(false)
    const [showAddNote, setShowAddNote] = useState(false)
    const [filter, setFilter] = useState('all')
    const [selectedNote, setSelectedNote] = useState(null)
    const [noteTitle, setNoteTitle] = useState('')
    const [noteBlocks, setNoteBlocks] = useState([])
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)
    const [notFoundDelay, setNotFoundDelay] = useState(false)

    // Ensure projects, tasks and notes are loaded when opening a project detail
    useEffect(() => {
        if (!projects || projects.length === 0) {
            fetchEndpoint('projects').then(() => setProjectsLoaded(true))
        } else {
            setProjectsLoaded(true)
        }
        if (!tasks || tasks.length === 0) fetchEndpoint('tasks')
        if (!notes || notes.length === 0) fetchEndpoint('notes')
    }, [projects, tasks, notes, fetchEndpoint])

    // Find the project
    useEffect(() => {
        if (projectsLoaded) {
            const foundProject = projects.find(p => p.id === projectId)
            setProject(foundProject)
            if (foundProject) setNotFoundDelay(false)
            else {
                const timer = setTimeout(() => setNotFoundDelay(true), 400)
                return () => clearTimeout(timer)
            }
        }
    }, [projects, projectId, projectsLoaded])

    // Filter tasks for this project
    const projectTasks = tasks.filter(t => t.projectId === projectId)

    // Filter tasks for selected date
    const tasksForDate = projectTasks.filter(task => {
        if (!task.dueDate) return false
        const taskDate = format(parseISO(task.dueDate), 'yyyy-MM-dd')
        const selDate = format(selectedDate, 'yyyy-MM-dd')
        return taskDate === selDate
    })

    // Filter notes for this project
    const projectNotes = notes.filter(n => n.projectId === projectId)

    // Filter notes for selected date (for editor)
    const notesForDate = projectNotes.filter(note => {
        if (!note.createdAt) return false
        const noteDate = format(parseISO(note.createdAt), 'yyyy-MM-dd')
        const selDate = format(selectedDate, 'yyyy-MM-dd')
        return noteDate === selDate
    })

    // Apply combined filter: 'all' | 'active' | 'completed' | <status>
    const filteredTasks = tasksForDate.filter(t => {
        if (filter === 'active' && t.completed) return false
        if (filter === 'completed' && !t.completed) return false
        // If filter matches a status string, show only tasks with that status
        const statuses = ['Not Started', 'In Progress', 'Done', 'Blocked', 'On Hold']
        if (statuses.includes(filter) && t.status !== filter) return false
        return true
    })

    const filterLabel = (() => {
        if (filter === 'all') return 'tasks'
        if (filter === 'active') return 'active tasks'
        if (filter === 'completed') return 'completed tasks'
        return `${filter} tasks`
    })()

    const handlePrevDay = () => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() - 1)
        setSelectedDate(newDate)
    }

    const handleNextDay = () => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + 1)
        setSelectedDate(newDate)
    }

    const handleToday = () => {
        setSelectedDate(new Date())
    }

    const handleTaskToggle = async (taskId, completed) => {
        try {
            const updated = await updateTask(taskId, {
                completed: !completed,
                status: !completed ? 'Done' : 'Not Started'
            })

            // If task became completed, ensure user can see it by switching to the completed filter
            if (updated && updated.completed) {
                setFilter('completed')
            }
        } catch (e) {
            console.error('Failed to update task', e)
        }
    }

    const handleSelectNote = (note) => {
        setSelectedNote(note)
        setNoteTitle(note.title)
        setNoteBlocks(note.content || [{ id: 'b1', type: 'paragraph', content: '' }])
        setLastSaved(note.updatedAt)
    }

    const handleSaveNote = async () => {
        if (!selectedNote) return
        setIsSaving(true)
        await updateNote(selectedNote.id, { title: noteTitle, content: noteBlocks })
        setLastSaved(new Date())
        setIsSaving(false)
    }

    const handleDeleteNote = async () => {
        if (!selectedNote) return
        await deleteNote(selectedNote.id)
        setSelectedNote(null)
    }

    const handleCloseNote = () => {
        setSelectedNote(null)
    }

    const handleNoteCreatedInModal = (note) => {
        setShowAddNote(false)
        handleSelectNote(note)
    }

    const completedTasks = tasksForDate.filter(t => t.completed).length
    const totalTasks = tasksForDate.length

    if (loading || !projectsLoaded) {
        return (
            <div className="flex items-center justify-center h-full w-full relative overflow-hidden bg-white/50 backdrop-blur-sm z-50">
                <Loader />
            </div>
        )
    }

    if (!project && notFoundDelay) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-[#9b9a97] mb-4">Project not found</div>
                <Link href="/dashboard/projects" className="text-blue-600 hover:text-blue-700 text-sm">
                    Back to Projects
                </Link>
            </div>
        )
    }

    if (!project && !notFoundDelay) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loader />
            </div>
        )
    }

    // If a note is selected, show the note editor
    if (selectedNote) {
        return (
            <div className="flex flex-col h-full bg-white">
                <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e9e9e7] bg-white/80 backdrop-blur-md z-10">
                    <button
                        onClick={handleCloseNote}
                        className="p-1.5 rounded-lg hover:bg-[#efefef] text-[#9b9a97] hover:text-[#37352f] transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex-1 flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#9b9a97] uppercase tracking-wider">Notes</span>
                        <span className="text-xs text-[#d3d1cb]">/</span>
                        <input
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            className="text-sm font-bold text-[#37352f] bg-transparent focus:outline-none flex-1 truncate"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-[#2eaadc]'}`} />
                            <span className="text-[10px] font-bold text-[#9b9a97] uppercase tracking-tighter">
                                {isSaving
                                    ? 'Saving...'
                                    : lastSaved
                                        ? `Saved ${format(new Date(lastSaved), 'h:mm a')}`
                                        : 'Not saved'}
                            </span>
                        </div>

                        <button
                            onClick={handleSaveNote}
                            disabled={isSaving}
                            className="p-1.5 rounded-lg hover:bg-[#efefef] text-[#9b9a97] hover:text-[#37352f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={15} />
                        </button>

                        <button
                            onClick={handleDeleteNote}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#9b9a97] hover:text-red-500 transition-all"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto py-12 px-6 bg-[#fcfcfc]">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-10">
                            <input
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                placeholder="Untitled Note"
                                className="w-full text-5xl font-extrabold text-[#37352f] bg-transparent focus:outline-none placeholder-[#d3d1cb] tracking-tight leading-tight"
                            />

                            <div className="flex flex-wrap items-center gap-2 mt-6">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f1f1ef] text-[#787774] text-xs font-bold rounded-lg border border-[#e9e9e7]/50 uppercase tracking-wider">
                                    <FileText size={12} />
                                    Note
                                </div>
                            </div>
                        </div>

                        <BlockEditor blocks={noteBlocks} setBlocks={setNoteBlocks} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e9e9e7]">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/projects"
                        className="p-1.5 hover:bg-[#f0f0ee] rounded-md transition-colors"
                    >
                        <ChevronLeft size={20} className="text-[#37352f]" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#37352f]">{project.title}</h1>
                        <p className="text-xs text-[#9b9a97] mt-1">{project.description}</p>
                    </div>
                </div>

                {/* Date Selector - Top Right */}
                <div className="flex items-center gap-2 bg-[#f7f7f5] p-2 rounded-lg">
                    <button
                        onClick={handlePrevDay}
                        className="p-1.5 hover:bg-[#e9e9e7] rounded transition-colors"
                        title="Previous day"
                    >
                        <ChevronLeft size={16} className="text-[#37352f]" />
                    </button>

                    <div className="flex items-center gap-2 px-2 min-w-[180px] justify-center">
                        <Calendar size={14} className="text-[#9b9a97]" />
                        <span className="text-sm font-medium text-[#37352f] min-w-fit">
                            {format(selectedDate, 'MMM d, yyyy')}
                        </span>
                    </div>

                    <button
                        onClick={handleNextDay}
                        className="p-1.5 hover:bg-[#e9e9e7] rounded transition-colors"
                        title="Next day"
                    >
                        <ChevronRight size={16} className="text-[#37352f]" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                    {/* Notes Section */}
                    <div className="bg-[#f7f7f5] rounded-xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FileText size={18} className="text-green-600" />
                                <h2 className="text-lg font-bold text-[#37352f]">
                                    All Notes ({projectNotes.length})
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowAddNote(true)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#37352f] text-white rounded hover:bg-[#2f2d28] transition-colors"
                            >
                                <Plus size={13} />
                                Add Note
                            </button>
                        </div>

                        {projectNotes.length === 0 ? (
                            <div className="py-8 text-center flex-1 flex items-center justify-center">
                                <p className="text-sm text-[#9b9a97] italic">
                                    No notes for this project
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 flex-1 overflow-auto">
                                {projectNotes.map(note => (
                                    <Link
                                        key={note.id}
                                        href={`/dashboard/notes/${note.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-4 bg-white rounded-lg hover:bg-[#efefef] transition-colors border border-[#e9e9e7] hover:border-[#d0ccc7] group"
                                    >
                                        <h3 className="font-semibold text-[#37352f] text-sm group-hover:text-blue-600 transition-colors">
                                            {note.title}
                                        </h3>
                                        <p className="text-xs text-[#9b9a97] mt-1">
                                            {note.createdAt ? format(parseISO(note.createdAt), 'MMM d, yyyy') : 'No date'}
                                        </p>
                                        {note.tags && note.tags.length > 0 && (
                                            <div className="flex gap-1 mt-2">
                                                {note.tags.slice(0, 3).map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs px-2 py-1 bg-[#f0f0ee] text-[#9b9a97] rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {note.tags.length > 3 && (
                                                    <span className="text-xs px-2 py-1 text-[#9b9a97]">
                                                        +{note.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tasks Section */}
                    <div className="bg-[#f7f7f5] rounded-xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <CheckSquare size={18} className="text-blue-600" />
                                <h2 className="text-lg font-bold text-[#37352f]">
                                    Tasks ({completedTasks}/{totalTasks})
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowAddTask(true)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#37352f] text-white rounded hover:bg-[#2f2d28] transition-colors"
                            >
                                <Plus size={13} />
                                Add Task
                            </button>
                        </div>

                        {/* Combined filter: show All/Active/Completed or specific status */}
                        <div className="flex gap-1 mb-4">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-3 py-1 text-sm border border-[#e9e9e7] rounded-md bg-white text-[#37352f]"
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

                        {tasksForDate.length === 0 ? (
                            <div className="py-8 text-center flex-1 flex items-center justify-center">
                                <p className="text-sm text-[#9b9a97] italic">
                                    No tasks scheduled for this date
                                </p>
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="py-8 text-center flex-1 flex items-center justify-center">
                                <p className="text-sm text-[#9b9a97] italic">
                                    No {filterLabel}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 flex-1 overflow-auto">
                                {filteredTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#e9e9e7] hover:bg-[#efefef] transition-colors group"
                                    >
                                        <button
                                            onClick={() => handleTaskToggle(task.id, task.completed)}
                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed
                                                ? 'bg-green-500 border-green-500'
                                                : 'border-[#d3d1cb] group-hover:border-[#37352f]'
                                                }`}
                                        >
                                            {task.completed && (
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={3}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm font-medium truncate ${task.completed
                                                    ? 'line-through text-[#9b9a97]'
                                                    : 'text-[#37352f]'
                                                    }`}
                                            >
                                                {task.title}
                                            </p>
                                            {task.priority && (
                                                <span
                                                    className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded ${task.priority === 'High'
                                                        ? 'bg-red-100 text-red-700'
                                                        : task.priority === 'Medium'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-green-100 text-green-700'
                                                        }`}
                                                >
                                                    {task.priority}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Project Stats */}
                <div className="px-6 pb-6">
                    <div className="bg-gradient-to-br from-[#f7f7f5] to-[#f0f0ee] rounded-xl p-6 border border-[#e9e9e7]">
                        <h3 className="font-bold text-[#37352f] mb-4">Project Overview</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4">
                                <p className="text-[#9b9a97] text-xs font-medium uppercase tracking-wide mb-2">
                                    Status
                                </p>
                                <p className="text-lg font-bold text-[#37352f]">{project.status}</p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <p className="text-[#9b9a97] text-xs font-medium uppercase tracking-wide mb-2">
                                    Progress
                                </p>
                                <p className="text-lg font-bold text-[#37352f]">{project.progress}%</p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <p className="text-[#9b9a97] text-xs font-medium uppercase tracking-wide mb-2">
                                    Due Date
                                </p>
                                <p className="text-lg font-bold text-[#37352f]">
                                    {project.dueDate
                                        ? format(parseISO(project.dueDate), 'MMM d')
                                        : 'No date'}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <p className="text-[#9b9a97] text-xs font-medium uppercase tracking-wide mb-2">
                                    Tags
                                </p>
                                <p className="text-lg font-bold text-[#37352f]">{project.tags?.length || 0}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-[#37352f]">Progress</span>
                                <span className="text-sm font-bold text-[#9b9a97]">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-[#e9e9e7] rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        {project.tags && project.tags.length > 0 && (
                            <div className="mt-6">
                                <p className="text-sm font-medium text-[#37352f] mb-2">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="text-xs px-3 py-1.5 bg-[#e9e9e7] text-[#37352f] rounded-full font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Task Modal */}
            {showAddTask && (
                <QuickAddModal
                    defaultType="task"
                    onClose={() => setShowAddTask(false)}
                    prefilledData={{
                        projectId,
                        projectName: project?.title,
                        date: selectedDate
                    }}
                />
            )}

            {/* Add Note Modal */}
            {showAddNote && (
                <QuickAddModal
                    defaultType="note"
                    onClose={() => setShowAddNote(false)}
                    prefilledData={{
                        projectId,
                        projectName: project?.title,
                        date: selectedDate
                    }}
                    onNoteCreated={handleNoteCreatedInModal}
                />
            )}
        </div>
    )
}
