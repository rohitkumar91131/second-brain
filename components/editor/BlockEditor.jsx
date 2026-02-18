'use client'

import { useState, useRef, useCallback } from 'react'
import { Plus, ChevronRight, ChevronDown, Minus, AlertCircle, Heading1, Heading2, Heading3, List } from 'lucide-react'

const BLOCK_TYPES = [
    { type: 'paragraph', label: 'Text', icon: null },
    { type: 'heading1', label: 'Heading 1', icon: Heading1 },
    { type: 'heading2', label: 'Heading 2', icon: Heading2 },
    { type: 'heading3', label: 'Heading 3', icon: Heading3 },
    { type: 'bullet', label: 'Bullet List', icon: List },
    { type: 'toggle', label: 'Toggle', icon: ChevronRight },
    { type: 'divider', label: 'Divider', icon: Minus },
    { type: 'callout', label: 'Callout', icon: AlertCircle },
]

export default function BlockEditor({ blocks, onChange, isDiary = false }) {
    const [showMenu, setShowMenu] = useState(null) // blockId
    const [toggleOpen, setToggleOpen] = useState({})

    const updateBlock = useCallback((id, updates) => {
        onChange(blocks.map(b => b.id === id ? { ...b, ...updates } : b))
    }, [blocks, onChange])

    const addBlock = useCallback((afterId, type = 'paragraph') => {
        const idx = blocks.findIndex(b => b.id === afterId)
        const newBlock = { id: `b-${Date.now()}`, type, content: '' }
        const newBlocks = [...blocks]
        newBlocks.splice(idx + 1, 0, newBlock)
        onChange(newBlocks)
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
                        // Focus new block
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

            {/* Add block button */}
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
        </div>
    )
}

function BlockRow({ block, isDiary, showMenu, toggleOpen, onToggleOpen, onUpdate, onAddAfter, onDelete, onShowMenu, onHideMenu, onChangeType, onEnter, onBackspace }) {
    const inputRef = useRef(null)

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onEnter()
        }
        if (e.key === 'Backspace' && !e.target.value) {
            onBackspace(true)
        }
        if (e.key === '/' && !e.target.value) {
            e.preventDefault()
            onShowMenu()
        }
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
                <span className="mt-1.5 w-4 flex-shrink-0 text-[#9b9a97] text-sm">•</span>
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

                {/* Slash command menu */}
                {showMenu && (
                    <div className="absolute top-full left-0 z-50 bg-white border border-[#e9e9e7] rounded-lg shadow-lg py-1 w-48 animate-fade-in">
                        {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
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
                )}
            </div>
        </div>
    )
}
