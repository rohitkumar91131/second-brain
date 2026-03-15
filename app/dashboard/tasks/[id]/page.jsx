"use client"

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { format, subDays, eachDayOfInterval, parseISO, differenceInCalendarDays } from 'date-fns'
import { ChevronLeft } from 'lucide-react'
import Loader from '@/components/ui/Loader'

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
        if (diff === 1) current++
        else {
            longest = Math.max(longest, current)
            current = 1
        }
    }
    return Math.max(longest, current)
}

export default function TaskDetailPage() {
    const params = useParams()
    const router = useRouter() // ✅ moved to top
    const id = params.id

    const { tasks, updateTask, loading } = useApp()
    const task = tasks.find(t => t.id === id)

    const history = useMemo(() => task?.history || [], [task?.history])
    const historySet = useMemo(() => new Set(history), [history])
    const [notFoundDelay, setNotFoundDelay] = useState(false)

    useEffect(() => {
        if (!loading && !task) {
            const t = setTimeout(() => setNotFoundDelay(true), 400)
            return () => clearTimeout(t)
        } else if (task) {
            setNotFoundDelay(false)
        }
    }, [loading, task])

    const days = useMemo(() => {
        const end = new Date()
        let start = task?.createdAt ? parseISO(task.createdAt) : subDays(end, 90)

        const diff = differenceInCalendarDays(end, start)
        if (diff > 365) start = subDays(end, 365)

        return eachDayOfInterval({ start, end }).map(d => ({
            date: formatDate(d),
            label: format(d, 'MMM d')
        }))
    }, [task?.createdAt])

    const weeks = useMemo(() => {
        if (!days.length) return []
        const cols = []
        let week = Array(7).fill(null)

        for (const d of days) {
            const day = parseISO(d.date)
            const dow = day.getDay()
            week[dow] = d

            if (dow === 6) {
                cols.push(week)
                week = Array(7).fill(null)
            }
        }

        if (week.some(Boolean)) cols.push(week)
        return cols
    }, [days])

    const currentStreak = useMemo(() => computeCurrentStreak(historySet), [historySet])
    const longestStreak = useMemo(() => computeLongestStreak(history), [history])

    if (loading) {
        return <Loader />
    }

    if (!task && notFoundDelay) {
        return (
            <div className="flex items-center justify-center h-full text-notion-muted">
                Task not found
            </div>
        )
    }

    if (!task && !notFoundDelay) {
        return <Loader />
    }

    const toggleDate = async (date) => {
        await updateTask(id, { toggleDate: date })
    }

    const toggleToday = () => toggleDate(formatDate(new Date()))

    const totalCompletions = history.length
    const lastCompleted = history.length ? history.slice().sort().pop() : null

    return (
        <div className="flex flex-col h-full bg-notion-bg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/tasks')}
                        className="p-2 rounded hover:bg-[#f0f0ee]"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">{task.title}</h1>
                        <p className="text-sm text-notion-muted mt-1">{task.notes}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-notion-muted text-right">
                        <div>Current</div>
                        <div className="text-xl font-bold">{currentStreak}</div>
                    </div>
                    <div className="text-sm text-notion-muted text-right">
                        <div>Longest</div>
                        <div className="text-xl font-bold">{longestStreak}</div>
                    </div>
                    <div className="text-sm text-notion-muted text-right">
                        <div>Total</div>
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

            <div className="p-6">
                {lastCompleted ? (
                    <div className="text-sm text-notion-muted">
                        Last completed: {lastCompleted}
                    </div>
                ) : (
                    <div className="text-sm text-notion-muted">
                        No completions yet
                    </div>
                )}
            </div>
        </div>
    )
}