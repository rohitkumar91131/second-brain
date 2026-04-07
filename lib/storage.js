export const STORAGE_KEYS = {
    TASKS: 'sbt_tasks',
    PROJECTS: 'sbt_projects',
    GOALS: 'sbt_goals',
    NOTES: 'sbt_notes',
    AREAS: 'sbt_areas',
    RESOURCES: 'sbt_resources',
    JOURNAL: 'sbt_journal',
    ARCHIVE: 'sbt_archive',
    SETTINGS: 'sbt_settings',
    INITIALIZED: 'sbt_initialized',
}

export function getStorage(key) {
    if (typeof window === 'undefined') return null
    try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
    } catch (e) {
        console.error('Error reading from localStorage:', e)
        return null
    }
}

export function setStorage(key, value) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
        console.error('Error writing to localStorage:', e)
    }
}

export function removeStorage(key) {
    if (typeof window === 'undefined') return
    try {
        localStorage.removeItem(key)
    } catch (e) {
        console.error('Error removing from localStorage:', e)
    }
}

export function clearAllStorage() {
    if (typeof window === 'undefined') return
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
    })
}
