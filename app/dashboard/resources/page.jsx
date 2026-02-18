'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import ViewSwitcher from '@/components/views/ViewSwitcher'
import TableView from '@/components/views/TableView'
import ListView from '@/components/views/ListView'
import { Plus, BookOpen, ExternalLink, Trash2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'

const COLUMNS = [
    { key: 'title', label: 'Title', type: 'text', width: 220 },
    { key: 'type', label: 'Type', type: 'text', width: 100 },
    { key: 'status', label: 'Status', type: 'status', width: 120 },
    { key: 'tags', label: 'Tags', type: 'tags', width: 150 },
    { key: 'url', label: 'URL', type: 'text', width: 200 },
]

const RESOURCE_TYPES = ['Book', 'Article', 'Website', 'Video', 'Course', 'Podcast', 'Tool', 'Other']

export default function ResourcesPage() {
    const { resources, addResource, updateResource, deleteResource, viewPreferences } = useApp()
    const [view, setView] = useState(viewPreferences['Resources'] || 'list')
    const [showAdd, setShowAdd] = useState(false)
    const [form, setForm] = useState({ title: '', type: 'Book', url: '', tags: '', status: 'To Read', notes: '' })

    const handleAdd = (e) => {
        e.preventDefault()
        if (!form.title.trim()) return
        addResource({
            ...form,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        })
        setForm({ title: '', type: 'Book', url: '', tags: '', status: 'To Read', notes: '' })
        setShowAdd(false)
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e9e9e7] flex-wrap">
                <ViewSwitcher activeView={view} onViewChange={setView} tabName="Resources" />
                <div className="ml-auto">
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#37352f] text-white text-xs font-medium rounded-md hover:bg-[#2f2d28] transition-colors"
                    >
                        <Plus size={13} />
                        Add Resource
                    </button>
                </div>
            </div>

            <div className="flex gap-4 px-6 py-2 border-b border-[#e9e9e7] text-xs text-[#9b9a97]">
                {['Book', 'Article', 'Website', 'Video', 'Course'].map(type => (
                    <span key={type}>{resources.filter(r => r.type === type).length} {type}s</span>
                ))}
            </div>

            <div className="flex-1 overflow-auto">
                {view === 'table' && (
                    <TableView items={resources} columns={COLUMNS} onUpdate={updateResource} onDelete={deleteResource} onAdd={() => setShowAdd(true)} entityType="resource" />
                )}
                {view === 'list' && (
                    <ListView items={resources} columns={COLUMNS} onUpdate={updateResource} onDelete={deleteResource} onAdd={() => setShowAdd(true)} entityType="resource" />
                )}
                {(view === 'board' || view === 'calendar') && (
                    <div className="p-6 text-center text-[#9b9a97] text-sm">Switch to Table or List view for Resources</div>
                )}
            </div>

            {showAdd && (
                <Modal title="Add Resource" onClose={() => setShowAdd(false)} size="sm">
                    <form onSubmit={handleAdd} className="space-y-3">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Title"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2eaadc]/30"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="px-2 py-1.5 text-xs border border-[#e9e9e7] rounded-md focus:outline-none">
                                {RESOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="px-2 py-1.5 text-xs border border-[#e9e9e7] rounded-md focus:outline-none">
                                {['To Read', 'Reading', 'Completed', 'Active'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <input type="url" placeholder="URL (optional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="w-full px-3 py-1.5 text-xs border border-[#e9e9e7] rounded-md focus:outline-none" />
                        <input type="text" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="w-full px-3 py-1.5 text-xs border border-[#e9e9e7] rounded-md focus:outline-none" />
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-3 py-2 text-xs border border-[#e9e9e7] rounded-md hover:bg-[#f7f7f5]">Cancel</button>
                            <button type="submit" className="flex-1 px-3 py-2 text-xs text-white bg-[#37352f] rounded-md hover:bg-[#2f2d28]">Add</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}
