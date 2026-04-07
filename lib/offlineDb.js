const DB_NAME = 'second-brain-offline'
const DB_VERSION = 2

const STORES = {
    NOTES: 'notes',
    PROJECTS: 'projects',
    TASKS: 'tasks',
    NOTE_BLOCKS: 'noteBlocks',
    IMAGES: 'images'
}

const IMAGE_CACHE_BATCH_SIZE = 5

const canUseDb = () => typeof window !== 'undefined' && typeof indexedDB !== 'undefined'

const requestToPromise = (request) => new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
})

const filterValidItems = (items = []) => items.filter(item => item?.id)

const openDb = () => {
    if (!canUseDb()) return Promise.resolve(null)
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains(STORES.NOTES)) {
                db.createObjectStore(STORES.NOTES, { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
                db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains(STORES.TASKS)) {
                db.createObjectStore(STORES.TASKS, { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains(STORES.NOTE_BLOCKS)) {
                db.createObjectStore(STORES.NOTE_BLOCKS, { keyPath: 'noteId' })
            }
            if (!db.objectStoreNames.contains(STORES.IMAGES)) {
                db.createObjectStore(STORES.IMAGES, { keyPath: 'url' })
            }
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

const setAll = async (storeName, items = []) => {
    const db = await openDb()
    if (!db) return
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        store.clear()
        filterValidItems(items).forEach(item => store.put(item))
        tx.oncomplete = () => resolve(true)
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
    })
}

const upsertAll = async (storeName, items = []) => {
    const db = await openDb()
    if (!db) return
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        filterValidItems(items).forEach(item => store.put(item))
        tx.oncomplete = () => resolve(true)
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
    })
}

const getAll = async (storeName) => {
    const db = await openDb()
    if (!db) return []
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    return requestToPromise(store.getAll())
}

const getOne = async (storeName, key) => {
    const db = await openDb()
    if (!db) return null
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    return requestToPromise(store.get(key))
}

export const getOfflineNotes = async () => getAll(STORES.NOTES)
export const setOfflineNotes = async (notes) => setAll(STORES.NOTES, notes)
export const upsertOfflineNotes = async (notes) => upsertAll(STORES.NOTES, notes)

export const getOfflineProjects = async () => getAll(STORES.PROJECTS)
export const setOfflineProjects = async (projects) => setAll(STORES.PROJECTS, projects)
export const upsertOfflineProjects = async (projects) => upsertAll(STORES.PROJECTS, projects)

export const getOfflineTasks = async () => getAll(STORES.TASKS)
export const setOfflineTasks = async (tasks) => setAll(STORES.TASKS, tasks)
export const upsertOfflineTasks = async (tasks) => upsertAll(STORES.TASKS, tasks)

export const getOfflineNoteBlocks = async (noteId) => {
    const record = await getOne(STORES.NOTE_BLOCKS, noteId)
    return record?.blocks || null
}

export const setOfflineNoteBlocks = async (noteId, blocks) => {
    const db = await openDb()
    if (!db) return
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.NOTE_BLOCKS, 'readwrite')
        const store = tx.objectStore(STORES.NOTE_BLOCKS)
        store.put({ noteId, blocks, updatedAt: Date.now() })
        tx.oncomplete = () => resolve(true)
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
    })
}

export const getOfflineImage = async (url) => {
    if (!url) return null
    const record = await getOne(STORES.IMAGES, url)
    return record?.blob || null
}

export const setOfflineImage = async (url, blob) => {
    if (!url || !blob) return
    const db = await openDb()
    if (!db) return
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.IMAGES, 'readwrite')
        const store = tx.objectStore(STORES.IMAGES)
        store.put({ url, blob, updatedAt: Date.now() })
        tx.oncomplete = () => resolve(true)
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
    })
}

export const cacheOfflineImage = async (url) => {
    if (!url) return null
    const existing = await getOfflineImage(url)
    if (existing) return existing
    if (typeof navigator !== 'undefined' && !navigator.onLine) return null
    try {
        const response = await fetch(url)
        if (!response.ok) return null
        const blob = await response.blob()
        await setOfflineImage(url, blob)
        return blob
    } catch (err) {
        console.error('Offline image cache failed for', url, err)
        return null
    }
}

export const cacheImagesFromBlocks = async (blocks = []) => {
    if (!blocks?.length) return []
    const urls = Array.from(new Set(
        blocks
            .filter(block => block?.type === 'image' && block?.content)
            .map(block => block.content)
    ))
    if (urls.length === 0) return []
    for (let i = 0; i < urls.length; i += IMAGE_CACHE_BATCH_SIZE) {
        const batch = urls.slice(i, i + IMAGE_CACHE_BATCH_SIZE)
        await Promise.allSettled(batch.map(url => cacheOfflineImage(url)))
    }
    return urls
}
