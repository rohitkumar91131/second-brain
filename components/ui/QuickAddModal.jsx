'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import Modal from './Modal'
import { CheckSquare, FileText, FolderOpen, Target, Loader, Bookmark, Image as ImageIcon } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import { format } from 'date-fns'

const TYPES = [
    { key: 'task', label: 'Task', icon: CheckSquare, color: 'text-blue-600' },
    { key: 'note', label: 'Note', icon: FileText, color: 'text-green-600' },
    { key: 'project', label: 'Project', icon: FolderOpen, color: 'text-purple-600' },
    { key: 'goal', label: 'Goal', icon: Target, color: 'text-orange-600' },
    { key: 'resource', label: 'Resource', icon: Bookmark, color: 'text-yellow-600' },
    { key: 'image', label: 'Image', icon: ImageIcon, color: 'text-pink-600' },
]

export default function QuickAddModal({ onClose, defaultType = 'task', prefilledData = {}, onNoteCreated = null }) {
    const router = useRouter()
    const { addTask, addNote, addProject, addGoal, addResource, projects, bulkUpdateBlocks } = useApp()
    const [type, setType] = useState(defaultType)
    const [isLoading, setIsLoading] = useState(false)

    // Set default title based on project context
    const getDefaultTitle = () => {
        if (prefilledData.projectName && prefilledData.date && (defaultType === 'task' || defaultType === 'note')) {
            const dateStr = format(prefilledData.date, 'MMM d')
            return `${prefilledData.projectName} - ${dateStr}`
        }
        return ''
    }

    const [title, setTitle] = useState(getDefaultTitle())
    const [status, setStatus] = useState('Not Started')
    const [dueDate, setDueDate] = useState(prefilledData.date ? format(prefilledData.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
    const [tags, setTags] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim() || isLoading) return

        setIsLoading(true)

        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)
        const base = { title: title.trim(), status, tags: tagArray, dueDate }

        try {
            let created
            if (type === 'task') created = await addTask({ ...base, completed: false, priority: 'Medium', projectId: prefilledData.projectId || null, notes: '' })
            if (type === 'note') {
                created = await addNote({ ...base, projectId: prefilledData.projectId || null })
                if (created?.id) {
                    await bulkUpdateBlocks(created.id, 'Note', [
                        { type: 'paragraph', content: '', order: 100 }
                    ])
                }
            }
            if (type === 'project') created = await addProject({ ...base, progress: 0, areaId: null, description: '' })
            if (type === 'goal') created = await addGoal({ ...base, progress: 0, areaId: null, metric: '' })
            if (type === 'resource') created = await addResource({ ...base, type: 'Link', url: '', notes: '', areaId: null })

            if (type === 'image') {
                // For images, we just close the modal after upload success handled by widget
                onClose()
                return
            }

            if (created?.id) {
                if (type === 'note' && onNoteCreated) {
                    onNoteCreated(created)
                } else if (type === 'note') {
                    router.push(`/dashboard/notes/${created.id}`)
                }
                if (type === 'project') router.push(`/dashboard/projects/${created.id}`)
                if (type === 'goal') router.push(`/dashboard/goals/${created.id}`)
                if (type === 'resource') router.push(`/dashboard/resources`)
            }

            onClose()
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal title="Quick Add" onClose={onClose} size="sm">
            {/* Type selector */}
            <div className="flex gap-1 mb-4 p-1 bg-[#f7f7f5] rounded-lg">
                {TYPES.map(({ key, label, icon: Icon, color }) => (
                    <button
                        key={key}
                        onClick={() => setType(key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${type === key ? 'bg-white shadow-sm text-[#37352f]' : 'text-[#9b9a97] hover:text-[#37352f]'
                            }`}
                    >
                        <Icon size={13} className={type === key ? color : ''} />
                        {label}
                    </button>
                ))}
            </div>

            {type === 'image' ? (
                <div className="pt-2">
                    <CldUploadWidget
                        uploadPreset="notes second brain"
                        onSuccess={(result) => {
                            if (result.info?.secure_url) {
                                addNote({
                                    title: title.trim() || `Image - ${format(new Date(), 'MMM d, h:mm a')}`,
                                    tags: tags.split(',').map(t => t.trim()).filter(Boolean)
                                }).then(async created => {
                                    if (created?.id) {
                                        await bulkUpdateBlocks(created.id, 'Note', [
                                            { type: 'image', content: result.info.secure_url, order: 100 },
                                            { type: 'paragraph', content: 'Uploaded via Quick Add', order: 200 }
                                        ])
                                        router.push(`/dashboard/notes/${created.id}`)
                                    }
                                    onClose()
                                })
                            }
                        }}
                    >
                        {({ open }) => (
                            <button
                                type="button"
                                onClick={() => open()}
                                className="w-full py-8 border-2 border-dashed border-[#e9e9e7] rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#f7f7f5] transition-colors group"
                            >
                                <ImageIcon size={24} className="text-[#9b9a97] group-hover:text-pink-500 transition-colors" />
                                <span className="text-xs font-medium text-[#37352f]">Click to Upload Image</span>
                                <span className="text-[10px] text-[#9b9a97]">Supports JPG, PNG, WEBP</span>
                            </button>
                        )}
                    </CldUploadWidget>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        autoFocus
                        type="text"
                        placeholder={`${TYPES.find(t => t.key === type)?.label} title...`}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2eaadc]/30 focus:border-[#2eaadc]"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-[#9b9a97] mb-1">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2eaadc]/30"
                            >
                                <option>Not Started</option>
                                <option>In Progress</option>
                                <option>Done</option>
                                <option>On Hold</option>
                                <option>Blocked</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-[#9b9a97] mb-1">Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2eaadc]/30"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-[#9b9a97] mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            placeholder="productivity, work, personal"
                            value={tags}
                            onChange={e => setTags(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2eaadc]/30"
                        />
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-3 py-2 text-xs font-medium text-[#37352f] border border-[#e9e9e7] rounded-md hover:bg-[#f7f7f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-3 py-2 text-xs font-medium text-white bg-[#37352f] rounded-md hover:bg-[#2f2d28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                            {isLoading ? (
                                <>
                                    <Loader size={13} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    )
}
