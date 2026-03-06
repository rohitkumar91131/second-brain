'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReadOnlyBlock from '@/components/editor/ReadOnlyBlock'
import Loader from '@/components/ui/Loader'
import { Plus, Check, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import {
    WhatsappShareButton, WhatsappIcon,
    TwitterShareButton, TwitterIcon,
    TelegramShareButton, TelegramIcon,
    EmailShareButton, EmailIcon
} from 'react-share'

export default function SharePage() {
    const { id } = useParams()
    const router = useRouter()
    const [note, setNote] = useState(null)
    const [loading, setLoading] = useState(true)
    const [importing, setImporting] = useState(false)
    const [importedId, setImportedId] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchSharedNote = async () => {
            try {
                const res = await fetch(`/api/shared/${id}`)
                if (!res.ok) throw new Error('Shared note not found')
                const data = await res.json()
                setNote(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchSharedNote()
    }, [id])

    const handleImport = async () => {
        setImporting(true)
        try {
            const res = await fetch(`/api/shared/${id}/import`, { method: 'POST' })
            if (res.ok) {
                const { id: newId } = await res.json()
                setImportedId(newId)
                // Optional: Redirect after a delay or show a success state
            } else if (res.status === 401) {
                // Redirect to login if not authenticated
                router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`)
            }
        } catch (err) {
            console.error('Import failed', err)
        } finally {
            setImporting(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-notion-bg">
            <Loader />
        </div>
    )

    if (error || !note) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-notion-bg p-4">
            <h1 className="text-xl font-bold text-notion-text mb-2">Note not found</h1>
            <p className="text-notion-muted text-sm mb-6">The link might be invalid or the note has been unshared.</p>
            <Link href="/" className="text-notion-accent hover:underline text-sm font-medium">Go home</Link>
        </div>
    )

    return (
        <div className="min-h-screen bg-notion-bg">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-notion-bg/80 backdrop-blur-md border-b border-notion-border px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-notion-accent rounded-md flex items-center justify-center text-white font-bold text-xs">B</div>
                        <span className="font-bold text-sm text-notion-text">Second Brain</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {importedId ? (
                            <Link
                                href={`/dashboard/notes/${importedId}`}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-green-500/20"
                            >
                                <Check size={14} /> View in My Notes <ArrowRight size={14} />
                            </Link>
                        ) : (
                            <button
                                onClick={handleImport}
                                disabled={importing}
                                className="flex items-center gap-2 px-4 py-2 bg-notion-accent hover:bg-notion-accent/90 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-notion-accent/20 disabled:opacity-50"
                            >
                                {importing ? (
                                    <>Importing...</>
                                ) : (
                                    <>
                                        <Plus size={14} /> Add to My Notes
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-3xl mx-auto py-16 px-6">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-notion-text tracking-tight mb-4">
                        {note.title}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-notion-muted font-medium">
                        <span>Shared on {format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                </header>

                <div className="space-y-1">
                    {note.blocks.map((block, idx) => {
                        // Compute list number for numbered blocks
                        let listNum = 0;
                        if (block.type === 'numbered') {
                            for (let i = 0; i <= idx; i++) {
                                if (note.blocks[i].type === 'numbered') listNum++;
                                else listNum = 0;
                            }
                        }

                        return (
                            <ReadOnlyBlock
                                key={idx}
                                block={block}
                                listNumber={listNum}
                            />
                        )
                    })}
                </div>

                <div className="mt-16 p-6 bg-[#f1f1ef]/30 rounded-2xl border border-notion-border/50 flex flex-col items-center gap-4 text-center">
                    <p className="text-[10px] font-bold text-notion-muted uppercase tracking-widest">Share this note</p>
                    <div className="flex items-center gap-3">
                        <WhatsappShareButton url={typeof window !== 'undefined' ? window.location.href : ''} title={note.title}>
                            <WhatsappIcon size={40} round />
                        </WhatsappShareButton>
                        <TwitterShareButton url={typeof window !== 'undefined' ? window.location.href : ''} title={note.title}>
                            <TwitterIcon size={40} round />
                        </TwitterShareButton>
                        <TelegramShareButton url={typeof window !== 'undefined' ? window.location.href : ''} title={note.title}>
                            <TelegramIcon size={40} round />
                        </TelegramShareButton>
                        <EmailShareButton url={typeof window !== 'undefined' ? window.location.href : ''} subject={note.title} body={`Check out this note: ${note.title}`}>
                            <EmailIcon size={40} round />
                        </EmailShareButton>
                    </div>
                </div>

                <footer className="mt-20 pt-8 border-t border-notion-border text-center">
                    <p className="text-xs text-notion-muted">
                        Sent from Second Brain • Build your own digital garden
                    </p>
                </footer>
            </main>
        </div>
    )
}
