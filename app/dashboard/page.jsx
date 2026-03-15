'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { format, isToday, isTomorrow, parseISO, isAfter, addDays } from 'date-fns'
import { CheckSquare, FolderOpen, Target, FileText, Plus, Check, ChevronRight, BookMarked, Trash2 } from 'lucide-react'
import Link from 'next/link'
import QuickAddModal from '@/components/ui/QuickAddModal'
import StatusTag from '@/components/properties/StatusTag'
import ProgressBar from '@/components/properties/ProgressBar'

export default function DashboardPage() {
    const { tasks, projects, goals, notes, updateTask, session, loading } = useApp()
    const [showQuickAdd, setShowQuickAdd] = useState(false)
    const [quickAddType, setQuickAddType] = useState('task')
    const [pageMounted, setPageMounted] = useState(false)

    useEffect(() => {
        setPageMounted(true)
    }, [])

    const now = new Date()
    const todayTasks = tasks.filter(t => !t.completed && t.dueDate && isToday(parseISO(t.dueDate)))
    const upcomingTasks = tasks.filter(t => !t.completed && t.dueDate && isAfter(parseISO(t.dueDate), now) && !isToday(parseISO(t.dueDate))).slice(0, 5)
    const activeProjects = projects.filter(p => p.status === 'Active').slice(0, 4)
    const activeGoals = goals.filter(g => g.status === 'Active').slice(0, 4)
    const recentNotes = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4)

    const openQuickAdd = (type) => { setQuickAddType(type); setShowQuickAdd(true) }

    const hour = now.getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const userName = session?.user?.name?.split(' ')[0] || ''

    const isDataLoading = !pageMounted || loading

    return (
        <div className="max-w-6xl mx-auto">
            <div className="animate-fade-in-up">
                {/* Welcome Section */}
                <div className="mb-12 relative">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                                {isDataLoading ? (
                                    <div className="h-12 w-64 bg-white/5 animate-pulse rounded-2xl" />
                                ) : (
                                    <>
                                        {greeting}, <span className="text-premium-gradient">{userName || 'Explorer'}</span> 👋
                                    </>
                                )}
                            </h1>
                            <p className="text-slate-400 text-base font-medium flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                {format(now, 'EEEE, MMMM d, yyyy')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
                    {[
                        { type: 'task', label: 'New Task', icon: CheckSquare, color: 'from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 text-blue-400' },
                        { type: 'note', label: 'New Note', icon: FileText, color: 'from-green-500/10 to-green-500/5 hover:from-green-500/20 text-green-400' },
                        { type: 'project', label: 'New Project', icon: FolderOpen, color: 'from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 text-purple-400' },
                        { type: 'goal', label: 'New Goal', icon: Target, color: 'from-orange-500/10 to-orange-500/5 hover:from-orange-500/20 text-orange-400' },
                        { href: '/dashboard/recycle-bin', label: 'Trash', icon: Trash2, color: 'from-red-500/10 to-red-500/5 hover:from-red-500/20 text-red-400' },
                    ].map((item) => (
                        item.href ? (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl glass-dark border-white/5 bg-gradient-to-br ${item.color} transition-all hover:-translate-y-1 hover:shadow-xl group`}
                            >
                                <item.icon size={24} className="group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                            </Link>
                        ) : (
                            <button
                                key={item.type}
                                onClick={() => openQuickAdd(item.type)}
                                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl glass-dark border-white/5 bg-gradient-to-br ${item.color} transition-all hover:-translate-y-1 hover:shadow-xl group`}
                            >
                                <Plus size={24} className="group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                            </button>
                        )
                    ))}
                </div>

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Today's Tasks */}
                    <Widget title="Today's Tasks" icon={<CheckSquare size={18} />} href="/dashboard/tasks" count={todayTasks.length} loading={isDataLoading} color="indigo">
                        {todayTasks.length === 0 ? <EmptyWidget text="No tasks due today 🎉" /> : (
                            <div className="space-y-3">
                                {todayTasks.map(task => (
                                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                                        <button onClick={() => updateTask(task.id, { completed: true, status: 'Done' })}
                                            className="w-6 h-6 rounded-lg border-2 border-white/10 hover:border-indigo-500 flex items-center justify-center flex-shrink-0 transition-all hover:bg-indigo-500/10">
                                            {task.completed && <Check size={14} className="text-indigo-400" />}
                                        </button>
                                        <span className="text-sm text-slate-200 flex-1 truncate font-semibold">{task.title}</span>
                                        <StatusTag status={task.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Widget>

                    {/* Upcoming Tasks */}
                    <Widget title="Upcoming" icon={<CheckSquare size={18} />} href="/dashboard/tasks" count={upcomingTasks.length} loading={isDataLoading} color="violet">
                        {upcomingTasks.length === 0 ? <EmptyWidget text="Nothing ahead. Chill! 😎" /> : (
                            <div className="space-y-3">
                                {upcomingTasks.map(task => (
                                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                                        <span className="text-sm text-slate-200 flex-1 truncate font-semibold">{task.title}</span>
                                        <span className="text-[10px] font-bold px-2 py-1 bg-white/5 text-slate-400 rounded-lg flex-shrink-0 uppercase tracking-tight">
                                            {isTomorrow(parseISO(task.dueDate)) ? 'Tomorrow' : format(parseISO(task.dueDate), 'MMM d')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Widget>

                    {/* Active Projects */}
                    <Widget title="Active Projects" icon={<FolderOpen size={18} />} href="/dashboard/projects" count={activeProjects.length} loading={isDataLoading} color="blue">
                        {activeProjects.length === 0 ? <EmptyWidget text="No projects active yet" /> : (
                            <div className="space-y-5">
                                {activeProjects.map(project => (
                                    <div key={project.id} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-white truncate">{project.title}</span>
                                            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">{project.progress}%</span>
                                        </div>
                                        <ProgressBar value={project.progress} showLabel={false} color="#3B82F6" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Widget>

                    {/* Recent Notes */}
                    <Widget title="Recent Notes" icon={<FileText size={18} />} href="/dashboard/notes" count={recentNotes.length} loading={isDataLoading} color="green">
                        {recentNotes.length === 0 ? <EmptyWidget text="Your mind is empty..." /> : (
                            <div className="space-y-2">
                                {recentNotes.map(note => (
                                    <Link key={note.id} href={`/dashboard/notes/${note.id}`} target="_blank"
                                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                                            <FileText size={18} className="text-slate-400 group-hover:text-indigo-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-bold truncate">{note.title}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{format(new Date(note.updatedAt), 'MMMM d')}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Widget>

                    {/* Mini Calendar */}
                    <MiniCalendar tasks={tasks} loading={isDataLoading} />

                    {/* Goal Progress */}
                    <Widget title="Goal Progress" icon={<Target size={18} />} href="/dashboard/goals" count={activeGoals.length} loading={isDataLoading} color="orange">
                        {activeGoals.length === 0 ? <EmptyWidget text="Zero goals? Aim high!" /> : (
                            <div className="space-y-5">
                                {activeGoals.map(goal => (
                                    <div key={goal.id}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-white truncate">{goal.title}</span>
                                            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg">{goal.progress}%</span>
                                        </div>
                                        <ProgressBar value={goal.progress} showLabel={false} color="#F97316" />
                                        {goal.metric && <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">{goal.metric}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Widget>
                </div>
            </div>

            {showQuickAdd && <QuickAddModal defaultType={quickAddType} onClose={() => setShowQuickAdd(false)} />}
        </div>
    )
}

function Widget({ title, icon, href, count, children, loading = false, color = "indigo" }) {
    const colorMap = {
        indigo: "text-indigo-400 shadow-indigo-500/10",
        violet: "text-violet-400 shadow-violet-500/10",
        blue: "text-blue-400 shadow-blue-500/10",
        green: "text-green-400 shadow-green-500/10",
        orange: "text-orange-400 shadow-orange-500/10",
        red: "text-red-400 shadow-red-500/10",
    }

    return (
        <div className="glass p-6 hover-lift relative group overflow-hidden border-white/5">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-2xl bg-white/5 ${colorMap[color]} flex items-center justify-center shadow-lg`}>
                        {icon}
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-wider">{title}</h2>
                        {!loading && count > 0 && <span className="text-[10px] font-bold text-slate-500">{count} items active</span>}
                    </div>
                </div>
                <Link href={href} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                    <ChevronRight size={18} />
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    <div className="h-10 bg-white/5 animate-pulse rounded-2xl w-full" />
                    <div className="h-10 bg-white/5 animate-pulse rounded-2xl w-5/6" />
                    <div className="h-10 bg-white/5 animate-pulse rounded-2xl w-full" />
                </div>
            ) : children}
        </div>
    )
}

function EmptyWidget({ text }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <p className="text-sm font-bold text-slate-400 italic text-center px-4">{text}</p>
        </div>
    )
}

function MiniCalendar({ tasks, loading = false }) {
    const now = new Date()
    const days = Array.from({ length: 7 }, (_, i) => addDays(now, i))
    return (
        <div className="glass p-6 hover-lift border-white/5">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                    <BookMarked size={18} />
                </div>
                <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">Next 7 Days</h2>
                    <p className="text-[10px] font-bold text-slate-500">Upcoming Schedule</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 items-center">
                            <div className="w-10 h-3 bg-white/5 animate-pulse rounded-md" />
                            <div className="flex-1 h-3 bg-white/5 animate-pulse rounded-md" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {days.map(day => {
                        const dayTasks = tasks.filter(t => t.dueDate && format(parseISO(t.dueDate || '2000-01-01'), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
                        return (
                            <div key={day.toISOString()} className="flex items-start gap-4 group">
                                <div className={`text-[11px] w-10 py-1 font-black uppercase tracking-widest text-center rounded-lg ${isToday(day) ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}>
                                    {isToday(day) ? 'Now' : format(day, 'EEE')}
                                </div>
                                <div className="flex-1 flex gap-2 flex-wrap min-h-[22px]">
                                    {dayTasks.slice(0, 2).map(t => (
                                        <span key={t.id} className="text-[10px] font-black px-2.5 py-1 bg-white/5 text-slate-300 rounded-lg truncate max-w-[120px] group-hover:bg-indigo-500/20 group-hover:text-indigo-200 transition-all">
                                            {t.title}
                                        </span>
                                    ))}
                                    {dayTasks.length > 2 && <span className="text-[10px] font-bold text-slate-600">+{dayTasks.length - 2}</span>}
                                    {dayTasks.length === 0 && <div className="h-px bg-white/5 flex-1 self-center"></div>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}