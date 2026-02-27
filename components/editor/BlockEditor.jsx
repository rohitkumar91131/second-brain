'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Plus, Image as ImageIcon, Video, Music, Save } from 'lucide-react'
import BlockRow from './BlockRow'
import { polyfill } from "mobile-drag-drop"
import "mobile-drag-drop/default.css"

export default function BlockEditor({ blocks, onChange, isDiary = false }) {
    const [showMenu, setShowMenu] = useState(null)
    const [toggleOpen, setToggleOpen] = useState({})
    const [isSaving, setIsSaving] = useState(false)
    const [activeDragId, setActiveDragId] = useState(null)

    // --- NEW STATE: Bahar se drag hone ka visual feedback ---
    const [isExternalDrag, setIsExternalDrag] = useState(false)

    const dragItem = useRef(null)
    const dragOverItem = useRef(null)

    useEffect(() => {
        polyfill({ holdToDrag: 150 });
        const handleTouchMove = (e) => {
            if (document.body.classList.contains('dnd-polyfilled')) {
                e.preventDefault();
            }
        };
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        return () => window.removeEventListener('touchmove', handleTouchMove);
    }, [])

    const handleSort = useCallback(() => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        if (dragItem.current === dragOverItem.current) return;

        const newBlocks = [...blocks];
        const draggedItemContent = newBlocks.splice(dragItem.current, 1)[0];
        newBlocks.splice(dragOverItem.current, 0, draggedItemContent);

        dragItem.current = null;
        dragOverItem.current = null;

        const reOrderedBlocks = newBlocks.map((b, i) => ({ ...b, order: i }));
        onChange(reOrderedBlocks);
    }, [blocks, onChange]);

    // --- EXTERNAL DRAG AND DROP LOGIC ---
    const handleContainerDragOver = (e) => {
        e.preventDefault();
        // Agar internal drag (block reordering) nahi ho raha, iska matlab bahar se kuch aa raha hai
        if (dragItem.current === null) {
            setIsExternalDrag(true);
            e.dataTransfer.dropEffect = 'copy';
        }
    };

    const handleContainerDragLeave = (e) => {
        e.preventDefault();
        setIsExternalDrag(false);
    };

    const handleContainerDrop = (e) => {
        e.preventDefault();
        setIsExternalDrag(false);

        // Agar hum internally blocks ko upar-niche kar rahe hain, toh ye external logic mat chalao
        if (dragItem.current !== null) return;

        const files = Array.from(e.dataTransfer.files);
        let newBlocksToAdd = [];

        // 1. Agar Files drop ki gayi hain (Desktop se Image/Video)
        if (files.length > 0) {
            files.forEach(file => {
                const url = URL.createObjectURL(file); // Local preview URL
                if (file.type.startsWith('image/')) newBlocksToAdd.push({ type: 'image', content: url });
                else if (file.type.startsWith('video/')) newBlocksToAdd.push({ type: 'video', content: url });
                else if (file.type.startsWith('audio/')) newBlocksToAdd.push({ type: 'audio', content: url });
            });
        }
        // 2. Agar Text ya Link drop kiya gaya hai (Browser se)
        else {
            const text = e.dataTransfer.getData('text/plain');
            const urlData = e.dataTransfer.getData('URL') || e.dataTransfer.getData('text/uri-list');
            const content = urlData || text;

            if (content) {
                const lowerContent = content.toLowerCase();

                // YouTube/Vimeo check
                if (lowerContent.includes('youtube.com') || lowerContent.includes('youtu.be') || lowerContent.includes('vimeo.com')) {
                    newBlocksToAdd.push({ type: 'video', content });
                }
                // Image URL check
                else if (lowerContent.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
                    newBlocksToAdd.push({ type: 'image', content });
                }
                // Normal Link check
                else if (content.startsWith('http')) {
                    newBlocksToAdd.push({ type: 'link', content });
                }
                // Normal Text (Multiple lines ko alag-alag paragraph banayega)
                else {
                    const paragraphs = content.split('\n').filter(p => p.trim() !== '');
                    paragraphs.forEach(p => newBlocksToAdd.push({ type: 'paragraph', content: p }));
                }
            }
        }

        // Naye blocks ko array ke end me add karna
        if (newBlocksToAdd.length > 0) {
            const currentBlocks = [...blocks];
            newBlocksToAdd.forEach((b, i) => {
                currentBlocks.push({
                    id: `b-${Date.now()}-${i}`,
                    type: b.type,
                    content: b.content,
                    order: currentBlocks.length
                });
            });
            // Order update karke save karna
            onChange(currentBlocks.map((b, i) => ({ ...b, order: i })));
        }
    };

    // ... (Baki purane functions same rahenge) ...
    const handleSave = async () => { /* ... */ }
    const updateBlock = useCallback((id, updates) => { onChange(blocks.map(b => b.id === id ? { ...b, ...updates } : b)) }, [blocks, onChange])
    const addBlock = useCallback((afterId, type = 'paragraph') => {
        const idx = blocks.findIndex(b => b.id === afterId)
        const newOrder = idx + 1
        const newBlock = { id: `b-${Date.now()}`, type, content: '', order: newOrder }
        const newBlocks = [...blocks]
        newBlocks.splice(newOrder, 0, newBlock)
        onChange(newBlocks.map((b, i) => ({ ...b, order: i })))
        return newBlock.id
    }, [blocks, onChange])
    const deleteBlock = useCallback(async (id) => {
        if (blocks.length <= 1) return
        const isSavedInDb = !id.startsWith('b-');
        if (isSavedInDb) {
            try {
                const response = await fetch(`/api/blocks/${id}`, { method: 'DELETE' });
                if (!response.ok) return;
            } catch (error) { return; }
        }
        onChange(blocks.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i })));
    }, [blocks, onChange])
    const changeType = useCallback((id, type) => {
        updateBlock(id, { type })
        setShowMenu(null)
    }, [updateBlock])

    let currentListNumber = 0;

    return (
        // MAIN CONTAINER: Yahan external drop events aur visual UI lagaya hai
        <div
            className={`max-w-3xl mx-auto py-8 px-6 min-h-screen transition-colors duration-200 ${isDiary ? 'diary-serif' : ''} ${isExternalDrag ? 'bg-blue-50/40 border-2 border-dashed border-blue-300 rounded-2xl' : 'border-2 border-transparent'}`}
            onDragOver={handleContainerDragOver}
            onDragLeave={handleContainerDragLeave}
            onDrop={handleContainerDrop}
        >
            <div className="flex justify-between items-center mb-6">
                {/* External Drop indicator text */}
                <div className={`text-xs font-semibold text-blue-500 transition-opacity ${isExternalDrag ? 'opacity-100' : 'opacity-0'}`}>
                    Drop files, text, or links here...
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#f1f1ef] hover:bg-notion-border text-notion-text text-sm rounded transition-colors"
                >
                    <Save size={14} />
                    {isSaving ? 'Saving...' : 'Save Order'}
                </button>
            </div>

            {blocks.map((block, idx) => {
                if (block.type === 'numbered') currentListNumber++;
                else currentListNumber = 0;

                return (
                    <div
                        key={block.id}
                        draggable={activeDragId === block.id}
                        onDragStart={(e) => {
                            dragItem.current = idx;
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', '');
                        }}
                        onDragEnter={() => (dragOverItem.current = idx)}
                        onDragEnd={() => {
                            handleSort();
                            setActiveDragId(null);
                        }}
                        // Child par drag aane se rokna nahi hai, pass karna hai
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <BlockRow
                            block={block}
                            isDiary={isDiary}
                            index={idx}
                            listNumber={currentListNumber}
                            showMenu={showMenu === block.id}
                            toggleOpen={toggleOpen[block.id]}
                            onToggleOpen={() => setToggleOpen(prev => ({ ...prev, [block.id]: !prev[block.id] }))}
                            onUpdate={(updates) => updateBlock(block.id, updates)}
                            onAddAfter={(type) => addBlock(block.id, type)}
                            onDelete={() => deleteBlock(block.id)}
                            onShowMenu={() => setShowMenu(showMenu === block.id ? null : block.id)}
                            onHideMenu={() => setShowMenu(null)}
                            onChangeType={(type) => changeType(block.id, type)}
                            onDragHandleDown={() => setActiveDragId(block.id)}
                            onDragHandleUp={() => setActiveDragId(null)}
                            onEnter={() => {
                                const newType = (block.type === 'bullet' || block.type === 'numbered') ? block.type : 'paragraph';
                                const newId = addBlock(block.id, newType);
                                setTimeout(() => document.getElementById(`block-${newId}`)?.focus(), 50)
                            }}
                            onBackspace={(isEmpty) => {
                                if (isEmpty) {
                                    if (block.type !== 'paragraph') changeType(block.id, 'paragraph');
                                    else if (blocks.length > 1) {
                                        const prevBlock = blocks[idx - 1]
                                        deleteBlock(block.id)
                                        if (prevBlock) setTimeout(() => document.getElementById(`block-${prevBlock.id}`)?.focus(), 50)
                                    }
                                }
                            }}
                        />
                    </div>
                )
            })}

            <button
                onClick={() => {
                    const last = blocks[blocks.length - 1]
                    if (last) addBlock(last.id)
                }}
                className="flex items-center gap-2 mt-10 mb-20 text-xs text-notion-muted hover:text-notion-text transition-colors opacity-40 hover:opacity-100"
            >
                <Plus size={13} />
                Add block
            </button>

            <div className="flex items-center gap-4 py-4 px-2 border-t border-notion-border mt-4 opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-notion-muted uppercase tracking-widest">Quick Media:</span>
                <button
                    onClick={() => addBlock(blocks[blocks.length - 1]?.id, 'image')}
                    className="flex items-center gap-1.5 text-xs text-notion-text hover:text-pink-600 transition-all font-medium"
                >
                    <ImageIcon size={14} /> Image
                </button>
                <button
                    onClick={() => addBlock(blocks[blocks.length - 1]?.id, 'video')}
                    className="flex items-center gap-1.5 text-xs text-notion-text hover:text-blue-600 transition-all font-medium"
                >
                    <Video size={14} /> Video
                </button>
                <button
                    onClick={() => addBlock(blocks[blocks.length - 1]?.id, 'audio')}
                    className="flex items-center gap-1.5 text-xs text-notion-text hover:text-purple-600 transition-all font-medium"
                >
                    <Music size={14} /> Audio
                </button>
            </div>
        </div>
    )
}