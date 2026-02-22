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
            // Reduce initial load by fetching only the endpoint for the current dashboard tab
            const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
            const pickEndpointsForPath = (p) => {
                if (p.startsWith('/dashboard/tasks')) return ['tasks']
                if (p.startsWith('/dashboard/notes')) return ['notes']
                if (p.startsWith('/dashboard/journal')) return ['journal']
                if (p.startsWith('/dashboard/projects')) return ['projects']
                if (p.startsWith('/dashboard/resources')) return ['resources']
                if (p.startsWith('/dashboard/goals')) return ['goals']
                // default: fetch only tasks to keep initial load light
                return ['tasks']
            }

            const endpoints = pickEndpointsForPath(pathname)

            // Always fetch profile (view preferences) and then the selected endpoints
            const profileRes = await fetch('/api/user/profile')
            const responses = await Promise.all(endpoints.map(e => fetch(`/api/${e}`)))

            const data = await Promise.all(responses.map(r => r.json()))
            const profile = await profileRes.json()

            const resultMap = {}
            endpoints.forEach((e, i) => resultMap[e] = data[i] || [])

            const stored = getStorage('appData')
            const localNotes = stored?.notes || []

            if (resultMap.notes) {
                const mergedNotesMap = new Map()
                resultMap.notes.forEach(note => mergedNotesMap.set(note.id, note))
                localNotes.forEach(note => mergedNotesMap.set(note.id, note))
                setNotes(Array.from(mergedNotesMap.values()))
            } else {
                setNotes(localNotes.length ? localNotes : defaultData.notes)
            }

            setTasks(resultMap.tasks || (stored?.tasks || defaultData.tasks))
            setProjects(resultMap.projects || (stored?.projects || defaultData.projects))
            setGoals(resultMap.goals || (stored?.goals || defaultData.goals))
            setJournal(resultMap.journal || (stored?.journal || defaultData.journal))
            setResources(resultMap.resources || (stored?.resources || defaultData.resources || []))
            setViewPreferences(profile.viewPreferences || {})
            setAreas(getStorage('areas') || defaultData.areas)
            setArchive(getStorage('archive') || [])

        } catch (e) {
            console.error('fetchAllFromAPI failed, falling back to local data', e)
            loadFromLocalStorage()
        } finally {
            setLoading(false)
        }
    }

    // Fetch a single endpoint on demand (pages can call this when they mount)
    const fetchEndpoint = useCallback(async (endpoint) => {
        try {
            setLoading(true)
            const res = await fetch(`/api/${endpoint}`)
            if (!res.ok) throw new Error('API error')
            const data = await res.json()
            const stored = getStorage('appData')
            switch (endpoint) {
                case 'tasks': setTasks(data); break
                case 'projects': setProjects(data); break
                case 'goals': setGoals(data); break
                case 'notes': {
                    const localNotes = stored?.notes || []
                    const mergedNotesMap = new Map()
                    (data || []).forEach(n => mergedNotesMap.set(n.id, n))
                    localNotes.forEach(n => mergedNotesMap.set(n.id, n))
                    setNotes(Array.from(mergedNotesMap.values()))
                    break
                }
                case 'journal': setJournal(data); break
                case 'resources': setResources(data); break
                default: break
            }
        } catch (err) {
            console.error('fetchEndpoint failed', endpoint, err)
        } finally {
            setLoading(false)
        }
    }, [])

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
        let data = null
        try {
            data = await res.json()
        } catch (e) {
            // Non-JSON response
        }

        if (!res.ok) {
            const message = (data && (data.error || data.message)) || res.statusText || 'API error'
            const err = new Error(message)
            err.status = res.status
            err.body = data
            throw err
        }

        return data
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
            // Store the original item before updating
            let savedItem = null
            
            setter(prev => {
                const item = prev.find(i => i.id === id)
                savedItem = item ? { ...item } : null
                return prev.map(i =>
                    i.id === id
                        ? { ...i, ...updates, updatedAt: new Date().toISOString() }
                        : i
                )
            })
            
            if (isAuthenticated) {
                try {
                    const updated = await apiCall('PUT', `/api/${endpoint}/${id}`, updates)
                    // Deep merge: keep original item data, then apply API updates, then ensure critical fields
                    const merged = { ...savedItem, ...updated, id }
                    console.debug(`[AppContext] Updated ${endpoint} ${id}:`, merged)
                    setter(prev => prev.map(i => i.id === id ? merged : i))
                    return merged
                } catch (error) {
                    // If API fails, keep the optimistic update
                    console.error('Update failed:', error)
                    // return the optimistic version
                    const optimistic = { ...savedItem, ...updates, updatedAt: new Date().toISOString(), id }
                    console.debug(`[AppContext] Update optimistic for ${endpoint} ${id}:`, optimistic)
                    return optimistic
                }
            }

            // For unauthenticated (local) update, return the optimistic updated item
            return { ...savedItem, ...updates, updatedAt: new Date().toISOString(), id }
        },
        delete: async (id) => {
            if (isAuthenticated) {
                try {
                    await apiCall('DELETE', `/api/${endpoint}/${id}`)
                } catch (error) {
                    console.error(`Failed to delete ${endpoint}/${id}:`, error)
                    // Proceed with local removal to avoid leaving UI in a broken state
                }
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

    const value = {
        tasks, projects, goals, notes, journal, areas, resources, archive,
        viewPreferences,
        sidebarCollapsed, setSidebarCollapsed,
        loading,
        session,
        isAuthenticated,

        addTask: taskCRUD.add,
        updateTask: taskCRUD.update,
        deleteTask: taskCRUD.delete,

        fetchEndpoint,

        addProject: projectCRUD.add,
        updateProject: projectCRUD.update,
        deleteProject: projectCRUD.delete,

        addGoal: goalCRUD.add,
        updateGoal: goalCRUD.update,
        deleteGoal: goalCRUD.delete,

        addNote: noteCRUD.add,
        updateNote: noteCRUD.update,
        deleteNote: noteCRUD.delete,

        addJournal: journalCRUD.add,
        updateJournal: journalCRUD.update,
        deleteJournal: journalCRUD.delete,

        addResource: resourceCRUD.add,
        updateResource: resourceCRUD.update,
        deleteResource: resourceCRUD.delete,
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
