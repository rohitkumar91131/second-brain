'use client'

import { useState, useCallback } from 'react'
import { Plus, Image as ImageIcon, Video, Music } from 'lucide-react'
import BlockRow from './BlockRow'

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

    // Numbered list ko properly count karne ke liye variable
    let currentListNumber = 0;

    return (
        <div className={`max-w-3xl mx-auto py-8 px-6 ${isDiary ? 'diary-serif' : ''}`}>
            {blocks.map((block, idx) => {
                // List numbering calculation
                if (block.type === 'numbered') {
                    currentListNumber++;
                } else {
                    currentListNumber = 0; // Agar list ke beech me kuch aur aa jaye toh reset kardo
                }

                return (
                    <BlockRow
                        key={block.id}
                        block={block}
                        isDiary={isDiary}
                        index={idx}
                        listNumber={currentListNumber} // Ye naya prop pass kiya hai
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
                            // Automatically keep the list going if hitting enter on a list item
                            const newType = (block.type === 'bullet' || block.type === 'numbered') ? block.type : 'paragraph';
                            const newId = addBlock(block.id, newType);
                            setTimeout(() => {
                                document.getElementById(`block-${newId}`)?.focus()
                            }, 50)
                        }}
                        onBackspace={(isEmpty) => {
                            if (isEmpty) {
                                // Agar list block empty hai, toh delete hone se pehle normal text ban jaye
                                if (block.type !== 'paragraph') {
                                    changeType(block.id, 'paragraph');
                                } else if (blocks.length > 1) {
                                    const prevBlock = blocks[idx - 1]
                                    deleteBlock(block.id)
                                    if (prevBlock) {
                                        setTimeout(() => document.getElementById(`block-${prevBlock.id}`)?.focus(), 50)
                                    }
                                }
                            }
                        }}
                    />
                )
            })}

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
        </div>
    )
}