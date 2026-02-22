'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { getStorage, setStorage } from '@/lib/storage'
import { defaultData } from '@/lib/defaultData'

const AppContext = createContext(null)

export function useApp() {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error('useApp must be used within AppProvider')
    return ctx
}

function AppContextInner({ children }) {
    const { data: session, status } = useSession()
    const isAuthenticated = status === 'authenticated'

    const [tasks, setTasks] = useState([])
    const [projects, setProjects] = useState([])
    const [goals, setGoals] = useState([])
    const [notes, setNotes] = useState([])
    const [journal, setJournal] = useState([])
    const [areas, setAreas] = useState([])
    const [resources, setResources] = useState([])
    const [archive, setArchive] = useState([])
    const [viewPreferences, setViewPreferences] = useState({})
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'loading') return
        if (isAuthenticated) fetchAllFromAPI()
        else loadFromLocalStorage()
    }, [status, isAuthenticated])

    const fetchAllFromAPI = async () => {
        setLoading(true)
        try {
            const endpoints = ['tasks','projects','goals','notes','journal','resources']
            const responses = await Promise.all(endpoints.map(e => fetch(`/api/${e}`)))
            const profileRes = await fetch('/api/user/profile')

            const data = await Promise.all(responses.map(r => r.json()))
            const profile = await profileRes.json()

            setTasks(data[0] || [])
            setProjects(data[1] || [])
            setGoals(data[2] || [])
            setNotes(data[3] || [])
            setJournal(data[4] || [])
            setResources(data[5] || [])
            setViewPreferences(profile.viewPreferences || {})
            setAreas(getStorage('areas') || defaultData.areas)
            setArchive(getStorage('archive') || [])
        } catch {
            loadFromLocalStorage()
        } finally {
            setLoading(false)
        }
    }

    const loadFromLocalStorage = () => {
        setLoading(true)
        const stored = getStorage('appData')

        if (stored) {
            setTasks(stored.tasks || [])
            setProjects(stored.projects || [])
            setGoals(stored.goals || [])
            setNotes(stored.notes || [])
            setJournal(stored.journal || [])
            setAreas(stored.areas || defaultData.areas)
            setResources(stored.resources || [])
            setArchive(stored.archive || [])
        } else {
            setTasks(defaultData.tasks)
            setProjects(defaultData.projects)
            setGoals(defaultData.goals)
            setNotes(defaultData.notes)
            setJournal(defaultData.journal)
            setAreas(defaultData.areas)
            setResources(defaultData.resources || [])
            setArchive([])
        }

        setViewPreferences(getStorage('viewPreferences') || {})
        setLoading(false)
    }

    useEffect(() => {
        if (loading) return
        setStorage('appData', {
            tasks,
            projects,
            goals,
            notes,
            journal,
            areas,
            resources,
            archive
        })
        setStorage('viewPreferences', viewPreferences)
    }, [tasks, projects, goals, notes, journal, areas, resources, archive, viewPreferences, loading])

    const apiCall = useCallback(async (method, url, body) => {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        })
        if (!res.ok) throw new Error('API error')
        return res.json()
    }, [])

    const makeCRUD = (setter, endpoint) => ({
        add: async (item) => {
            if (isAuthenticated) {
                const created = await apiCall('POST', `/api/${endpoint}`, item)
                setter(prev => [created, ...prev])
                return created
            } else {
                const newItem = {
                    ...item,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
                setter(prev => [newItem, ...prev])
                return newItem
            }
        },

        update: async (id, updates) => {
            if (isAuthenticated) {
                const updated = await apiCall('PUT', `/api/${endpoint}/${id}`, updates)
                setter(prev => prev.map(i => i.id === id ? updated : i))
            } else {
                setter(prev =>
                    prev.map(i =>
                        i.id === id
                            ? { ...i, ...updates, updatedAt: new Date().toISOString() }
                            : i
                    )
                )
            }
        },

        delete: async (id) => {
            if (isAuthenticated) {
                await apiCall('DELETE', `/api/${endpoint}/${id}`)
            }
            setter(prev => prev.filter(i => i.id !== id))
        }
    })

    const taskCRUD = makeCRUD(setTasks, 'tasks')
    const projectCRUD = makeCRUD(setProjects, 'projects')
    const goalCRUD = makeCRUD(setGoals, 'goals')
    const noteCRUD = makeCRUD(setNotes, 'notes')
    const journalCRUD = makeCRUD(setJournal, 'journal')
    const resourceCRUD = makeCRUD(setResources, 'resources')

    const setViewPreference = async (tabName, viewType) => {
        const newPrefs = { ...viewPreferences, [tabName]: viewType }
        setViewPreferences(newPrefs)

        if (isAuthenticated) {
            try {
                await apiCall('PUT', '/api/user/profile', { viewPreferences: newPrefs })
            } catch {}
        }
    }

    const archiveItem = (item, type) => {
        const archived = { ...item, type, archivedAt: new Date().toISOString() }
        setArchive(prev => [archived, ...prev])
    }

    const updateAreas = (newAreas) => setAreas(newAreas)
    const updateArchive = (newArchive) => setArchive(newArchive)

    const value = {
        tasks, projects, goals, notes, journal, areas, resources, archive,
        viewPreferences, setViewPreference,
        sidebarCollapsed, setSidebarCollapsed,
        loading,
        session,
        isAuthenticated,

        addTask: taskCRUD.add,
        updateTask: taskCRUD.update,
        deleteTask: taskCRUD.delete,

        addProject: projectCRUD.add,
        updateProject: projectCRUD.update,
        deleteProject: projectCRUD.delete,

        addGoal: goalCRUD.add,
        updateGoal: goalCRUD.update,
        deleteGoal: goalCRUD.delete,

        addNote: noteCRUD.add,
        updateNote: noteCRUD.update,
        deleteNote: noteCRUD.delete,

        addJournalEntry: journalCRUD.add,
        updateJournalEntry: journalCRUD.update,
        deleteJournalEntry: journalCRUD.delete,

        addResource: resourceCRUD.add,
        updateResource: resourceCRUD.update,
        deleteResource: resourceCRUD.delete,

        updateAreas,
        updateArchive,
        archiveItem
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function AppProvider({ children }) {
    return (
        <SessionProvider>
            <AppContextInner>{children}</AppContextInner>
        </SessionProvider>
    )
}
