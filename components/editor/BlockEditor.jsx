'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Plus, ChevronRight, ChevronDown, Minus, AlertCircle, Heading1, Heading2, Heading3, List, Image as ImageIcon, Video, Table, ListOrdered, Music } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'

const BLOCK_TYPES = [
    { type: 'paragraph', label: 'Text', icon: null },
    { type: 'heading1', label: 'Heading 1', icon: Heading1 },
    { type: 'heading2', label: 'Heading 2', icon: Heading2 },
    { type: 'heading3', label: 'Heading 3', icon: Heading3 },
    { type: 'bullet', label: 'Bullet List', icon: List },
    { type: 'numbered', label: 'Numbered List', icon: ListOrdered },
    { type: 'toggle', label: 'Toggle', icon: ChevronRight },
    { type: 'table', label: 'Table', icon: Table },
    { type: 'divider', label: 'Divider', icon: Minus },
    { type: 'callout', label: 'Callout', icon: AlertCircle },
    { type: 'image', label: 'Image', icon: ImageIcon },
    { type: 'video', label: 'Video', icon: Video },
    { type: 'audio', label: 'Audio', icon: Music },
]

export default function BlockEditor({ blocks, onChange, isDiary = false }) {
    const [showMenu, setShowMenu] = useState(null)
    const [toggleOpen, setToggleOpen] = useState({})

    const updateBlock = useCallback((id, updates) => {
        onChange(blocks.map(b => b.id === id ? { ...b, ...updates } : b))
    }, [blocks, onChange])

    const addBlock = useCallback((afterId, type = 'paragraph') => {
        const idx = blocks.findIndex(b => b.id === afterId)
        const newOrder = idx + 1
        const newBlock = { id: `b-${Date.now()}`, type, content: '', order: newOrder }
        const newBlocks = [...blocks]
        newBlocks.splice(newOrder, 0, newBlock)

        // Re-assign orders to all blocks to keep them consistent
        const orderedBlocks = newBlocks.map((b, i) => ({ ...b, order: i }))
        onChange(orderedBlocks)
        return newBlock.id
    }, [blocks, onChange])

    const deleteBlock = useCallback((id) => {
        if (blocks.length <= 1) return
        onChange(blocks.filter(b => b.id !== id))
    }, [blocks, onChange])

    const changeType = useCallback((id, type) => {
        updateBlock(id, { type })
        setShowMenu(null)
    }, [updateBlock])

    return (
        <div className={`max-w-3xl mx-auto py-8 px-6 ${isDiary ? 'diary-serif' : ''}`}>
            {blocks.map((block, idx) => (
                <BlockRow
                    key={block.id}
                    block={block}
                    isDiary={isDiary}
                    isFirst={idx === 0}
                    index={idx}
                    showMenu={showMenu === block.id}
                    toggleOpen={toggleOpen[block.id]}
                    onToggleOpen={() => setToggleOpen(prev => ({ ...prev, [block.id]: !prev[block.id] }))}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onAddAfter={(type) => addBlock(block.id, type)}
                    onDelete={() => deleteBlock(block.id)}
                    onShowMenu={() => setShowMenu(showMenu === block.id ? null : block.id)}
                    onHideMenu={() => setShowMenu(null)}
                    onChangeType={(type) => changeType(block.id, type)}
                    onEnter={() => {
                        const newId = addBlock(block.id)
                        setTimeout(() => {
                            document.getElementById(`block-${newId}`)?.focus()
                        }, 50)
                    }}
                    onBackspace={(isEmpty) => {
                        if (isEmpty && blocks.length > 1) {
                            const prevBlock = blocks[idx - 1]
                            deleteBlock(block.id)
                            if (prevBlock) {
                                setTimeout(() => document.getElementById(`block-${prevBlock.id}`)?.focus(), 50)
                            }
                        }
                    }}
                />
            ))}

            <button
                onClick={() => {
                    const last = blocks[blocks.length - 1]
                    if (last) addBlock(last.id)
                }}
                className="flex items-center gap-2 mt-10 mb-20 text-xs text-[#9b9a97] hover:text-[#37352f] transition-colors opacity-40 hover:opacity-100"
            >
                <Plus size={13} />
                Add block
            </button>

            <div className="flex items-center gap-4 py-4 px-2 border-t border-[#e9e9e7] mt-4 opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-[#9b9a97] uppercase tracking-widest">Quick Media:</span>
                <button
                    onClick={() => addBlock(blocks[blocks.length - 1]?.id, 'image')}
                    className="flex items-center gap-1.5 text-xs text-[#37352f] hover:text-pink-600 transition-all font-medium"
                >
                    <ImageIcon size={14} /> Image
                </button>
                <button
                    onClick={() => addBlock(blocks[blocks.length - 1]?.id, 'video')}
                    className="flex items-center gap-1.5 text-xs text-[#37352f] hover:text-blue-600 transition-all font-medium"
                >
                    <Video size={14} /> Video
                </button>
                <button
                    onClick={() => addBlock(blocks[blocks.length - 1]?.id, 'audio')}
                    className="flex items-center gap-1.5 text-xs text-[#37352f] hover:text-purple-600 transition-all font-medium"
                >
                    <Music size={14} /> Audio
                </button>
            </div>
        </div >
    )
}

function BlockRow({ block, index, isDiary, showMenu, toggleOpen, onToggleOpen, onUpdate, onAddAfter, onDelete, onShowMenu, onHideMenu, onChangeType, onEnter, onBackspace }) {
    const inputRef = useRef(null)
    const toggleChildRef = useRef(null)

    useEffect(() => {
        const resize = (ref) => {
            if (ref && ref.current) {
                ref.current.style.height = 'auto'
                ref.current.style.height = ref.current.scrollHeight + 'px'
            }
        }
        resize(inputRef)
        resize(toggleChildRef)
    }, [block.content, block.children, toggleOpen])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (block.content === '/') {
                // Feature 9: Accept / + enter as an empty line clearing the slash
                onUpdate({ content: '' })
                onHideMenu()
            } else {
                onEnter()
            }
        }
        if (e.key === 'Backspace' && !e.target.value) {
            onBackspace(true)
        }
        if (e.key === '/' && !e.target.value) {
            // Immediately open menu but allow writing
            setTimeout(() => onShowMenu(), 10)
        }
        if (e.key === 'Escape') {
            onHideMenu()
        }
    }

    if (block.type === 'video') {
        const getEmbedUrl = (url) => {
            if (!url) return '';
            // YouTube
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
                return `https://www.youtube.com/embed/${videoId}`;
            }
            // Instagram
            if (url.includes('instagram.com')) {
                const parts = url.split('/p/') || url.split('/reel/');
                if (parts[1]) {
                    const id = parts[1].split('/')[0];
                    return `https://www.instagram.com/p/${id}/embed`;
                }
                return url.split('?')[0] + 'embed';
            }
            // Generic video files or other platforms
            return url;
        }

        return (
            <div className="group flex flex-col gap-2 my-6 relative">
                {block.content ? (
                    <div className="relative w-full rounded-lg overflow-hidden bg-black/5 aspect-video border border-[#e9e9e7]">
                        <iframe
                            src={getEmbedUrl(block.content)}
                            className="w-full h-full border-none"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                        <button
                            onClick={onDelete}
                            className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-md text-[#9b9a97] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                            <Minus size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="relative w-full flex flex-col items-center gap-3 bg-[#f7f7f5]/50 border border-dashed border-[#e9e9e7] rounded-xl p-8 transition-colors hover:bg-[#f7f7f5]">
                        <Video size={24} className="text-[#9b9a97] opacity-40" />
                        <div className="w-full max-w-md flex items-center gap-2 bg-white border border-[#e9e9e7] rounded-lg p-1 shadow-sm">
                            <input
                                autoFocus
                                placeholder="Paste YouTube or Instagram link..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onUpdate({ content: e.target.value })
                                    }
                                }}
                                className="flex-1 text-sm p-2 outline-none bg-transparent"
                            />
                            <button
                                className="px-4 py-2 text-xs font-bold bg-[#37352f] text-white rounded-md hover:bg-[#2f2d28] transition-colors shadow-sm"
                                onClick={(e) => {
                                    const val = e.currentTarget.previousSibling.value;
                                    if (val) onUpdate({ content: val })
                                }}
                            >
                                Embed
                            </button>
                        </div>
                        <p className="text-[10px] text-[#9b9a97] font-medium uppercase tracking-widest">Supports YouTube Shorts & Instagram Reels</p>
                    </div>
                )}
            </div>
        )
    }

    if (block.type === 'audio') {
        const getAudioEmbed = (url) => {
            if (!url) return null;
            // YouTube detection
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
                return { type: 'youtube', id: videoId };
            }
            // Direct audio file
            if (url.match(/\.(mp3|wav|ogg|m4a)$/) || url.includes('audio') || url.includes('stream')) {
                return { type: 'direct', url };
            }
            return { type: 'direct', url }; // Fallback
        }

        const embed = getAudioEmbed(block.content);

        return (
            <div className="group flex flex-col gap-2 my-6 relative">
                {block.content ? (
                    <div className="relative w-full p-4 rounded-xl bg-white border border-[#e9e9e7] shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#f1f1ef] flex items-center justify-center text-[#9b9a97]">
                                <Music size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-[#9b9a97] uppercase tracking-widest leading-none mb-1">Audio Source</p>
                                <p className="text-xs text-[#37352f] truncate font-medium">{block.content}</p>
                            </div>
                            <button
                                onClick={onDelete}
                                className="p-1.5 rounded-md text-[#9b9a97] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Minus size={14} />
                            </button>
                        </div>

                        {embed.type === 'youtube' ? (
                            <div className="w-full">
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-[#f1f1ef] to-white border border-[#e9e9e7]">
                                    <button
                                        onClick={() => {
                                            const iframe = document.getElementById(`yt-audio-${block.id}`);
                                            if (iframe) {
                                                const currentSrc = iframe.src;
                                                if (currentSrc.includes('autoplay=1')) {
                                                    iframe.src = currentSrc.replace('autoplay=1', 'autoplay=0');
                                                } else {
                                                    iframe.src = currentSrc + '&autoplay=1';
                                                }
                                            }
                                        }}
                                        className="w-12 h-12 rounded-full bg-[#37352f] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                                    >
                                        <div className="flex gap-1 items-end h-4">
                                            <div className="w-1 bg-white/40 h-2 animate-pulse"></div>
                                            <div className="w-1 bg-white h-4 animate-pulse"></div>
                                            <div className="w-1 bg-white/60 h-3 animate-pulse"></div>
                                        </div>
                                    </button>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[#37352f]">YouTube Audio Player</p>
                                        <p className="text-[10px] text-[#9b9a97] uppercase font-bold tracking-tighter">Click to Play/Pause • Video is hidden</p>
                                    </div>
                                    <div className="h-0 w-0 overflow-hidden pointer-events-none absolute">
                                        <iframe
                                            id={`yt-audio-${block.id}`}
                                            src={`https://www.youtube.com/embed/${embed.id}?rel=0&modestbranding=1&enablejsapi=1`}
                                            allow="autoplay; encrypted-media"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <audio controls className="w-full h-10">
                                <source src={block.content} />
                            </audio>
                        )}
                    </div>
                ) : (
                    <div className="relative w-full flex flex-col items-center gap-3 bg-[#f7f7f5]/50 border border-dashed border-[#e9e9e7] rounded-xl p-8 transition-colors hover:bg-[#f7f7f5]">
                        <Music size={24} className="text-[#9b9a97] opacity-40" />
                        <div className="w-full max-w-md flex items-center gap-2 bg-white border border-[#e9e9e7] rounded-lg p-1 shadow-sm">
                            <input
                                autoFocus
                                placeholder="Paste Audio URL or YouTube link..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onUpdate({ content: e.target.value })
                                    }
                                }}
                                className="flex-1 text-sm p-2 outline-none bg-transparent"
                            />
                            <button
                                className="px-4 py-2 text-xs font-bold bg-[#37352f] text-white rounded-md hover:bg-[#2f2d28] transition-colors shadow-sm"
                                onClick={(e) => {
                                    const val = e.currentTarget.previousSibling.value;
                                    if (val) onUpdate({ content: val })
                                }}
                            >
                                Add
                            </button>
                        </div>
                        <p className="text-[10px] text-[#9b9a97] font-medium uppercase tracking-widest">YouTube links will play in compact player</p>
                    </div>
                )}
            </div>
        )
    }

    if (block.type === 'table') {
        const rows = block.content ? JSON.parse(block.content) : [['', ''], ['', '']];
        const updateCell = (r, c, val) => {
            const newRows = [...rows];
            newRows[r][c] = val;
            onUpdate({ content: JSON.stringify(newRows) });
        };
        const addRow = () => {
            const newRows = [...rows, new Array(rows[0].length).fill('')];
            onUpdate({ content: JSON.stringify(newRows) });
        };
        const addCol = () => {
            const newRows = rows.map(row => [...row, '']);
            onUpdate({ content: JSON.stringify(newRows) });
        };

        return (
            <div className="group my-6 relative overflow-x-auto">
                <table className="w-full border-collapse text-sm text-[#37352f] mb-2">
                    <tbody>
                        {rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="border border-[#e9e9e7] p-2 relative">
                                        <input
                                            value={cell}
                                            onChange={e => updateCell(rIdx, cIdx, e.target.value)}
                                            className="w-full bg-transparent focus:outline-none"
                                            placeholder="..."
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex gap-2">
                    <button onClick={addRow} className="text-[10px] text-[#9b9a97] hover:bg-[#efefef] px-1.5 py-0.5 rounded border border-[#e9e9e7]">Add Row</button>
                    <button onClick={addCol} className="text-[10px] text-[#9b9a97] hover:bg-[#efefef] px-1.5 py-0.5 rounded border border-[#e9e9e7]">Add Column</button>
                    <button onClick={onDelete} className="text-[10px] text-red-400 hover:bg-red-50 px-1.5 py-0.5 rounded border border-[#e9e9e7] ml-auto">Delete Table</button>
                </div>
            </div>
        )
    }

    if (block.type === 'divider') {
        return (
            <div className="group flex items-center gap-2 my-8">
                <hr className="flex-1 border-[#e9e9e7]" />
                <button
                    onClick={onDelete}
                    className="hover-reveal text-xs text-[#9b9a97] hover:text-red-400 transition-colors"
                >×</button>
            </div>
        )
    }

    // --- OFFICIAL CLOUDINARY WIDGET UI ---
    if (block.type === 'image') {
        return (
            <div className="group flex items-start gap-2 my-6 relative">
                <div className="flex-1">
                    {block.content ? (
                        <div className="relative inline-block w-full">
                            <img
                                src={block.content}
                                alt="Block"
                                className="max-w-full rounded-lg border border-[#e9e9e7]"
                            />
                            <button
                                onClick={onDelete}
                                className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-md text-[#9b9a97] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                                <Minus size={14} />
                            </button>
                        </div>
                    ) : (
                        <CldUploadWidget
                            uploadPreset="notes second brain" // 🔥 Apna Preset Name Daalo
                            onSuccess={(result) => {
                                // Jab upload success ho jaye, URL save kar lo
                                if (result.info?.secure_url) {
                                    onUpdate({ content: result.info.secure_url });
                                }
                            }}
                            options={{
                                multiple: false, // Ek baar me ek hi image
                                resourceType: "image",
                                clientAllowedFormats: ["jpeg", "png", "jpg", "webp", "gif"],
                            }}
                        >
                            {({ open }) => {
                                return (
                                    <div
                                        onClick={(e) => {
                                            e.preventDefault();
                                            open(); // Click karne pe widget popup khulega
                                        }}
                                        className="border border-dashed border-[#e9e9e7] bg-[#f7f7f5]/50 hover:bg-[#f7f7f5] transition-colors rounded-lg p-8 flex flex-col items-center justify-center text-sm text-[#9b9a97] w-full cursor-pointer"
                                    >
                                        <ImageIcon size={24} className="mb-2 opacity-40" />
                                        <span className="font-medium hover:text-[#37352f] transition-colors">
                                            Click to add image via link, device, or camera
                                        </span>
                                    </div>
                                )
                            }}
                        </CldUploadWidget>
                    )}
                </div>
            </div>
        )
    }

    if (block.type === 'callout') {
        return (
            <div className={`callout-block my-6 group ${isDiary ? 'border-none bg-[#f1f1ef]/50' : ''}`}>
                <span className="text-lg flex-shrink-0">💡</span>
                <textarea
                    id={`block-${block.id}`}
                    ref={inputRef}
                    value={block.content}
                    onChange={e => onUpdate({ content: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="Callout text..."
                    rows={1}
                    className={`block-editor-line flex-1 text-sm resize-none overflow-hidden leading-relaxed ${isDiary ? 'text-base' : ''}`}
                    style={{ minHeight: '1.5em' }}
                    onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
                />
            </div>
        )
    }

    if (block.type === 'toggle') {
        return (
            <div className="my-2">
                <div className="flex items-start gap-1">
                    <button
                        onClick={onToggleOpen}
                        className="mt-1 p-0.5 text-[#9b9a97] hover:text-[#37352f] transition-colors"
                    >
                        {toggleOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <textarea
                        id={`block-${block.id}`}
                        ref={inputRef}
                        value={block.content}
                        onChange={e => onUpdate({ content: e.target.value })}
                        onKeyDown={handleKeyDown}
                        placeholder="Toggle title..."
                        rows={1}
                        className={`block-editor-line text-sm font-medium flex-1 resize-none overflow-hidden leading-relaxed ${isDiary ? 'text-lg' : ''}`}
                        onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
                    />
                </div>
                {toggleOpen && (
                    <div className="ml-6 pl-3 border-l border-[#e9e9e7] mt-1">
                        <textarea
                            ref={toggleChildRef}
                            value={block.children || ''}
                            onChange={e => onUpdate({ children: e.target.value })}
                            placeholder="Toggle content..."
                            rows={1}
                            className={`block-editor-line text-sm w-full resize-none overflow-hidden text-[#787774] leading-relaxed ${isDiary ? 'text-base' : ''}`}
                            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
                        />
                    </div>
                )}
            </div>
        )
    }

    const getStyles = () => {
        const diaryBase = isDiary ? 'leading-relaxed' : ''
        switch (block.type) {
            case 'heading1': return `${isDiary ? 'text-4xl' : 'text-2xl'} font-bold text-[#37352f] mt-10 mb-4 ${diaryBase}`
            case 'heading2': return `${isDiary ? 'text-3xl' : 'text-xl'} font-semibold text-[#37352f] mt-8 mb-3 ${diaryBase}`
            case 'heading3': return `${isDiary ? 'text-2xl' : 'text-base'} font-semibold text-[#37352f] mt-6 mb-2 ${diaryBase}`
            case 'bullet': return `${isDiary ? 'text-lg' : 'text-sm'} text-[#37352f] ${diaryBase}`
            default: return `${isDiary ? 'text-lg' : 'text-sm'} text-[#37352f] ${diaryBase}`
        }
    }

    return (
        <div className="group flex items-start gap-1 my-0.5 relative">
            {block.type === 'bullet' && (
                <span className="mt-1.5 w-4 flex-shrink-0 text-[#9b9a97] text-sm text-center">•</span>
            )}
            {block.type === 'numbered' && (
                <span className="mt-1.5 w-4 flex-shrink-0 text-[#9b9a97] text-sm text-right mr-1">{index + 1}.</span>
            )}
            <div className="flex-1 relative">
                <textarea
                    id={`block-${block.id}`}
                    ref={inputRef}
                    value={block.content}
                    onChange={e => onUpdate({ content: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder={block.type === 'paragraph' ? "Type '/' for commands..." : `${BLOCK_TYPES.find(b => b.type === block.type)?.label}...`}
                    rows={1}
                    className={`block-editor-line w-full resize-none overflow-hidden ${getStyles()}`}
                    style={{ minHeight: '1.5em' }}
                    onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
                />

                {showMenu && (
                    <div className="absolute top-full left-0 z-50 bg-white border border-[#e9e9e7] rounded-xl shadow-2xl py-2 w-52 animate-fade-in divide-y divide-[#f1f1ef]">
                        <div className="pb-1">
                            <p className="px-3 py-1 text-[10px] font-bold text-[#9b9a97] uppercase tracking-widest">Basics</p>
                            {BLOCK_TYPES.slice(0, 7).map(({ type, label, icon: Icon }) => (
                                <button
                                    key={type}
                                    onClick={() => onChangeType(type)}
                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#37352f] hover:bg-[#f7f7f5] transition-colors"
                                >
                                    {Icon ? <Icon size={13} className="text-[#9b9a97]" /> : <span className="w-3" />}
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="py-1">
                            <p className="px-3 py-1 text-[10px] font-bold text-[#9b9a97] uppercase tracking-widest">Media</p>
                            {BLOCK_TYPES.slice(10).map(({ type, label, icon: Icon }) => (
                                <button
                                    key={type}
                                    onClick={() => onChangeType(type)}
                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#37352f] hover:bg-[#f7f7f5] transition-colors group/item"
                                >
                                    <Icon size={13} className="text-[#9b9a97] group-hover/item:text-[#2eaadc]" />
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="pt-1">
                            <p className="px-3 py-1 text-[10px] font-bold text-[#9b9a97] uppercase tracking-widest">Advanced</p>
                            {BLOCK_TYPES.slice(7, 10).map(({ type, label, icon: Icon }) => (
                                <button
                                    key={type}
                                    onClick={() => onChangeType(type)}
                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#37352f] hover:bg-[#f7f7f5] transition-colors"
                                >
                                    {Icon ? <Icon size={13} className="text-[#9b9a97]" /> : <span className="w-3" />}
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}