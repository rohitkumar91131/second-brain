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

// ─── Inner provider (has access to session) ───────────────────────────────────
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

    // ─── Load data ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (status === 'loading') return

        if (isAuthenticated) {
            // Fetch from API
            fetchAllFromAPI()
        } else {
            // Load from localStorage (unauthenticated / fallback)
            loadFromLocalStorage()
        }
    }, [status, isAuthenticated])

    const fetchAllFromAPI = async () => {
        setLoading(true)
        try {
            const [tasksRes, projectsRes, goalsRes, notesRes, journalRes, resourcesRes, profileRes] = await Promise.all([
                fetch('/api/tasks'),
                fetch('/api/projects'),
                fetch('/api/goals'),
                fetch('/api/notes'),
                fetch('/api/journal'),
                fetch('/api/resources'),
                fetch('/api/user/profile'),
            ])

            const [tasksData, projectsData, goalsData, notesData, journalData, resourcesData, profileData] = await Promise.all([
                tasksRes.json(),
                projectsRes.json(),
                goalsRes.json(),
                notesRes.json(),
                journalRes.json(),
                resourcesRes.json(),
                profileRes.json(),
            ])

            setTasks(tasksData || [])
            setProjects(projectsData || [])
            setGoals(goalsData || [])
            setNotes(notesData || [])
            setJournal(journalData || [])
            setResources(resourcesData || [])
            setViewPreferences(profileData.viewPreferences || getStorage('viewPreferences') || {})
            setAreas(getStorage('areas') || defaultData.areas)
            setArchive(getStorage('archive') || [])
        } catch (err) {
            console.error('Failed to fetch data from API:', err)
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
            setViewPreferences(getStorage('viewPreferences') || {})
        } else {
            // First launch — seed with default data
            setTasks(defaultData.tasks)
            setProjects(defaultData.projects)
            setGoals(defaultData.goals)
            setNotes(defaultData.notes)
            setJournal(defaultData.journal)
            setAreas(defaultData.areas)
            setResources(defaultData.resources || [])
            setViewPreferences({})
            setArchive([])
        }
        setLoading(false)
    }

    // ─── Auto-save to localStorage (always, as cache) ─────────────────────────
    useEffect(() => {
        if (loading) return
        setStorage('appData', { tasks, projects, goals, notes, journal, areas, resources, archive })
        setStorage('viewPreferences', viewPreferences)
    }, [tasks, projects, goals, notes, journal, areas, resources, archive, viewPreferences, loading])

    // ─── API helper ───────────────────────────────────────────────────────────
    const apiCall = useCallback(async (method, url, body) => {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
        })
        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'API error')
        }
        return res.json()
    }, [])

    // ─── CRUD factory ─────────────────────────────────────────────────────────
    const makeCRUD = (setter, endpoint) => ({
        add: async (item) => {
            if (isAuthenticated) {
                const created = await apiCall('POST', `/api/${endpoint}`, item)
                setter(prev => [created, ...prev])
                return created
            } else {
                const newItem = { ...item, id: `${endpoint}-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
                setter(prev => [newItem, ...prev])
                return newItem
            }
        },
        update: async (id, updates) => {
            if (isAuthenticated) {
                const updated = await apiCall('PUT', `/api/${endpoint}/${id}`, updates)
                setter(prev => prev.map(i => i.id === id ? updated : i))
            } else {
                setter(prev => prev.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i))
            }
        },
        delete: async (id) => {
            if (isAuthenticated) {
                await apiCall('DELETE', `/api/${endpoint}/${id}`)
            }
            setter(prev => prev.filter(i => i.id !== id))
        },
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
        setStorage('viewPreferences', newPrefs)

        if (isAuthenticated) {
            try {
                await apiCall('PUT', '/api/user/profile', { viewPreferences: newPrefs })
            } catch (err) {
                console.error('Failed to sync view preferences to API:', err)
            }
        }
    }

    const archiveItem = (item, type) => {
        const archived = { ...item, type, archivedAt: new Date().toISOString() }
        setArchive(prev => [archived, ...prev])
    }

    const updateAreas = (newAreas) => {
        setAreas(newAreas)
        setStorage('areas', newAreas)
    }

    const updateArchive = (newArchive) => {
        setArchive(newArchive)
    }

    const value = {
        // State
        tasks, projects, goals, notes, journal, areas, resources, archive,
        viewPreferences, setViewPreference,
        sidebarCollapsed, setSidebarCollapsed,
        loading,
        session,
        isAuthenticated,

        // Tasks
        addTask: taskCRUD.add,
        updateTask: taskCRUD.update,
        deleteTask: taskCRUD.delete,

        // Projects
        addProject: projectCRUD.add,
        updateProject: projectCRUD.update,
        deleteProject: projectCRUD.delete,

        // Goals
        addGoal: goalCRUD.add,
        updateGoal: goalCRUD.update,
        deleteGoal: goalCRUD.delete,

        // Notes
        addNote: noteCRUD.add,
        updateNote: noteCRUD.update,
        deleteNote: noteCRUD.delete,

        // Journal
        addJournalEntry: journalCRUD.add,
        updateJournalEntry: journalCRUD.update,
        deleteJournalEntry: journalCRUD.delete,

        // Resources
        addResource: resourceCRUD.add,
        updateResource: resourceCRUD.update,
        deleteResource: resourceCRUD.delete,

        // Areas & Archive
        updateAreas,
        updateArchive,
        archiveItem,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// ─── Outer provider (wraps with SessionProvider) ──────────────────────────────
export function AppProvider({ children }) {
    return (
        <SessionProvider>
            <AppContextInner>{children}</AppContextInner>
        </SessionProvider>
    )
}
