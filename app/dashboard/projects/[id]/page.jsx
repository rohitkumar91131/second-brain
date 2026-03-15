'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { format, parseISO } from 'date-fns'
import { Calendar, FileText, CheckSquare, ChevronLeft, ChevronRight, Plus, Save, Trash2, LoaderIcon, FolderOpen, Check } from 'lucide-react'
import Link from 'next/link'
import QuickAddModal from '@/components/ui/QuickAddModal'
import BlockEditor from '@/components/editor/BlockEditor'
import Loader from '@/components/ui/Loader'
import ProjectContextMenu from '@/components/ui/ProjectContextMenu'
import NoteContextMenu from '@/components/ui/NoteContextMenu'
import { Pin } from 'lucide-react'

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.id
    const { projects, tasks, notes, addTask, updateTask, deleteTask, loading, updateNote, deleteNote, fetchEndpoint, updateProject, deleteProject } = useApp()

    const [selectedDate, setSelectedDate] = useState(new Date())
    const [project, setProject] = useState(null)
    const [projectsLoaded, setProjectsLoaded] = useState(false)
    const [showAddTask, setShowAddTask] = useState(false)
    const [showAddNote, setShowAddNote] = useState(false)
    const [showAddSubproject, setShowAddSubproject] = useState(false)
    const [filter, setFilter] = useState('all')
    const [selectedNote, setSelectedNote] = useState(null)
    const [noteTitle, setNoteTitle] = useState('')
    const [noteBlocks, setNoteBlocks] = useState([])
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)
    const [notFoundDelay, setNotFoundDelay] = useState(false)

    // Context Menu State
    const [contextMenu, setContextMenu] = useState(null) // { x, y, project, isMobile }
    const [noteContextMenu, setNoteContextMenu] = useState(null) // { x, y, note, isMobile }
    const longPressTimer = useRef(null)
    const noteLongPressTimer = useRef(null)

    // Ensure projects, tasks and notes are loaded only once
    const { isFetched } = useApp()

    useEffect(() => {
        let mounted = true

        const loadData = async () => {
            try {
                const fetchRequirements = []
                if (!isFetched('projects')) fetchRequirements.push(fetchEndpoint('projects'))
                if (!isFetched('tasks')) fetchRequirements.push(fetchEndpoint('tasks'))
                if (!isFetched('notes')) fetchRequirements.push(fetchEndpoint('notes'))

                if (fetchRequirements.length > 0) {
                    await Promise.all(fetchRequirements)
                }

                if (mounted) {
                    setProjectsLoaded(true)
                }
            } catch (err) {
                console.error('Initial load failed', err)
            }
        }

        loadData()

        return () => {
            mounted = false
        }
    }, [fetchEndpoint, isFetched]) // Removed projects, tasks, notes from dependencies



    // Find the project (runs when projects actually update)
    useEffect(() => {
        if (!projectsLoaded) return

        const foundProject = projects.find(p => p.id === projectId)
        setProject(foundProject)

        if (foundProject) {
            setNotFoundDelay(false)
        } else {
            const timer = setTimeout(() => setNotFoundDelay(true), 400)
            return () => clearTimeout(timer)
        }
    }, [projects, projectId, projectsLoaded])

    // Context Menu Handlers
    const handleContextMenu = (e, targetProject) => {
        e.preventDefault()
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            project: targetProject,
            isMobile: false
        })
    }

    const handleTouchStart = (e, targetProject) => {
        const touch = e.touches[0]
        const x = touch.clientX
        const y = touch.clientY
        longPressTimer.current = setTimeout(() => {
            setContextMenu({
                x,
                y,
                project: targetProject,
                isMobile: true
            })
        }, 500) // 500ms for long press
    }

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
        }
    }

    // Note Context Menu Handlers
    const handleNoteContextMenu = (e, targetNote) => {
        e.preventDefault()
        setNoteContextMenu({
            x: e.clientX,
            y: e.clientY,
            note: targetNote,
            isMobile: false
        })
    }

    const handleNoteTouchStart = (e, targetNote) => {
        const touch = e.touches[0]
        const x = touch.clientX
        const y = touch.clientY
        noteLongPressTimer.current = setTimeout(() => {
            setNoteContextMenu({
                x,
                y,
                note: targetNote,
                isMobile: true
            })
        }, 500)
    }

    const handleNoteTouchEnd = () => {
        if (noteLongPressTimer.current) {
            clearTimeout(noteLongPressTimer.current)
        }
    }

    const handlePinNote = async (note) => {
        await updateNote(note.id, { isPinned: !note.isPinned })
    }

    const handleCopyNoteContent = async (note) => {
        try {
            const blocks = note.content || []
            const textContent = blocks
                .map(b => b.content)
                .filter(c => c && typeof c === 'string')
                .join('\n\n')

            if (textContent) {
                await navigator.clipboard.writeText(textContent)
                alert('Note content copied to clipboard!')
            } else {
                alert('Note is empty.')
            }
        } catch (err) {
            console.error('Failed to copy', err)
        }
    }

    const handleMakePdf = (note) => {
        window.open(`/api/notes/${note.id}/pdf`, '_blank')
    }

    const handleShareNote = async (note) => {
        try {
            const res = await fetch(`/api/notes/${note.id}/share`, { method: 'POST' })
            const data = await res.json()
            if (data.id) {
                const shareUrl = `${window.location.origin}/share/${data.id}`
                await navigator.clipboard.writeText(shareUrl)
                alert('Share link copied to clipboard!')
            }
        } catch (err) {
            console.error('Failed to share', err)
        }
    }

    const handleOpenNewWindow = (note) => {
        window.open(`/dashboard/notes/${note.id}`, '_blank')
    }

    const handleRemoveSubproject = async (subprojectId) => {
        if (confirm('Remove this subproject from the current project?')) {
            await updateProject(subprojectId, { parentProjectId: null })
        }
    }

    const handleDeleteSubproject = async (subprojectId) => {
        if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
            await deleteProject(subprojectId)
        }
    }

    const handleEditSubproject = (subProject) => {
        // We'll use a simple prompt for title for now to keep it straightforward
        // In a real app, we'd open an Edit Modal
        const newTitle = prompt('Enter new project title:', subProject.title)
        if (newTitle && newTitle.trim() !== subProject.title) {
            updateProject(subProject.id, { title: newTitle.trim() })
        }
    }

    // Filter tasks for this project
    const projectTasks = tasks.filter(t => t.projectId === projectId)
    // ... rest of the logic remains the same ...
    // Filter tasks for selected date
    const tasksForDate = projectTasks.filter(task => {
        if (!task.dueDate) return false
        const taskDate = format(parseISO(task.dueDate), 'yyyy-MM-dd')
        const selDate = format(selectedDate, 'yyyy-MM-dd')
        return taskDate === selDate
    })

    // Filter notes for this project
    const projectNotes = notes.filter(n => n.projectIds?.includes(projectId))

    // Sort notes: pinned first, then by date
    const sortedNotes = [...projectNotes].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    })

    // Filter subprojects
    const subprojects = projects.filter(p => p.parentProjectId === projectId)

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
            <div className="flex items-center justify-center h-full w-full bg-[#0F172A]">
                <Loader />
            </div>
        )
    }

    if (!project && notFoundDelay) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-[#0F172A] text-slate-400">
                <FolderOpen size={48} className="text-slate-700 mb-6" />
                <div className="text-xl font-bold mb-2">Project not found</div>
                <Link href="/dashboard/projects" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold hover:underline">
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
            <div className="flex flex-col h-full bg-[#0F172A]">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-[#1E293B]/80 backdrop-blur-md z-10">
                    <button
                        onClick={handleCloseNote}
                        className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex-1 flex items-center gap-3 min-w-0">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden sm:inline">Project Note</span>
                        <span className="text-slate-700 hidden sm:inline">/</span>
                        <input
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            className="text-base font-bold text-white bg-transparent focus:outline-none flex-1 truncate placeholder-slate-600"
                            placeholder="Note Title"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-500 animate-pulse' : 'bg-green-500 shadow-lg shadow-green-500/20'}`} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:inline">
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
                            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-50"
                        >
                            <Save size={18} />
                        </button>

                        <button
                            onClick={handleDeleteNote}
                            className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto py-12 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-12">
                            <input
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                placeholder="Untitled Note"
                                className="w-full text-5xl font-black text-white bg-transparent focus:outline-none placeholder-slate-700 tracking-tight leading-tight mb-6"
                            />

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-slate-400 text-[10px] font-bold rounded-xl border border-white/5 uppercase tracking-widest">
                                    <FileText size={14} className="text-indigo-400" />
                                    Internal Document
                                </div>
                            </div>
                        </div>

                        <div className="glass-dark p-8 border-white/5 min-h-[60vh]">
                            <BlockEditor blocks={noteBlocks} onChange={setNoteBlocks} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-[#0F172A]">
            {/* Context Menu Overlay */}
            {contextMenu && (
                <ProjectContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    isMobile={contextMenu.isMobile}
                    onClose={() => setContextMenu(null)}
                    onEdit={() => handleEditSubproject(contextMenu.project)}
                    onDelete={() => handleDeleteSubproject(contextMenu.project.id)}
                    onRemoveFromParent={() => handleRemoveSubproject(contextMenu.project.id)}
                />
            )}

            {/* Note Context Menu Overlay */}
            {noteContextMenu && (
                <NoteContextMenu
                    x={noteContextMenu.x}
                    y={noteContextMenu.y}
                    isMobile={noteContextMenu.isMobile}
                    isPinned={noteContextMenu.note.isPinned}
                    onClose={() => setNoteContextMenu(null)}
                    onPin={() => handlePinNote(noteContextMenu.note)}
                    onCopy={() => handleCopyNoteContent(noteContextMenu.note)}
                    onPdf={() => handleMakePdf(noteContextMenu.note)}
                    onShare={() => handleShareNote(noteContextMenu.note)}
                    onOpenNew={() => handleOpenNewWindow(noteContextMenu.note)}
                    onDelete={async () => {
                        if (confirm('Are you sure you want to delete this note?')) {
                            await deleteNote(noteContextMenu.note.id)
                        }
                    }}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 md:px-8 py-6 md:py-6 border-b border-white/5 bg-[#1E293B]/30 backdrop-blur-md gap-6">
                <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                    <button
                        onClick={() => router.back()}
                        className="p-2 md:p-2.5 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white shrink-0"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">{project.title}</h1>
                            <div className={`px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest shrink-0 ${project.status === 'Done' ? 'bg-green-500/10 text-green-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                {project.status}
                            </div>
                        </div>
                        <p className="text-[10px] md:text-xs font-medium text-slate-500 mt-1 md:mt-1.5 truncate">{project.description}</p>
                    </div>
                </div>

                {/* Date Selector */}
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5 w-full md:w-auto overflow-hidden">
                    <button
                        onClick={handlePrevDay}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
                        title="Previous day"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-3 px-3 md:px-4 flex-1 md:min-w-[200px] justify-center">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400" />
                        <span className="text-[10px] md:text-sm font-black text-white uppercase tracking-widest">
                            {format(selectedDate, 'MMM d, yyyy')}
                        </span>
                    </div>

                    <button
                        onClick={handleNextDay}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
                        title="Next day"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 p-4 md:p-8 max-w-[1600px] mx-auto">
                    {/* Subprojects Section */}
                    <div className="glass-dark rounded-[2rem] p-6 md:p-8 flex flex-col lg:col-span-2 border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-400">
                                    <FolderOpen size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Subprojects</h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{subprojects.length} child modules</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddSubproject(true)}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#1E293B] text-white rounded-xl hover:bg-[#2D3748] transition-all border border-white/5 shadow-xl"
                            >
                                <Plus size={14} /> NEW MODULE
                            </button>
                        </div>

                        {subprojects.length === 0 ? (
                            <div className="py-12 text-center relative z-10">
                                <p className="text-sm text-slate-500 font-medium">No subprojects defined for this module</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                {subprojects.map(p => (
                                    <div
                                        key={p.id}
                                        className="relative block p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 group/card cursor-pointer"
                                        onContextMenu={(e) => handleContextMenu(e, p)}
                                        onTouchStart={(e) => handleTouchStart(e, p)}
                                        onTouchEnd={handleTouchEnd}
                                        onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                                    >
                                        <h3 className="font-bold text-base text-white group-hover/card:text-indigo-400 transition-colors truncate">{p.title}</h3>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.status}</span>
                                            <span className="text-xs font-black text-white">{p.progress}%</span>
                                        </div>
                                        <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                            <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${p.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes Section */}
                    <div className="glass-dark rounded-[2rem] p-6 md:p-8 flex flex-col border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-green-500/10 rounded-2xl text-green-400">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Technical Notes</h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{projectNotes.length} documents</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddNote(true)}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#1E293B] text-white rounded-xl hover:bg-[#2D3748] transition-all border border-white/5 shadow-xl"
                            >
                                <Plus size={14} /> ADD NOTE
                            </button>
                        </div>

                        {projectNotes.length === 0 ? (
                            <div className="py-20 text-center flex-1 flex items-center justify-center relative z-10">
                                <p className="text-sm text-slate-500 font-medium">No documentation found</p>
                            </div>
                        ) : (
                            <div className="space-y-4 flex-1 overflow-auto pr-2 relative z-10 custom-scrollbar">
                                {sortedNotes.map(note => (
                                    <div
                                        key={note.id}
                                        className="relative block p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 group/note cursor-pointer"
                                        onContextMenu={(e) => handleNoteContextMenu(e, note)}
                                        onTouchStart={(e) => handleNoteTouchStart(e, note)}
                                        onTouchEnd={handleNoteTouchEnd}
                                        onClick={() => handleSelectNote(note)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-bold text-white text-sm group-hover/note:text-green-400 transition-colors flex-1 min-w-0 truncate pr-2">
                                                {note.title}
                                            </h3>
                                            {note.isPinned && (
                                                <Pin size={12} className="text-green-400 shrink-0 mt-1" />
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                {note.createdAt ? format(parseISO(note.createdAt), 'MMM d, yyyy') : 'NO DATE'}
                                            </p>
                                            <div className="flex gap-1">
                                                {note.tags?.slice(0, 2).map(tag => (
                                                    <span key={tag} className="text-[9px] px-2 py-0.5 bg-white/5 text-slate-400 rounded-lg border border-white/5 font-bold uppercase tracking-widest">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tasks Section */}
                    <div className="glass-dark rounded-[2rem] p-6 md:p-8 flex flex-col border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-400">
                                    <CheckSquare size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Active Tasks</h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{completedTasks}/{totalTasks} COMPLETED</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddTask(true)}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#1E293B] text-white rounded-xl hover:bg-[#2D3748] transition-all border border-white/5 shadow-xl"
                            >
                                <Plus size={14} /> NEW TASK
                            </button>
                        </div>

                        <div className="flex gap-2 mb-6 relative z-10">
                            {['all', 'active', 'completed'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${filter === f ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {tasksForDate.length === 0 ? (
                            <div className="py-20 text-center flex-1 flex items-center justify-center relative z-10">
                                <p className="text-sm text-slate-500 font-medium">No tasks for this schedule</p>
                            </div>
                        ) : (
                            <div className="space-y-3 flex-1 overflow-auto pr-2 relative z-10 custom-scrollbar">
                                {filteredTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/task"
                                    >
                                        <button
                                            onClick={() => handleTaskToggle(task.id, task.completed)}
                                            className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed
                                                ? 'bg-green-500 border-green-500'
                                                : 'border-white/10 group-hover/task:border-indigo-500'
                                                }`}
                                        >
                                            {task.completed && <Check size={14} className="text-white" strokeWidth={4} />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate transition-all ${task.completed ? 'line-through text-slate-600' : 'text-slate-200'}`}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg border ${task.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-500' : task.priority === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                                                    {task.priority || 'NORMAL'}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{task.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Project Stats */}
                    <div className="lg:col-span-2 pt-4">
                        <div className="glass-dark rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                            <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center relative z-10">
                                {/* Progress Circular Chart */}
                                <div className="shrink-0 relative w-28 h-28 md:w-32 md:h-32 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                        <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * project.progress) / 100} className="text-indigo-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl md:text-2xl font-black text-white">{project.progress}%</span>
                                        <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">PROGRESS</span>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Current Status</p>
                                        <p className="text-xl font-black text-white truncate">{project.status}</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Target Date</p>
                                        <p className="text-xl font-black text-white truncate">
                                            {project.dueDate ? format(parseISO(project.dueDate), 'MMM d, yyyy') : 'NOT SET'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sub-Modules</p>
                                        <p className="text-xl font-black text-white truncate">{subprojects.length} ACTIVE</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Team Space</p>
                                        <p className="text-xl font-black text-white truncate">PRIVATE</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            {project.tags && project.tags.length > 0 && (
                                <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-4 py-1.5 bg-white/5 text-slate-300 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
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

            {showAddSubproject && (
                <QuickAddModal
                    defaultType="project"
                    onClose={() => setShowAddSubproject(false)}
                    prefilledData={{
                        projectId,
                        projectName: project?.title
                    }}
                />
            )}
        </div>
    )
}
