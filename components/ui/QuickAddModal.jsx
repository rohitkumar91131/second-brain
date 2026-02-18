'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import Modal from './Modal'
import { CheckSquare, FileText, FolderOpen, Target } from 'lucide-react'
import { format } from 'date-fns'

const TYPES = [
    { key: 'task', label: 'Task', icon: CheckSquare, color: 'text-blue-600' },
    { key: 'note', label: 'Note', icon: FileText, color: 'text-green-600' },
    { key: 'project', label: 'Project', icon: FolderOpen, color: 'text-purple-600' },
    { key: 'goal', label: 'Goal', icon: Target, color: 'text-orange-600' },
]

export default function QuickAddModal({ onClose, defaultType = 'task' }) {
    const router = useRouter()
    const { addTask, addNote, addProject, addGoal } = useApp()
    const [type, setType] = useState(defaultType)
    const [title, setTitle] = useState('')
    const [status, setStatus] = useState('Not Started')
    const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [tags, setTags] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) return

        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)
        const base = { title: title.trim(), status, tags: tagArray, dueDate }

        let created
        if (type === 'task') created = await addTask({ ...base, completed: false, priority: 'Medium', projectId: null, notes: '' })
        if (type === 'note') created = await addNote({ ...base, content: [{ id: 'b1', type: 'paragraph', content: '' }] })
        if (type === 'project') created = await addProject({ ...base, progress: 0, areaId: null, description: '' })
        if (type === 'goal') created = await addGoal({ ...base, progress: 0, areaId: null, metric: '' })

        if (created?.id) {
            if (type === 'note') router.push(`/dashboard/notes/${created.id}`)
            if (type === 'project') router.push(`/dashboard/projects/${created.id}`)
            if (type === 'goal') router.push(`/dashboard/goals/${created.id}`)
        }

        onClose()
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
                        className="flex-1 px-3 py-2 text-xs font-medium text-[#37352f] border border-[#e9e9e7] rounded-md hover:bg-[#f7f7f5] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-3 py-2 text-xs font-medium text-white bg-[#37352f] rounded-md hover:bg-[#2f2d28] transition-colors"
                    >
                        Create
                    </button>
                </div>
            </form>
        </Modal>
    )
}
