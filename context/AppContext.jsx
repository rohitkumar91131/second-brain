'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
// Commented out the potentially faulty storage functions
// import { getStorage, setStorage } from '@/lib/storage'

// --- Added Safe Storage Wrappers ---
const safeGetStorage = (key) => {
    if (typeof window === 'undefined') return null;
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error(`Error parsing local storage key "${key}":`, e);
        return null;
    }
}

const safeSetStorage = (key, value) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error saving to local storage key "${key}":`, e);
    }
}
// -----------------------------------

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
    const [archivedNotes, setArchivedNotes] = useState([])
    const [deletedNotes, setDeletedNotes] = useState([])
    const [journal, setJournal] = useState([])
    const [areas, setAreas] = useState([])
    const [resources, setResources] = useState([])
    const [media, setMedia] = useState([])
    const [archive, setArchive] = useState([])
    const [viewPreferences, setViewPreferences] = useState({})
    const [activeBlocks, setActiveBlocks] = useState([])
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    useEffect(() => {
        const stored = safeGetStorage('sidebarCollapsed');
        if (stored !== null) {
            setSidebarCollapsed(stored);
        }
    }, [])
    const [loading, setLoading] = useState(true)
    const [isInitialized, setIsInitialized] = useState(false)
    const [activeFetches, setActiveFetches] = useState(0)
    const [fetchedEndpoints, setFetchedEndpoints] = useState(new Set())
    const fetchRegistry = useRef(new Set())

    const startFetch = useCallback(() => {
        setActiveFetches(prev => prev + 1)
        setLoading(true)
    }, [])

    const endFetch = useCallback(() => {
        setActiveFetches(prev => {
            const next = Math.max(0, prev - 1)
            if (next === 0) setLoading(false)
            return next
        })
    }, [])

    useEffect(() => {
        if (status === 'loading') return
        if (isAuthenticated) fetchAllFromAPI()
        else loadFromLocalStorage()
    }, [status, isAuthenticated])

    const fetchAllFromAPI = async (force = false) => {
        if (!force && fetchedEndpoints.has('all')) return
        startFetch()
        try {
            const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
            const pickEndpointsForPath = (p) => {
                if (p.startsWith('/dashboard/tasks')) return ['tasks']
                if (p.startsWith('/dashboard/notes')) return ['notes', 'notes?archived=true', 'notes?deleted=true']
                if (p.startsWith('/dashboard/journal')) return ['journal']
                if (p.startsWith('/dashboard/projects')) return ['projects']
                if (p.startsWith('/dashboard/resources')) return ['resources']
                if (p.startsWith('/dashboard/goals')) return ['goals']
                if (p.startsWith('/dashboard/media')) return ['blocks/media']
                return ['tasks']
            }

            const endpoints = pickEndpointsForPath(pathname)
            const profileRes = await fetch('/api/user/profile')
            const responses = await Promise.all(endpoints.map(e => fetch(`/api/${e}`)))

            const results = await Promise.all(responses.map(async (r) => {
                if (!r.ok) return null
                return await r.json()
            }))
            const profile = profileRes.ok ? await profileRes.json() : {}

            const resultMap = {}
            endpoints.forEach((e, i) => {
                if (results[i]) resultMap[e] = results[i]
            })

            const stored = safeGetStorage('appData') || {}

            const merge = (apiData, localData) => {
                if (!apiData) return localData || []
                const map = new Map()
                if (localData) localData.forEach(i => i.id && map.set(i.id, i))
                apiData.forEach(i => i.id && map.set(i.id, i))
                return Array.from(map.values())
            }

            setTasks(merge(resultMap.tasks, stored.tasks))
            setProjects(merge(resultMap.projects, stored.projects))
            setGoals(merge(resultMap.goals, stored.goals))
            setJournal(merge(resultMap.journal, stored.journal))
            setResources(merge(resultMap.resources, stored.resources))
            setMedia(merge(resultMap['blocks/media'], stored.media))

            setNotes(merge(resultMap.notes, stored.notes))
            if (resultMap['notes?archived=true']) setArchivedNotes(merge(resultMap['notes?archived=true'], stored.archivedNotes))
            else setArchivedNotes(stored.archivedNotes || [])

            if (resultMap['notes?deleted=true']) setDeletedNotes(merge(resultMap['notes?deleted=true'], stored.deletedNotes))
            else setDeletedNotes(stored.deletedNotes || [])

            setAreas(stored.areas || safeGetStorage('sbt_areas') || safeGetStorage('areas') || [])
            setArchive(stored.archive || safeGetStorage('sbt_archive') || safeGetStorage('archive') || [])

            if (profile.viewPreferences) setViewPreferences(profile.viewPreferences)
            else if (safeGetStorage('viewPreferences')) setViewPreferences(safeGetStorage('viewPreferences'))

            setFetchedEndpoints(prev => {
                const next = new Set(prev)
                next.add('all')
                endpoints.forEach(e => next.add(e))
                return next
            })
            setIsInitialized(true)
        } catch (e) {
            console.error('fetchAllFromAPI failed, falling back to local data', e)
            loadFromLocalStorage()
        } finally {
            endFetch()
        }
    }

    const fetchEndpoint = useCallback(async (endpoint, force = false) => {
        if (!force && fetchRegistry.current.has(endpoint)) return
        fetchRegistry.current.add(endpoint)

        try {
            startFetch()
            const res = await fetch(`/api/${endpoint}`)
            if (!res.ok) throw new Error('API error')
            const data = await res.json()
            switch (endpoint) {
                case 'tasks': setTasks(data); break
                case 'projects': setProjects(data); break
                case 'goals': setGoals(data); break
                case 'notes': {
                    const { searchParams } = new URL(res.url, window.location.origin)
                    const isArchived = searchParams.get('archived') === 'true'
                    const isDeleted = searchParams.get('deleted') === 'true'

                    if (isDeleted) setDeletedNotes(data)
                    else if (isArchived) setArchivedNotes(data)
                    else setNotes(data)
                    break
                }
                case 'journal': setJournal(data); break
                case 'resources': setResources(data); break
                case 'blocks/media': setMedia(data); break
                default: break
            }
            setFetchedEndpoints(prev => new Set(prev).add(endpoint))
        } catch (err) {
            console.error('fetchEndpoint failed', endpoint, err)
        } finally {
            fetchRegistry.current.delete(endpoint)
            endFetch()
        }
    }, [startFetch, endFetch])

    const fetchMedia = useCallback(() => fetchEndpoint('blocks/media'), [fetchEndpoint])

    const loadFromLocalStorage = () => {
        startFetch()
        const stored = safeGetStorage('appData')

        if (stored) {
            setTasks(stored.tasks || [])
            setProjects(stored.projects || [])
            setGoals(stored.goals || [])
            setNotes(stored.notes || [])
            setArchivedNotes(stored.archivedNotes || [])
            setDeletedNotes(stored.deletedNotes || [])
            setJournal(stored.journal || [])
            setAreas(stored.areas || safeGetStorage('sbt_areas') || safeGetStorage('areas') || [])
            setResources(stored.resources || [])
            setMedia(stored.media || [])
            setArchive(stored.archive || safeGetStorage('sbt_archive') || safeGetStorage('archive') || [])
        } else {
            setTasks(safeGetStorage('sbt_tasks') || safeGetStorage('tasks') || [])
            setProjects(safeGetStorage('sbt_projects') || safeGetStorage('projects') || [])
            setGoals(safeGetStorage('sbt_goals') || safeGetStorage('goals') || [])
            setNotes(safeGetStorage('sbt_notes') || safeGetStorage('notes') || [])
            setJournal(safeGetStorage('sbt_journal') || safeGetStorage('journal') || [])
            setAreas(safeGetStorage('sbt_areas') || safeGetStorage('areas') || [])
            setResources(safeGetStorage('sbt_resources') || safeGetStorage('resources') || [])
            setArchive(safeGetStorage('sbt_archive') || safeGetStorage('archive') || [])
            setArchivedNotes([])
            setDeletedNotes([])
        }

        setViewPreferences(safeGetStorage('viewPreferences') || safeGetStorage('sbt_settings') || {})
        setIsInitialized(true)
        endFetch()
    }

    useEffect(() => {
        if (!isInitialized || loading) return
        safeSetStorage('appData', {
            tasks,
            projects,
            goals,
            notes,
            archivedNotes,
            deletedNotes,
            journal,
            areas,
            resources,
            media,
            archive
        })
        safeSetStorage('viewPreferences', viewPreferences)
    }, [tasks, projects, goals, notes, archivedNotes, deletedNotes, journal, areas, resources, media, archive, viewPreferences, loading, isInitialized])

    useEffect(() => {
        if (!isInitialized) return
        safeSetStorage('sidebarCollapsed', sidebarCollapsed)
    }, [sidebarCollapsed, isInitialized])

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

    const makeCRUD = useCallback((setter, endpoint) => ({
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
            setter(prev => prev.map(i =>
                i.id === id
                    ? { ...i, ...updates, updatedAt: new Date().toISOString() }
                    : i
            ))

            if (isAuthenticated) {
                try {
                    const updated = await apiCall('PUT', `/api/${endpoint}/${id}`, updates)
                    setter(prev => prev.map(i =>
                        i.id === id
                            ? { ...updated, ...i }
                            : i
                    ))
                    return updated
                } catch (error) {
                    console.error('Update failed:', error)
                    return { ...updates, id }
                }
            }
            return { ...updates, updatedAt: new Date().toISOString(), id }
        },
        delete: async (id) => {
            if (isAuthenticated) {
                try {
                    await apiCall('DELETE', `/api/${endpoint}/${id}`)
                } catch (error) {
                    console.error(`Failed to delete ${endpoint}/${id}:`, error)
                }
            }
            setter(prev => prev.filter(i => i.id !== id))
        }
    }), [apiCall, isAuthenticated])

    const taskCRUD = useMemo(() => makeCRUD(setTasks, 'tasks'), [makeCRUD])
    const projectCRUD = useMemo(() => makeCRUD(setProjects, 'projects'), [makeCRUD])
    const goalCRUD = useMemo(() => makeCRUD(setGoals, 'goals'), [makeCRUD])
    const noteCRUD = useMemo(() => makeCRUD(setNotes, 'notes'), [makeCRUD])
    const journalCRUD = useMemo(() => makeCRUD(setJournal, 'journal'), [makeCRUD])
    const resourceCRUD = useMemo(() => makeCRUD(setResources, 'resources'), [makeCRUD])

    const archiveNote = useCallback(async (id) => {
        await noteCRUD.update(id, { isArchived: true })
        setNotes(prev => prev.filter(n => n.id !== id))
    }, [noteCRUD])

    const recycleNote = useCallback(async (id) => {
        await noteCRUD.update(id, { deletedAt: new Date().toISOString() })
        setNotes(prev => prev.filter(n => n.id !== id))
        setArchivedNotes(prev => prev.filter(n => n.id !== id))
    }, [noteCRUD])

    const restoreNote = useCallback(async (id) => {
        await noteCRUD.update(id, { deletedAt: null, isArchived: false })
        setDeletedNotes(prev => prev.filter(n => n.id !== id))
        setArchivedNotes(prev => prev.filter(n => n.id !== id))
    }, [noteCRUD])

    const deleteNotePermanently = useCallback(async (id) => {
        await noteCRUD.delete(id)
        setDeletedNotes(prev => prev.filter(n => n.id !== id))
    }, [noteCRUD])

    const fetchEntity = useCallback(async (entityType, entityId) => {
        const endpoint = entityType === 'Note' ? 'notes' : 'journal'
        const item = await apiCall('GET', `/api/${endpoint}/${entityId}`)
        if (entityType === 'Note') {
            setNotes(prev => {
                const exists = prev.find(n => n.id === entityId)
                if (exists) return prev.map(n => n.id === entityId ? item : n)
                return [item, ...prev]
            })
        } else {
            setJournal(prev => {
                const exists = prev.find(j => j.id === entityId)
                if (exists) return prev.map(j => j.id === entityId ? item : j)
                return [item, ...prev]
            })
        }
        return item
    }, [apiCall])

    const fetchBlocks = useCallback(async (entityId, entityType = 'Note') => {
        const endpoint = entityType === 'Note' ? 'notes' : 'journal'
        const blocks = await apiCall('GET', `/api/${endpoint}/${entityId}/blocks`)
        setActiveBlocks(blocks)
        return blocks
    }, [apiCall])

    const addBlock = useCallback(async (entityId, entityType, blockData) => {
        const block = await apiCall('POST', '/api/blocks', { ...blockData, entityId, entityType })
        setActiveBlocks(prev => [...prev, block].sort((a, b) => a.order - b.order))
        return block
    }, [apiCall])

    const updateBlock = useCallback(async (blockId, updates) => {
        setActiveBlocks(prev => prev.map(b => b.id === blockId ? { ...b, ...updates } : b))
        try {
            const updated = await apiCall('PATCH', `/api/blocks/${blockId}`, updates)
            setActiveBlocks(prev => prev.map(b => b.id === blockId ? updated : b))
            return updated
        } catch (err) {
            console.error('Block update failed', err)
            return null
        }
    }, [apiCall])

    const deleteBlock = useCallback(async (blockId) => {
        setActiveBlocks(prev => prev.filter(b => b.id !== blockId))
        try {
            await apiCall('DELETE', `/api/blocks/${blockId}`)
        } catch (err) {
            console.error('Block deletion failed', err)
        }
    }, [apiCall])

    const bulkUpdateBlocks = useCallback(async (entityId, entityType, blocks) => {
        setActiveBlocks(blocks)
        try {
            const endpoint = entityType === 'Note' ? 'notes' : 'journal'
            const updated = await apiCall('PATCH', `/api/${endpoint}/${entityId}/blocks`, blocks)
            setActiveBlocks(updated)
            return updated
        } catch (err) {
            console.error('Bulk update failed', err)
            return null
        }
    }, [apiCall])

    const value = useMemo(() => ({
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

        archiveNote,
        recycleNote,
        restoreNote,
        deleteNotePermanently,

        archivedNotes,
        deletedNotes,

        addJournalEntry: journalCRUD.add,
        updateJournalEntry: journalCRUD.update,
        deleteJournalEntry: journalCRUD.delete,

        addResource: resourceCRUD.add,
        updateResource: resourceCRUD.update,
        deleteResource: resourceCRUD.delete,

        activeBlocks,
        setActiveBlocks,
        fetchEntity,
        fetchBlocks,
        addBlock,
        updateBlock,
        deleteBlock,
        bulkUpdateBlocks,
        media,
        fetchMedia,
        isFetched: (endpoint) => fetchedEndpoints.has(endpoint)
    }), [
        tasks, projects, goals, notes, journal, areas, resources, archive,
        viewPreferences, sidebarCollapsed, loading, session, isAuthenticated,
        taskCRUD, projectCRUD, goalCRUD, noteCRUD, journalCRUD, resourceCRUD,
        fetchEndpoint, fetchMedia, archiveNote, recycleNote, restoreNote, deleteNotePermanently,
        archivedNotes, deletedNotes, activeBlocks, fetchEntity, fetchBlocks,
        addBlock, updateBlock, deleteBlock, bulkUpdateBlocks, media, fetchedEndpoints
    ])

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function AppProvider({ children }) {
    return (
        <SessionProvider>
            <AppContextInner>{children}</AppContextInner>
        </SessionProvider>
    )
}