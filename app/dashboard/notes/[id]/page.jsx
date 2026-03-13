'use client'

import { useApp } from '@/context/AppContext'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import BlockEditor from '@/components/editor/BlockEditor'
import ReadOnlyBlock from '@/components/editor/ReadOnlyBlock'
import { ArrowLeft, Trash2, FileText, Save, Share2, X, FolderOpen, Check } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Loader from '@/components/ui/Loader'
import {
    WhatsappShareButton, WhatsappIcon,
    TwitterShareButton, TwitterIcon,
    TelegramShareButton, TelegramIcon,
    EmailShareButton, EmailIcon
} from 'react-share'

export default function NoteEditorPage() {
    const { id } = useParams()
    const router = useRouter()
    const {
        notes, updateNote, deleteNote, loading, projects, fetchEndpoint,
        activeBlocks, fetchBlocks, bulkUpdateBlocks, setActiveBlocks, fetchEntity
    } = useApp()

    const note = notes.find(n => n.id === id)

    useEffect(() => {
        if (id && !note) {
            fetchEntity('Note', id).catch(e => console.error('Fetch note failed', e))
        }
    }, [id, note, fetchEntity])
    const project = projects?.find(p => note?.projectIds?.includes(p.id))

    useEffect(() => {
        if (!note?.projectIds?.length) return
        const has = projects && note.projectIds.some(id => projects.find(p => p.id === id))
        if (!has) fetchEndpoint('projects')
    }, [note?.projectIds, projects, fetchEndpoint])

    const [title, setTitle] = useState('')
    const [projectIds, setProjectIds] = useState([])
    const [projectMenuOpen, setProjectMenuOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)
    const [savedBlocks, setSavedBlocks] = useState([])
    const [ready, setReady] = useState(false)
    const [notFoundDelay, setNotFoundDelay] = useState(false)
    const [initialized, setInitialized] = useState(false)
    const [shareUrl, setShareUrl] = useState('')
    const [pdfModalOpen, setPdfModalOpen] = useState(false)
    const [pdfTheme, setPdfTheme] = useState('bright')
    const [pdfGenerating, setPdfGenerating] = useState(false)
    const [sharing, setSharing] = useState(false)

    useEffect(() => {
        if (id) fetchBlocks(id, 'Note')
    }, [id, fetchBlocks])

    useEffect(() => {
        if (!loading && note && !initialized) {
            const draftStr = localStorage.getItem(`note_draft_${id}`)
            if (draftStr) {
                try {
                    const draft = JSON.parse(draftStr)
                    setTitle(draft.title || note.title || '')
                    setProjectIds(draft.projectIds || note.projectIds || [])
                    if (draft.blocks && draft.blocks.length > 0) {
                        setActiveBlocks(draft.blocks)
                        setSavedBlocks(note.content || []) // This will be compared against
                    }
                    setLastSaved('Draft (Unsaved)')
                } catch (e) {
                    setTitle(note.title || '')
                    setProjectIds(note.projectIds || [])
                }
            } else {
                setTitle(note.title || '')
                setProjectIds(note.projectIds || [])
                setLastSaved(note.updatedAt)
                // When first loading, activeBlocks will be what we fetched.
                // We shouldn't compare against note.content (which is empty).
                // Instead, we use a trick: the first time we get blocks, we mark them as saved.
            }

            setInitialized(true)
            setTimeout(() => setReady(true), 100)
            setNotFoundDelay(false)
        } else if (!loading && !note) {
            const timer = setTimeout(() => { setNotFoundDelay(true) }, 400)
            return () => clearTimeout(timer)
        }
    }, [note, loading, id, initialized, setActiveBlocks])

    useEffect(() => {
        if (initialized && activeBlocks?.length === 0 && !loading) {
            setActiveBlocks([{ id: `b-init-${Date.now()}`, type: 'paragraph', content: '', order: 0 }])
        }
        // If we just loaded blocks for the first time and they are the initial blocks,
        // mark them as the "saved" blocks so we don't immediately trigger Draft status.
        if (initialized && activeBlocks?.length > 0 && savedBlocks.length === 0 && lastSaved !== 'Draft (Unsaved)') {
            setSavedBlocks(activeBlocks)
        }
    }, [initialized, activeBlocks, loading, savedBlocks.length, lastSaved, setActiveBlocks])

    useEffect(() => {
        if (!ready || !note) return

        const isTitleChanged = title !== (note.title || '')
        const currentBlocksStr = JSON.stringify(activeBlocks || [])
        const savedBlocksStr = JSON.stringify(savedBlocks || [])
        const isProjectIdsChanged = JSON.stringify(projectIds) !== JSON.stringify(note.projectIds || [])

        if (isTitleChanged || currentBlocksStr !== savedBlocksStr || isProjectIdsChanged) {
            localStorage.setItem(`note_draft_${id}`, JSON.stringify({ title, blocks: activeBlocks, projectIds }))
            if (lastSaved !== 'Draft (Unsaved)') {
                setLastSaved('Draft (Unsaved)')
            }
        } else {
            localStorage.removeItem(`note_draft_${id}`)
            if (lastSaved === 'Draft (Unsaved)') {
                setLastSaved(note.updatedAt)
            }
        }
    }, [title, activeBlocks, ready, id, note, lastSaved, projectIds, savedBlocks])

    const handleSave = useCallback(async () => {
        if (!note) return
        setIsSaving(true)
        try {
            await Promise.all([
                updateNote(id, { title, projectIds }),
                bulkUpdateBlocks(id, 'Note', activeBlocks)
            ])
            localStorage.removeItem(`note_draft_${id}`)
            setSavedBlocks(activeBlocks)
            setLastSaved(new Date())
        } catch (err) {
            console.error('Save failed', err)
        } finally {
            setIsSaving(false)
        }
    }, [note, id, title, activeBlocks, updateNote, bulkUpdateBlocks, projectIds])

    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault()
                handleSave()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [handleSave])

    const handleShare = async () => {
        setSharing(true)
        try {
            const res = await fetch(`/api/notes/${id}/share`, { method: 'POST' })
            if (res.ok) {
                const { id: sharedId } = await res.json()
                const url = `${window.location.origin}/share/${sharedId}`
                setShareUrl(url)
            }
        } catch (err) {
            console.error('Share failed', err)
        } finally {
            setSharing(false)
        }
    }

    const handleDownloadPDF = async () => {
        setPdfGenerating(true)
        try {
            const response = await fetch(`/api/notes/${id}/pdf?theme=${pdfTheme}`)
            if (!response.ok) throw new Error('PDF conversion failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${title || 'Note'}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            setPdfModalOpen(false)
        } catch (err) {
            console.error('PDF generation failed', err)
            toast.error('PDF generation failed. Please try again.')
        } finally {
            setPdfGenerating(false)
        }
    }

    const handleDelete = () => {
        deleteNote(id)
        router.push('/dashboard/notes')
    }

    return (
        <div className="flex flex-col h-full bg-notion-bg relative">

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-notion-bg/50 backdrop-blur-sm z-50">
                    <Loader />
                </div>
            )}

            {!loading && !note && notFoundDelay && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <p className="text-notion-muted text-sm mb-3 font-medium">Note not found</p>
                        <Link href="/dashboard/notes" className="text-sm text-notion-accent hover:underline font-semibold">
                            ← Back to Notes
                        </Link>
                    </div>
                </div>
            )}

            {!loading && note && (
                <div className={`flex flex-col h-full transition-all duration-300 ease-out ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

                    {/* Header: Responsive Gap and Padding */}
                    <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 border-b border-notion-border bg-notion-bg/80 backdrop-blur-md z-10 sticky top-0">
                        <Link href="/dashboard/notes" className="p-1.5 rounded-lg hover:bg-notion-hover text-notion-muted hover:text-notion-text transition-all flex-shrink-0">
                            <ArrowLeft size={16} />
                        </Link>

                        <div className="flex-1 flex items-center gap-2 min-w-0">
                            <span className="hidden sm:inline text-xs font-semibold text-notion-muted uppercase tracking-wider">Notes</span>
                            <span className="hidden sm:inline text-xs text-[#d3d1cb]">/</span>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-sm font-bold text-notion-text bg-transparent focus:outline-none flex-1 truncate"
                            />
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-[#2eaadc]'}`} />
                                <span className="text-[9px] sm:text-[10px] font-bold text-notion-muted uppercase tracking-tighter max-w-[60px] sm:max-w-none truncate">
                                    {isSaving ? 'Saving...' : lastSaved === 'Draft (Unsaved)' ? 'Draft' : lastSaved ? `Saved ${format(new Date(lastSaved), 'h:mm')}` : 'New'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 border-r border-notion-border pr-2">
                                    <button
                                        onClick={handleShare}
                                        title="Share Note"
                                        className="p-1.5 rounded-lg hover:bg-notion-hover text-notion-muted transition-all relative"
                                    >
                                        {sharing ? (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : (
                                            <Share2 size={15} />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setPdfModalOpen(true)}
                                        title="Download PDF"
                                        className="p-1.5 rounded-lg hover:bg-notion-hover text-notion-muted transition-all"
                                    >
                                        <FileText size={15} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="text-sm font-medium text-notion-text px-3 py-1.5 rounded-lg bg-[#f1f1ef] dark:bg-[#202020] hover:bg-notion-border transition-all flex items-center gap-2"
                                >
                                    <Save size={14} className={isSaving ? 'animate-spin' : ''} />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                            <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-notion-muted hover:text-red-500">
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto py-8 md:py-12 px-4 md:px-6 bg-notion-card">
                        <div className="max-w-3xl mx-auto">
                            <div className="mb-6 md:mb-10">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Untitled Note"
                                    className="w-full text-3xl md:text-5xl font-extrabold text-notion-text bg-transparent focus:outline-none placeholder-[#d3d1cb] tracking-tight leading-tight"
                                />

                                <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-6">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f1f1ef] text-notion-muted text-[10px] md:text-xs font-bold rounded-lg border border-notion-border/50 uppercase tracking-wider">
                                        <FileText size={12} /> Note
                                    </div>

                                    <div className="relative">
                                        <button
                                            onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                                            className="flex items-center gap-1.5 px-2.5 py-1 bg-notion-bg text-notion-muted hover:bg-notion-hover text-[10px] md:text-xs font-semibold rounded-lg border border-notion-border transition-colors"
                                        >
                                            <FolderOpen size={12} />
                                            {projectIds.length === 0 ? 'Add Project' :
                                                projectIds.length === 1 ? projects?.find(p => p.id === projectIds[0])?.title || '1 Project' :
                                                    `${projectIds.length} Projects`}
                                        </button>

                                        {projectMenuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setProjectMenuOpen(false)}></div>
                                                <div className="absolute top-full mt-1 left-0 z-50 w-64 bg-notion-bg border border-notion-border rounded-xl shadow-lg py-2 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="px-3 py-1 text-[10px] font-bold text-notion-muted uppercase tracking-widest">Select Projects</div>
                                                    {projects?.map(p => {
                                                        const isSelected = projectIds.includes(p.id);
                                                        return (
                                                            <button
                                                                key={p.id}
                                                                onClick={() => {
                                                                    if (isSelected) setProjectIds(projectIds.filter(id => id !== p.id));
                                                                    else setProjectIds([...projectIds, p.id]);
                                                                }}
                                                                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-notion-hover text-left text-xs text-notion-text transition-colors"
                                                            >
                                                                <span className="truncate pr-2 font-medium">{p.title}</span>
                                                                {isSelected && <Check size={14} className="text-blue-500 flex-shrink-0" />}
                                                            </button>
                                                        )
                                                    })}
                                                    {(!projects || projects.length === 0) && (
                                                        <div className="px-3 py-2 text-xs text-notion-muted italic">No projects found.</div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {note.tags?.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 md:px-2.5 md:py-1 bg-notion-bg text-notion-muted text-[10px] md:text-xs font-semibold rounded-lg border border-notion-border">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="min-h-[60vh] pb-32">
                                <BlockEditor
                                    blocks={activeBlocks}
                                    onChange={setActiveBlocks}
                                    isDiary={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Share Dropdown */}
            {shareUrl && (
                <div className="fixed inset-0 bg-black/5 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-notion-bg rounded-2xl shadow-2xl border border-notion-border p-6 w-full max-w-sm relative">
                        <button
                            onClick={() => setShareUrl('')}
                            className="absolute top-4 right-4 text-notion-muted hover:text-notion-text"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="font-bold text-notion-text mb-2 flex items-center gap-2">
                            <Share2 size={18} className="text-blue-500" />
                            Share Note
                        </h3>
                        <p className="text-sm text-notion-muted mb-4 uppercase tracking-widest font-bold text-[10px]">Invite Others to Read</p>

                        <div className="flex items-center gap-2 p-2 bg-notion-sidebar rounded-lg border border-notion-border mb-6">
                            <input
                                readOnly
                                value={shareUrl}
                                className="bg-transparent text-xs text-notion-text flex-1 outline-none font-mono truncate"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(shareUrl)
                                    toast.success('Link copied!')
                                }}
                                className="p-1.5 bg-notion-bg border border-notion-border rounded-md text-[10px] font-bold hover:bg-notion-hover uppercase shadow-sm"
                            >
                                Copy
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <WhatsappShareButton url={shareUrl} title={title}>
                                <div className="flex flex-col items-center gap-1.5">
                                    <WhatsappIcon size={36} round />
                                    <span className="text-[10px] text-notion-muted font-medium">WhatsApp</span>
                                </div>
                            </WhatsappShareButton>
                            <TwitterShareButton url={shareUrl} title={title}>
                                <div className="flex flex-col items-center gap-1.5">
                                    <TwitterIcon size={36} round />
                                    <span className="text-[10px] text-notion-muted font-medium">Twitter</span>
                                </div>
                            </TwitterShareButton>
                            <TelegramShareButton url={shareUrl} title={title}>
                                <div className="flex flex-col items-center gap-1.5">
                                    <TelegramIcon size={36} round />
                                    <span className="text-[10px] text-notion-muted font-medium">Telegram</span>
                                </div>
                            </TelegramShareButton>
                            <EmailShareButton url={shareUrl} subject={title}>
                                <div className="flex flex-col items-center gap-1.5">
                                    <EmailIcon size={36} round />
                                    <span className="text-[10px] text-notion-muted font-medium">Email</span>
                                </div>
                            </EmailShareButton>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF THEME MODAL */}
            {pdfModalOpen && (
                <div className="fixed inset-0 bg-[#37352f]/40 backdrop-blur-[2px] z-[100] flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-notion-bg w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-notion-border">
                        <div className="px-6 py-5 border-b border-notion-border flex justify-between items-center">
                            <h3 className="font-bold text-notion-text">Export to PDF</h3>
                            <button onClick={() => setPdfModalOpen(false)} className="text-notion-muted hover:text-notion-text transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-notion-muted mb-6">Choose a style for your SecondBrain export:</p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button
                                    onClick={() => setPdfTheme('bright')}
                                    className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${pdfTheme === 'bright' ? 'border-notion-accent bg-notion-accent/5 ring-4 ring-notion-accent/10' : 'border-notion-border hover:border-notion-muted'}`}
                                >
                                    <div className="w-full aspect-[4/3] bg-white border border-notion-border rounded-lg shadow-sm flex items-center justify-center">
                                        <div className="w-2/3 space-y-1.5">
                                            <div className="h-1.5 w-full bg-gray-200 rounded"></div>
                                            <div className="h-1 w-2/3 bg-gray-100 rounded"></div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-notion-text">Bright Mode</span>
                                    {pdfTheme === 'bright' && <div className="absolute top-2 right-2 w-4 h-4 bg-notion-accent rounded-full flex items-center justify-center text-[10px] text-white">✓</div>}
                                </button>

                                <button
                                    onClick={() => setPdfTheme('dark')}
                                    className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${pdfTheme === 'dark' ? 'border-notion-accent bg-notion-accent/5 ring-4 ring-notion-accent/10' : 'border-notion-border hover:border-notion-muted'}`}
                                >
                                    <div className="w-full aspect-[4/3] bg-[#191919] border border-gray-800 rounded-lg shadow-sm flex items-center justify-center">
                                        <div className="w-2/3 space-y-1.5">
                                            <div className="h-1.5 w-full bg-gray-700 rounded"></div>
                                            <div className="h-1 w-2/3 bg-gray-600 rounded"></div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-notion-text">Dark Mode</span>
                                    {pdfTheme === 'dark' && <div className="absolute top-2 right-2 w-4 h-4 bg-notion-accent rounded-full flex items-center justify-center text-[10px] text-white">✓</div>}
                                </button>
                            </div>

                            <button
                                onClick={handleDownloadPDF}
                                disabled={pdfGenerating}
                                className="w-full py-3 bg-notion-text hover:opacity-80 text-notion-bg rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {pdfGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        <span>Generating PDF...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>Download PDF</span>
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-notion-muted mt-4 uppercase tracking-[0.2em] font-bold">SecondBrain Engine 1.0</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}