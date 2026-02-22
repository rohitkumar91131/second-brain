"use client"

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { format, subDays, eachDayOfInterval, parseISO, differenceInCalendarDays } from 'date-fns'
import { ChevronLeft } from 'lucide-react'

function formatDate(d) {
    return format(d, 'yyyy-MM-dd')
}

function computeCurrentStreak(historySet) {
    let count = 0
    let cur = new Date()
    while (true) {
        const key = formatDate(cur)
        if (!historySet.has(key)) break
        count++
        cur.setDate(cur.getDate() - 1)
    }
    return count
}

function computeLongestStreak(allDates) {
    if (!allDates || allDates.length === 0) return 0
    const sorted = Array.from(new Set(allDates)).sort()
    let longest = 0
    let current = 1
    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1])
        const cur = new Date(sorted[i])
        const diff = (cur - prev) / (1000 * 60 * 60 * 24)
        if (diff === 1) {
            current++
        } else {
            longest = Math.max(longest, current)
            current = 1
        }
    }
    longest = Math.max(longest, current)
    return longest
}

export default function TaskDetailPage() {
    const params = useParams()
    const id = params.id
    const { tasks, updateTask, loading } = useApp()

    const task = tasks.find(t => t.id === id)

    const history = task?.history || []
    const historySet = useMemo(() => new Set(history), [history])

    const days = useMemo(() => {
        const end = new Date()
        let start = task?.createdAt ? parseISO(task.createdAt) : subDays(end, 90)

        // Cap the displayed range to the last 365 days to avoid huge grids
        const diff = differenceInCalendarDays(end, start)
        if (diff > 365) start = subDays(end, 365)

        return eachDayOfInterval({ start, end }).map(d => ({
            date: formatDate(d),
            label: format(d, 'MMM d')
        }))
    }, [task?.createdAt])

    // Build weeks (columns) where each week is an array of 7 slots for Sun..Sat
    const weeks = useMemo(() => {
        if (!days || days.length === 0) return []
        const cols = []
        let week = Array(7).fill(null)
        for (const d of days) {
            const day = parseISO(d.date)
            const dow = day.getDay() // 0-6 Sun..Sat
            week[dow] = d
            // if saturday, push week and start new
            if (dow === 6) {
                cols.push(week)
                week = Array(7).fill(null)
            }
        }
        // push last week if it has any day
        if (week.some(Boolean)) cols.push(week)
        return cols
    }, [days])

    const currentStreak = useMemo(() => computeCurrentStreak(historySet), [historySet])
    const longestStreak = useMemo(() => computeLongestStreak(history), [history])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full relative overflow-hidden">
                <div className="absolute inset-0 flex">
                    <div className="relative w-full h-1 loading-bar-animation">
                        <div className="w-1 h-1 bg-[#2eaadc] rounded-full"></div>
                    </div>
                </div>
                <LoaderIcon className="w-6 h-6 text-[#9b9a97] animate-spin" />
            </div>
        )
    }

    if (!task) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-[#9b9a97]">Task not found</div>
            </div>
        )
    }

    const toggleDate = async (date) => {
        try {
            await updateTask(id, { toggleDate: date })
        } catch (e) {
            console.error('Toggle failed', e)
        }
    }

    const toggleToday = () => toggleDate(formatDate(new Date()))

    const totalCompletions = history.length
    const lastCompleted = history.length ? history.slice().sort().pop() : null

    const router = useRouter()

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/tasks')}
                        className="p-2 rounded hover:bg-[#f0f0ee] transition-colors"
                        title="Back"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">{task.title}</h1>
                        <p className="text-sm text-[#9b9a97] mt-1">{task.notes}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-[#9b9a97] text-right">
                        <div>Current streak</div>
                        <div className="text-xl font-bold">{currentStreak}</div>
                    </div>
                    <div className="text-sm text-[#9b9a97] text-right">
                        <div>Longest</div>
                        <div className="text-xl font-bold">{longestStreak}</div>
                    </div>
                    <div className="text-sm text-[#9b9a97] text-right">
                        <div>Completions</div>
                        <div className="text-xl font-bold">{totalCompletions}</div>
                    </div>
                    <button
                        onClick={toggleToday}
                        className="px-3 py-1 bg-[#37352f] text-white rounded-md text-sm"
                    >
                        Toggle Today
                    </button>
                </div>
            </div>

            <div className="p-6 overflow-auto">
                <h2 className="text-sm font-bold mb-3">Last 90 days</h2>

                <div className="flex gap-3">
                    {/* Weekday labels vertically */}
                    <div className="flex flex-col gap-1 text-xs text-[#9b9a97]">
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w => (
                            <div key={w} className="h-7 flex items-center">{w}</div>
                        ))}
                    </div>

                    <div className="overflow-auto">
                        <div className="flex gap-1 items-start">
                            {weeks.map((week, wi) => (
                                <div key={`w-${wi}`} className="flex flex-col gap-1">
                                    {week.map((d, di) => {
                                        if (!d) return <div key={`d-${wi}-${di}`} className="w-7 h-7" />
                                        const done = historySet.has(d.date)
                                        const diff = differenceInCalendarDays(new Date(), parseISO(d.date))
                                        let greenClass = 'bg-green-400'
                                        if (done) {
                                            if (diff <= 7) greenClass = 'bg-green-800'
                                            else if (diff <= 30) greenClass = 'bg-green-600'
                                            else if (diff <= 90) greenClass = 'bg-green-500'
                                            else greenClass = 'bg-green-400'
                                        }
                                        return (
                                            <button
                                                key={`d-${wi}-${di}`}
                                                title={`${d.label} - ${done ? 'Done' : 'Not done'}`}
                                                onClick={() => toggleDate(d.date)}
                                                className={`w-7 h-7 rounded-sm transition-all focus:outline-none ${done ? `${greenClass} shadow-sm` : 'bg-[#efefef] hover:bg-[#e0e0e0]'}`}
                                            />
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-sm text-[#9b9a97]">
                    {lastCompleted ? (
                        <div>Last completed: {lastCompleted}</div>
                    ) : (
                        <div>No completions yet</div>
                    )}
                </div>
            </div>
        </div>
    )
}
