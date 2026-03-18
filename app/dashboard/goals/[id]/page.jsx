'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { format, parseISO, subMonths, addMonths, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, isAfter, isBefore } from 'date-fns'
import { ChevronLeft, ChevronRight, Target, CheckSquare, Plus, Check, Loader as LoaderIcon, Flame, Calendar, Trophy, Zap, TrendingUp, Trash2, Pencil, X } from 'lucide-react'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'
import QuickAddModal from '@/components/ui/QuickAddModal'

export default function GoalDetailPage() {
    const params = useParams()
    const router = useRouter()
    const goalId = params.id
    const { goals, tasks, updateGoal, updateTask, loading, fetchEndpoint, isFetched } = useApp()

    const [goal, setGoal] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [showAddTask, setShowAddTask] = useState(false)
    const [viewMonth, setViewMonth] = useState(new Date())
    const [logInput, setLogInput] = useState('')
    const [editingLogIdx, setEditingLogIdx] = useState(null)
    const [editingLogText, setEditingLogText] = useState('')

    useEffect(() => {
        let mounted = true
        const load = async () => {
            const reqs = []
            if (!isFetched('goals')) reqs.push(fetchEndpoint('goals'))
            if (!isFetched('tasks')) reqs.push(fetchEndpoint('tasks'))
            if (reqs.length > 0) await Promise.all(reqs)
            if (mounted) setIsLoaded(true)
        }
        load()
        return () => { mounted = false }
    }, [fetchEndpoint, isFetched])

    useEffect(() => {
        if (isLoaded) {
            const found = goals.find(g => g.id === goalId)
            setGoal(found)
        }
    }, [goals, goalId, isLoaded])

    if (loading || !isLoaded) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-[#0F172A]">
                <Loader />
            </div>
        )
    }

    if (!goal) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-[#0F172A] text-slate-400">
                <Target size={48} className="text-slate-700 mb-6" />
                <div className="text-xl font-bold mb-2">Goal not found</div>
                <Link href="/dashboard/goals" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold hover:underline">
                    Back to Goals
                </Link>
            </div>
        )
    }

    const goalTasks = tasks.filter(t => t.goalId === goalId)
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const dailyTasks = goalTasks.filter(t => t.dueDate === todayStr || (t.tags && t.tags.includes('daily')))
    const history = goal.history || []

    const handleCheckIn = async () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        if (history.includes(today)) {
            const newHistory = history.filter(d => d !== today)
            await updateGoal(goal.id, { history: newHistory })
        } else {
            await updateGoal(goal.id, { history: [...history, today] })
        }
    }

    const handleAddLog = async () => {
        if (!logInput.trim()) return
        const today = format(new Date(), 'yyyy-MM-dd')
        const newLogs = [{ date: today, text: logInput.trim() }, ...(goal.logs || [])]
        await updateGoal(goal.id, { logs: newLogs })
        setLogInput('')
    }

    const handleDeleteLog = async (idx) => {
        const newLogs = [...(goal.logs || [])]
        newLogs.splice(idx, 1)
        await updateGoal(goal.id, { logs: newLogs })
    }

    const handleStartEdit = (idx, text) => {
        setEditingLogIdx(idx)
        setEditingLogText(text)
    }

    const handleSaveEdit = async (idx) => {
        const newLogs = [...(goal.logs || [])]
        newLogs[idx].text = editingLogText
        await updateGoal(goal.id, { logs: newLogs })
        setEditingLogIdx(null)
    }

    const handlePrevMonth = () => setViewMonth(subMonths(viewMonth, 1))
    const handleNextMonth = () => setViewMonth(addMonths(viewMonth, 1))

    return (
        <div className="flex flex-col h-full bg-[#0F172A] overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 md:px-8 py-6 border-b border-white/5 bg-[#1E293B]/30 backdrop-blur-md gap-6">
                <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white shrink-0"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">{goal.title}</h1>
                            <div className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest">
                                {goal.status}
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">
                            {goal.metric || 'No metric set'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleCheckIn}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all border shadow-xl ${history.includes(todayStr)
                            ? 'bg-green-500 border-green-400 text-white shadow-green-500/20'
                            : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 shadow-indigo-500/20'
                            }`}
                    >
                        {history.includes(todayStr) ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                        {history.includes(todayStr) ? "CHECKED IN" : "DAILY CHECK-IN"}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent">
                <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Month Selector & Curve Graph */}
                        <div className="lg:col-span-2 glass-dark p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

                            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Consistency Curve</h2>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Monthly Trend View</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
                                    <button
                                        onClick={handlePrevMonth}
                                        disabled={goal.createdAt && isSameDay(startOfMonth(parseISO(goal.createdAt)), startOfMonth(viewMonth))}
                                        className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div className="px-5 py-2 min-w-[140px] text-center">
                                        <span className="text-xs font-black text-white uppercase tracking-widest">{format(viewMonth, 'MMMM yyyy')}</span>
                                    </div>
                                    <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative z-10 h-64 w-full">
                                <MonthCurveGraph history={history} month={viewMonth} />
                            </div>
                        </div>

                        {/* Stats & Quick Log */}
                        <div className="space-y-8">
                            {/* Stats */}
                            <div className="glass-dark p-8 rounded-[2rem] border-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-400">
                                        <Flame size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Streak</p>
                                        <p className="text-2xl font-black text-white">{history.length} Hits</p>
                                    </div>
                                </div>
                            </div>

                            {/* Add Log */}
                            <div className="glass-dark p-8 rounded-[2rem] border-white/5 relative overflow-hidden bg-indigo-600/10">
                                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4">What did you do today?</h3>
                                <div className="flex flex-col gap-3">
                                    <textarea
                                        value={logInput}
                                        onChange={(e) => setLogInput(e.target.value)}
                                        placeholder="I did this for my goal..."
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 resize-none custom-scrollbar"
                                    />
                                    <button
                                        onClick={handleAddLog}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        <Plus size={16} />
                                        ADD PROGRESS LOG
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Daily Logs */}
                        <div className="glass-dark p-8 rounded-[2rem] border-white/5 flex flex-col relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                            <div className="flex items-center gap-3 mb-8 relative z-10">
                                <div className="p-2.5 bg-purple-500/10 rounded-2xl text-purple-400">
                                    <Zap size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Daily Progress Logs</h2>
                            </div>

                            <div className="space-y-4 relative z-10 max-h-[500px] overflow-auto pr-2 custom-scrollbar">
                                {(goal.logs || []).length === 0 ? (
                                    <p className="text-center py-12 text-sm text-slate-500">No logs yet. Start by adding one above!</p>
                                ) : (
                                    (goal.logs || []).map((log, idx) => (
                                        <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    {format(parseISO(log.date), 'MMMM do, yyyy')}
                                                </span>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {editingLogIdx === idx ? (
                                                        <>
                                                            <button onClick={() => handleSaveEdit(idx)} className="text-green-400 hover:text-green-300">
                                                                <Check size={14} />
                                                            </button>
                                                            <button onClick={() => setEditingLogIdx(null)} className="text-slate-400 hover:text-white">
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleStartEdit(idx, log.text)} className="text-slate-400 hover:text-white">
                                                            <Pencil size={14} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteLog(idx)} className="text-red-400 hover:text-red-300">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            {editingLogIdx === idx ? (
                                                <textarea
                                                    value={editingLogText}
                                                    onChange={(e) => setEditingLogText(e.target.value)}
                                                    rows={3}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none custom-scrollbar"
                                                    autoFocus
                                                />
                                            ) : (
                                                <p className="text-sm text-slate-300 font-medium leading-relaxed italic whitespace-pre-wrap">
                                                    "{log.text}"
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Daily Tasks */}
                        <div className="glass-dark p-8 rounded-[2rem] border-white/5 flex flex-col relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-400">
                                        <CheckSquare size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Today's Tasks</h2>
                                </div>
                                <button
                                    onClick={() => setShowAddTask(true)}
                                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all border border-white/5"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div className="space-y-3 relative z-10">
                                {dailyTasks.length === 0 ? (
                                    <p className="text-center py-12 text-sm text-slate-500">No tasks for today</p>
                                ) : (
                                    dailyTasks.map(task => (
                                        <div key={task.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group transition-all">
                                            <button
                                                onClick={() => updateTask(task.id, { completed: !task.completed, status: !task.completed ? 'Done' : 'Not Started' })}
                                                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${task.completed ? 'bg-green-500 border-green-500' : 'border-white/10 group-hover:border-blue-500'
                                                    }`}
                                            >
                                                {task.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                                            </button>
                                            <span className={`text-sm font-bold truncate ${task.completed ? 'line-through text-slate-600' : 'text-slate-200'}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {showAddTask && (
                <QuickAddModal
                    defaultType="task"
                    onClose={() => setShowAddTask(false)}
                    prefilledData={{ goalId: goal.id, title: `${goal.title}: ` }}
                />
            )}
        </div>
    )
}

function MonthCurveGraph({ history, month }) {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const today = new Date()
    const days = eachDayOfInterval({ start, end })

    const dataPoints = useMemo(() => {
        let cumulative = 0
        return days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isHit = history.includes(dateStr)
            const isFuture = isAfter(day, today) && !isSameDay(day, today)
            const isPast = isBefore(day, today) && !isSameDay(day, today)

            if (!isFuture && isHit) cumulative += 1

            return {
                x: i,
                y: cumulative,
                isHit,
                date: day,
                isFuture,
                isPast,
                isToday: isSameDay(day, today)
            }
        })
    }, [history, days])

    if (dataPoints.length === 0) return null

    const width = 1000
    const height = 240
    const padding = 50

    const maxVal = Math.max(...dataPoints.map(d => d.y), 1)
    const xScale = (dataPoints.length > 1) ? (width - padding * 2) / (dataPoints.length - 1) : 0
    const yScale = (height - padding * 2) / maxVal

    const points = dataPoints.map((d, i) => ({
        x: padding + i * xScale,
        y: height - padding - d.y * yScale,
        isHit: d.isHit,
        isFuture: d.isFuture
    }))

    // We'll render segments between points
    const segments = []
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        if (curr.isFuture) break

        segments.push({
            p1: prev,
            p2: curr,
            color: curr.isHit ? '#3b82f6' : '#ef4444' // Blue for hit, Red for miss
        })
    }

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Grid lines */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ffffff10" strokeWidth="1" />

            {/* Render segments using Cubic Bezier for smoothness */}
            {segments.map((seg, i) => {
                const { p1, p2, color } = seg
                const cx = (p1.x + p2.x) / 2
                const d = `M ${p1.x},${p1.y} C ${cx},${p1.y} ${cx},${p2.y} ${p2.x},${p2.y}`
                return (
                    <path
                        key={i}
                        d={d}
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                    />
                )
            })}

            {/* Dots (minimal, as per "curve ka hi color change karo na ki dot") */}
            {points.map((p, i) => {
                if (p.isFuture) return null
                if (i === 0) return null // Skip first point for visual clarity or handle separately

                return (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={p.isHit ? 4 : 2}
                        fill={p.isHit ? '#3b82f6' : '#ef4444'}
                        className="transition-all duration-300"
                    />
                )
            })}

            {/* Labels */}
            {dataPoints.map((d, i) => (i % 5 === 0 || i === dataPoints.length - 1) && (
                <text
                    key={i}
                    x={padding + i * xScale}
                    y={height - padding + 25}
                    className="text-[11px] fill-slate-500 font-black uppercase tracking-tighter"
                    textAnchor="middle"
                >
                    {format(d.date, 'd')}
                </text>
            ))}
        </svg>
    )
}

function ConsistencyHeatmap({ history }) {
    const today = new Date()
    const startDate = subMonths(today, 3) // Reduced to 3 months for clutter-free view
    const days = eachDayOfInterval({ start: startDate, end: today })

    const weeks = []
    let currentWeek = []
    const padding = days[0].getDay()
    for (let i = 0; i < padding; i++) currentWeek.push(null)

    days.forEach(day => {
        if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = [] }
        currentWeek.push(day)
    })
    if (currentWeek.length > 0) { while (currentWeek.length < 7) currentWeek.push(null); weeks.push(currentWeek) }

    return (
        <div className="flex gap-1.5 flex-wrap justify-center">
            {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1.5">
                    {week.map((day, di) => {
                        if (!day) return <div key={di} className="w-3.5 h-3.5" />
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const isHit = history.includes(dateStr)
                        return (
                            <div
                                key={di}
                                className={`w-3.5 h-3.5 rounded-sm transition-all ${isHit ? 'bg-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white/5 hover:bg-white/10'}`}
                            />
                        )
                    })}
                </div>
            ))}
        </div>
    )
}
