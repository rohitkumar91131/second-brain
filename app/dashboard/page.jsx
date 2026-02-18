'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { format, isToday, isTomorrow, parseISO, isAfter, addDays } from 'date-fns'
import { CheckSquare, FolderOpen, Target, FileText, Plus, Check, ChevronRight, BookMarked } from 'lucide-react'
import Link from 'next/link'
import QuickAddModal from '@/components/ui/QuickAddModal'
import StatusTag from '@/components/properties/StatusTag'
import ProgressBar from '@/components/properties/ProgressBar'

export default function DashboardPage() {
    const { tasks, projects, goals, notes, journal, updateTask, session } = useApp()
    const [showQuickAdd, setShowQuickAdd] = useState(false)
    const [quickAddType, setQuickAddType] = useState('task')

    const now = new Date()
    const todayTasks = tasks.filter(t => !t.completed && t.dueDate && isToday(parseISO(t.dueDate)))
    const upcomingTasks = tasks.filter(t => !t.completed && t.dueDate && isAfter(parseISO(t.dueDate), now) && !isToday(parseISO(t.dueDate))).slice(0, 5)
    const activeProjects = projects.filter(p => p.status === 'Active').slice(0, 4)
    const activeGoals = goals.filter(g => g.status === 'Active').slice(0, 4)
    const recentNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4)

    const openQuickAdd = (type) => { setQuickAddType(type); setShowQuickAdd(true) }

    const hour = now.getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const userName = session?.user?.name?.split(' ')[0] || ''

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="animate-fade-in-up">
                {/* Welcome */}
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-[#37352f] mb-2 tracking-tight">
                        {greeting}{userName ? `, ${userName}` : ''} 👋
                    </h1>
                    <p className="text-[#9b9a97] text-sm font-medium">{format(now, 'EEEE, MMMM d, yyyy')}</p>
                </div>

                {/* Quick Add */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {[
                        { type: 'task', label: 'New Task', icon: CheckSquare, color: 'text-blue-600 bg-blue-50/50 hover:bg-blue-100/80 border-blue-100' },
                        { type: 'note', label: 'New Note', icon: FileText, color: 'text-green-600 bg-green-50/50 hover:bg-green-100/80 border-green-100' },
                        { type: 'project', label: 'New Project', icon: FolderOpen, color: 'text-purple-600 bg-purple-50/50 hover:bg-purple-100/80 border-purple-100' },
                        { type: 'goal', label: 'New Goal', icon: Target, color: 'text-orange-600 bg-orange-50/50 hover:bg-orange-100/80 border-orange-100' },
                    ].map(({ type, label, icon: Icon, color }) => (
                        <button
                            key={type}
                            onClick={() => openQuickAdd(type)}
                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 border ${color} shadow-sm`}
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Today's Tasks */}
                    <Widget
                        title="Today's Tasks"
                        icon={<CheckSquare size={16} className="text-blue-600" />}
                        href="/dashboard/tasks"
                        count={todayTasks.length}
                        delay="0"
                    >
                        {todayTasks.length === 0 ? <EmptyWidget text="No tasks due today 🎉" /> : (
                            <div className="space-y-2">
                                {todayTasks.map(task => (
                                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f7f7f5] transition-colors group">
                                        <button onClick={() => updateTask(task.id, { completed: true, status: 'Done' })}
                                            className="w-5 h-5 rounded-md border border-[#d3d1cb] hover:border-[#37352f] flex items-center justify-center flex-shrink-0 transition-all hover:bg-white shadow-sm">
                                            {task.completed && <Check size={12} className="text-[#37352f]" />}
                                        </button>
                                        <span className="text-sm text-[#37352f] flex-1 truncate font-medium">{task.title}</span>
                                        <StatusTag status={task.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Widget>

                    {/* Upcoming Tasks */}
                    <Widget
                        title="Upcoming"
                        icon={<CheckSquare size={16} className="text-purple-600" />}
                        href="/dashboard/tasks"
                        count={upcomingTasks.length}
                        delay="100ms"
                    >
                        {upcomingTasks.length === 0 ? <EmptyWidget text="No upcoming tasks" /> : (
                            <div className="space-y-2">
                                {upcomingTasks.map(task => (
                                    <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#f7f7f5] transition-colors">
                                        <span className="text-sm text-[#37352f] flex-1 truncate font-medium">{task.title}</span>
                                        <span className="text-xs font-semibold px-2 py-1 bg-[#f1f1ef] text-[#9b9a97] rounded-md flex-shrink-0">
                                            {isTomorrow(parseISO(task.dueDate)) ? 'Tomorrow' : format(parseISO(task.dueDate), 'MMM d')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Widget>

                    {/* Active Projects */}
                    <Widget
                        title="Active Projects"
                        icon={<FolderOpen size={16} className="text-purple-600" />}
                        href="/dashboard/projects"
                        count={activeProjects.length}
                        delay="200ms"
                    >
                        {activeProjects.length === 0 ? <EmptyWidget text="No active projects" /> : (
                            <div className="space-y-4">
                                {activeProjects.map(project => (
                                    <div key={project.id} className="p-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-[#37352f] truncate">{project.title}</span>
                                            <span className="text-xs font-bold text-[#37352f] bg-[#f1f1ef] px-1.5 py-0.5 rounded">{project.progress}%</span>
                                        </div>
                                        <ProgressBar value={project.progress} showLabel={false} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Widget>

                    {/* Goal Progress */}
                    <Widget
                        title="Goal Progress"
                        icon={<Target size={16} className="text-orange-600" />}
                        href="/dashboard/goals"
                        count={activeGoals.length}
                        delay="300ms"
                    >
                        {activeGoals.length === 0 ? <EmptyWidget text="No active goals" /> : (
                            <div className="space-y-4">
                                {activeGoals.map(goal => (
                                    <div key={goal.id} className="p-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-[#37352f] truncate">{goal.title}</span>
                                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{goal.progress}%</span>
                                        </div>
                                        <ProgressBar value={goal.progress} showLabel={false} color="#f97316" />
                                        {goal.metric && <p className="text-[11px] font-medium text-[#9b9a97] mt-1.5 uppercase tracking-wider">{goal.metric}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Widget>

                    {/* Recent Notes */}
                    <Widget
                        title="Recent Notes"
                        icon={<FileText size={16} className="text-green-600" />}
                        href="/dashboard/notes"
                        count={recentNotes.length}
                        delay="400ms"
                    >
                        {recentNotes.length === 0 ? <EmptyWidget text="No notes yet" /> : (
                            <div className="space-y-1">
                                {recentNotes.map(note => (
                                    <Link key={note.id} href={`/dashboard/notes/${note.id}`}
                                        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#f7f7f5] transition-all hover:translate-x-1 group">
                                        <div className="p-1.5 rounded-lg bg-[#f1f1ef] group-hover:bg-white transition-colors">
                                            <FileText size={14} className="text-[#9b9a97] flex-shrink-0" />
                                        </div>
                                        <span className="text-sm text-[#37352f] flex-1 truncate font-medium">{note.title}</span>
                                        <span className="text-xs text-[#9b9a97] font-medium flex-shrink-0">{format(new Date(note.updatedAt), 'MMM d')}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Widget>

                    {/* Mini Calendar */}
                    <MiniCalendar tasks={tasks} delay="500ms" />
                </div>

            </div>

            {showQuickAdd && <QuickAddModal defaultType={quickAddType} onClose={() => setShowQuickAdd(false)} />}
        </div>
    )
}

function Widget({ title, icon, href, count, children, delay = "0" }) {
    return (
        <div
            className="border border-[#e9e9e7] rounded-2xl p-5 bg-white hover-lift sexy-shadow animate-fade-in-up"
            style={{ animationDelay: delay }}
        >
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#f7f7f5] flex items-center justify-center">
                        {icon}
                    </div>
                    <h2 className="text-sm font-bold text-[#37352f] tracking-tight">{title}</h2>
                    {count > 0 && <span className="px-2 py-0.5 bg-[#f1f1ef] text-[#787774] text-[10px] font-bold rounded-full">{count}</span>}
                </div>
                <Link href={href} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f7f7f5] text-[#9b9a97] hover:text-[#37352f] transition-all">
                    <ChevronRight size={18} />
                </Link>
            </div>
            {children}
        </div>
    )
}

function EmptyWidget({ text }) {
    return <p className="text-[13px] font-medium text-[#9b9a97] py-6 text-center italic">{text}</p>
}

function MiniCalendar({ tasks, delay = "0" }) {
    const now = new Date()
    const days = Array.from({ length: 7 }, (_, i) => addDays(now, i))
    return (
        <div
            className="border border-[#e9e9e7] rounded-2xl p-5 bg-white hover-lift sexy-shadow animate-fade-in-up"
            style={{ animationDelay: delay }}
        >
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-blue-50 flex items-center justify-center">
                    <BookMarked size={16} className="text-[#2eaadc]" />
                </div>
                <h2 className="text-sm font-bold text-[#37352f] tracking-tight">Next 7 Days</h2>
            </div>
            <div className="space-y-3">
                {days.map(day => {
                    const dayTasks = tasks.filter(t => t.dueDate && format(parseISO(t.dueDate || '2000-01-01'), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
                    return (
                        <div key={day.toISOString()} className="flex items-center gap-4 group">
                            <div className={`text-[11px] w-8 font-bold uppercase tracking-widest flex-shrink-0 ${isToday(day) ? 'text-blue-600' : 'text-[#9b9a97]'}`}>
                                {isToday(day) ? 'Now' : format(day, 'EEE')}
                            </div>
                            <div className="flex-1 flex gap-2 flex-wrap">
                                {dayTasks.slice(0, 3).map(t => (
                                    <span key={t.id} className="text-[11px] font-bold px-2.5 py-1 bg-blue-50/50 text-blue-700 rounded-lg truncate max-w-[140px] border border-blue-100/50 group-hover:bg-blue-100 transition-colors">
                                        {t.title}
                                    </span>
                                ))}
                                {dayTasks.length === 0 && <div className="h-px bg-[#f1f1ef] flex-1 mt-2"></div>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
