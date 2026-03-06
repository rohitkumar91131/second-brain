'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Plus, Image as ImageIcon, Video, Music, Save, Clipboard, Undo, Redo, X } from 'lucide-react'
import BlockRow from './BlockRow'
import { polyfill } from "mobile-drag-drop"
import "mobile-drag-drop/default.css"

export default function BlockEditor({ blocks, onChange, isDiary = false }) {
    const [showMenu, setShowMenu] = useState(null)
    const [toggleOpen, setToggleOpen] = useState({})
    const [isSaving, setIsSaving] = useState(false)
    const [activeDragId, setActiveDragId] = useState(null)
    const [isExternalDrag, setIsExternalDrag] = useState(false)

    const [clipboardToast, setClipboardToast] = useState(null)
    const [lastCopiedTextState, setLastCopiedTextState] = useState("")
    const lastCopiedTextRef = useRef("")

    const dragItem = useRef(null)
    const dragOverItem = useRef(null)

    // --- UNDO / REDO HISTORY REFS ---
    const historyRef = useRef([]);
    const historyIndexRef = useRef(-1);
    const typingTimeoutRef = useRef(null);
    const isUndoingRef = useRef(false);

    // Initial History Setup
    useEffect(() => {
        if (historyRef.current.length === 0 && blocks && blocks.length > 0) {
            historyRef.current = [blocks];
            historyIndexRef.current = 0;
        }
    }, [blocks]);

    const commitHistory = useCallback((newBlocks) => {
        if (isUndoingRef.current) return;

        const history = historyRef.current;
        let currentIndex = historyIndexRef.current;

        const updatedHistory = history.slice(0, currentIndex + 1);
        updatedHistory.push(newBlocks);

        if (updatedHistory.length > 50) {
            updatedHistory.shift();
        } else {
            currentIndex++;
        }

        historyRef.current = updatedHistory;
        historyIndexRef.current = currentIndex;
    }, []);

    const handleBlockChange = useCallback((newBlocks, isTyping = false) => {
        onChange(newBlocks);
        isUndoingRef.current = false;

        if (isTyping) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                commitHistory(newBlocks);
            }, 800);
        } else {
            clearTimeout(typingTimeoutRef.current);
            commitHistory(newBlocks);
        }
    }, [onChange, commitHistory]);

    const handleUndo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            isUndoingRef.current = true;
            historyIndexRef.current -= 1;
            onChange(historyRef.current[historyIndexRef.current]);
        }
    }, [onChange]);

    const handleRedo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            isUndoingRef.current = true;
            historyIndexRef.current += 1;
            onChange(historyRef.current[historyIndexRef.current]);
        }
    }, [onChange]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

            if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) handleRedo();
                else handleUndo();
            } else if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                handleRedo();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

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

    // --- OPTIMIZED CLIPBOARD LISTENER ---
    useEffect(() => {
        lastCopiedTextRef.current = lastCopiedTextState;
    }, [lastCopiedTextState]);

    useEffect(() => {
        const checkClipboard = async () => {
            if (document.visibilityState !== 'visible') return;
            try {
                const text = await navigator.clipboard.readText();
                if (!text || text === lastCopiedTextRef.current) return;

                let html = '';
                try {
                    const clipboardItems = await navigator.clipboard.read();
                    for (const item of clipboardItems) {
                        if (item.types.includes('text/html')) {
                            const blob = await item.getType('text/html');
                            html = await blob.text();
                        }
                    }
                } catch (e) { }

                let type = 'Text';
                let preview = text.substring(0, 50) + (text.length > 50 ? '...' : '');
                const lowerContent = text.toLowerCase();

                if (lowerContent.includes('youtube.com') || lowerContent.includes('youtu.be') || lowerContent.includes('vimeo.com')) {
                    type = 'Video Link';
                    preview = text;
                } else if (lowerContent.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
                    type = 'Image Link';
                    preview = text;
                } else if (text.startsWith('http')) {
                    type = 'Web Link';
                    preview = text;
                } else if (html) {
                    type = 'Rich Text';
                    preview = 'Formatted content with headings/styles';
                }

                setClipboardToast({ text, html, type, preview });
                setLastCopiedTextState(text);

            } catch (err) { }
        };

        window.addEventListener('focus', checkClipboard);
        document.addEventListener('visibilitychange', checkClipboard);
        document.addEventListener('pointerdown', checkClipboard, { capture: true, passive: true });

        return () => {
            window.removeEventListener('focus', checkClipboard);
            document.removeEventListener('visibilitychange', checkClipboard);
            document.removeEventListener('pointerdown', checkClipboard, { capture: true });
        };
    }, []);

    const handleSort = useCallback(() => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        if (dragItem.current === dragOverItem.current) return;

        const newBlocks = [...blocks];
        const draggedItemContent = newBlocks.splice(dragItem.current, 1)[0];
        newBlocks.splice(dragOverItem.current, 0, draggedItemContent);

        dragItem.current = null;
        dragOverItem.current = null;

        const reOrderedBlocks = newBlocks.map((b, i) => ({ ...b, order: i }));
        handleBlockChange(reOrderedBlocks, false);
    }, [blocks, handleBlockChange]);

    const processContentToBlocks = (htmlData, textData, urlData) => {
        let newBlocksToAdd = [];
        const content = urlData || textData;
        const lowerContent = content ? content.toLowerCase() : '';

        if (content && (lowerContent.includes('youtube.com') || lowerContent.includes('youtu.be') || lowerContent.includes('vimeo.com'))) {
            newBlocksToAdd.push({ type: 'video', content });
        }
        else if (content && lowerContent.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
            newBlocksToAdd.push({ type: 'image', content });
        }
        else if (htmlData) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlData, 'text/html');

            const processNode = (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const txt = node.textContent.trim();
                    if (txt && ['DIV', 'BODY', 'SPAN', 'SECTION'].includes(node.parentNode?.tagName)) {
                        newBlocksToAdd.push({ type: 'paragraph', content: txt });
                    }
                    return;
                }

                if (node.nodeType !== Node.ELEMENT_NODE) return;

                const tag = node.tagName.toLowerCase();
                const textContent = node.textContent.trim();

                if (tag === 'h1' && textContent) { newBlocksToAdd.push({ type: 'heading1', content: textContent }); return; }
                if (tag === 'h2' && textContent) { newBlocksToAdd.push({ type: 'heading2', content: textContent }); return; }
                if (['h3', 'h4', 'h5', 'h6'].includes(tag) && textContent) { newBlocksToAdd.push({ type: 'heading3', content: textContent }); return; }
                if (tag === 'p' && textContent) { newBlocksToAdd.push({ type: 'paragraph', content: textContent }); return; }

                if (tag === 'li' && textContent) {
                    const isNumbered = node.closest('ol');
                    newBlocksToAdd.push({ type: isNumbered ? 'numbered' : 'bullet', content: textContent });
                    return;
                }

                if (tag === 'img' && node.src) { newBlocksToAdd.push({ type: 'image', content: node.src }); return; }
                if (tag === 'hr') { newBlocksToAdd.push({ type: 'divider', content: '' }); return; }

                if (tag === 'table') {
                    const rows = Array.from(node.querySelectorAll('tr')).map(tr =>
                        Array.from(tr.querySelectorAll('th, td')).map(td => td.textContent.trim())
                    ).filter(row => row.length > 0);

                    if (rows.length > 0) {
                        newBlocksToAdd.push({ type: 'table', content: JSON.stringify(rows) });
                    }
                    return;
                }

                Array.from(node.childNodes).forEach(processNode);
            };

            Array.from(doc.body.childNodes).forEach(processNode);

            if (newBlocksToAdd.length === 0 && textData) {
                const paragraphs = textData.split('\n').filter(p => p.trim() !== '');
                paragraphs.forEach(p => newBlocksToAdd.push({ type: 'paragraph', content: p }));
            }
        }
        else if (content && content.startsWith('http')) {
            newBlocksToAdd.push({ type: 'link', content });
        }
        else if (textData) {
            const paragraphs = textData.split('\n').filter(p => p.trim() !== '');
            paragraphs.forEach(p => newBlocksToAdd.push({ type: 'paragraph', content: p }));
        }

        return newBlocksToAdd;
    };

    const appendParsedBlocks = (newBlocksToAdd) => {
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
            handleBlockChange(currentBlocks.map((b, i) => ({ ...b, order: i })), false);
        }
    };

    const handleContainerDragOver = (e) => {
        e.preventDefault();
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

        if (dragItem.current !== null) return;

        const files = Array.from(e.dataTransfer.files);
        let newBlocksToAdd = [];

        if (files.length > 0) {
            files.forEach(file => {
                const url = URL.createObjectURL(file);
                if (file.type.startsWith('image/')) newBlocksToAdd.push({ type: 'image', content: url });
                else if (file.type.startsWith('video/')) newBlocksToAdd.push({ type: 'video', content: url });
                else if (file.type.startsWith('audio/')) newBlocksToAdd.push({ type: 'audio', content: url });
            });
            appendParsedBlocks(newBlocksToAdd);
        } else {
            const htmlData = e.dataTransfer.getData('text/html');
            const textData = e.dataTransfer.getData('text/plain');
            const urlData = e.dataTransfer.getData('URL') || e.dataTransfer.getData('text/uri-list');

            newBlocksToAdd = processContentToBlocks(htmlData, textData, urlData);
            appendParsedBlocks(newBlocksToAdd);
        }
    };

    const handleSave = async () => { /* Tumhara save logic yahan aayega */ }

    const updateBlock = useCallback((id, updates, isTyping = true) => {
        const newBlocks = blocks.map(b => b.id === id ? { ...b, ...updates } : b);
        handleBlockChange(newBlocks, isTyping);
    }, [blocks, handleBlockChange])

    const addBlock = useCallback((afterId, type = 'paragraph') => {
        const idx = blocks.findIndex(b => b.id === afterId)
        const newOrder = idx + 1
        const newBlock = { id: `b-${Date.now()}`, type, content: '', order: newOrder }
        const newBlocks = [...blocks]
        newBlocks.splice(newOrder, 0, newBlock)

        const orderedBlocks = newBlocks.map((b, i) => ({ ...b, order: i }));
        handleBlockChange(orderedBlocks, false);
        return newBlock.id
    }, [blocks, handleBlockChange])

    const deleteBlock = useCallback(async (id) => {
        if (blocks.length <= 1) return
        const isSavedInDb = !id.startsWith('b-');
        if (isSavedInDb) {
            try {
                const response = await fetch(`/api/blocks/${id}`, { method: 'DELETE' });
                if (!response.ok) return;
            } catch (error) { return; }
        }

        const filteredBlocks = blocks.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i }));
        handleBlockChange(filteredBlocks, false);
    }, [blocks, handleBlockChange])

    const changeType = useCallback((id, type) => {
        updateBlock(id, { type }, false)
        setShowMenu(null)
    }, [updateBlock])

    const handlePasteMulti = useCallback((afterIndex, text) => {
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
        if (paragraphs.length === 0) return;

        let currentBlocks = [...blocks];
        let insertIndex = afterIndex + 1;

        paragraphs.forEach((p, i) => {
            const newBlock = {
                id: `b-${Date.now()}-${i}`,
                type: 'paragraph',
                content: p,
                order: insertIndex + i
            };
            currentBlocks.splice(insertIndex + i, 0, newBlock);
        });

        handleBlockChange(currentBlocks.map((b, i) => ({ ...b, order: i })), false);
    }, [blocks, handleBlockChange]);

    // --- PRE-CALCULATE LIST NUMBERS FOR VIRTUALIZATION ---
    // Kyunki virtualization un-visible elements ko DOM se nikaal deta hai, 
    // humhe counting upar se pehle karni padegi.
    const blocksWithComputedMeta = useMemo(() => {
        if (!blocks) return [];
        let currentListNum = 0;
        return blocks.map(b => {
            if (b.type === 'numbered') {
                currentListNum++;
                return { ...b, computedListNumber: currentListNum };
            } else {
                currentListNum = 0;
                return { ...b, computedListNumber: 0 };
            }
        });
    }, [blocks]);

    return (
        <div
            className={`max-w-3xl mx-auto py-8 px-6 min-h-screen transition-colors duration-200 relative ${isDiary ? 'diary-serif' : ''} ${isExternalDrag ? 'bg-blue-50/40 border-2 border-dashed border-blue-300 rounded-2xl' : 'border-2 border-transparent'}`}
            onDragOver={handleContainerDragOver}
            onDragLeave={handleContainerDragLeave}
            onDrop={handleContainerDrop}
        >
            <div className="flex justify-between items-center mb-6">
                <div className={`text-xs font-semibold text-blue-500 transition-opacity ${isExternalDrag ? 'opacity-100' : 'opacity-0'}`}>
                    Drop files, text, or links here...
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleUndo} title="Undo (Ctrl+Z)" className="p-1.5 text-notion-muted hover:text-notion-text hover:bg-gray-100 rounded transition-colors disabled:opacity-30" disabled={historyIndexRef.current <= 0}>
                        <Undo size={16} />
                    </button>
                    <button onClick={handleRedo} title="Redo (Ctrl+Y)" className="p-1.5 text-notion-muted hover:text-notion-text hover:bg-gray-100 rounded transition-colors disabled:opacity-30 mr-2" disabled={historyIndexRef.current >= historyRef.current.length - 1}>
                        <Redo size={16} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#f1f1ef] hover:bg-notion-border text-notion-text text-sm rounded transition-colors"
                    >
                        <Save size={14} />
                        {isSaving ? 'Saving...' : 'Save Order'}
                    </button>
                </div>
            </div>

            {/* --- STANDARD BLOCK LIST (Virtualization disabled for debugging) --- */}
            <div className="space-y-1">
                {blocksWithComputedMeta.map((block, idx) => (
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
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <BlockRow
                            block={block}
                            isDiary={isDiary}
                            index={idx}
                            listNumber={block.computedListNumber}
                            showMenu={showMenu === block.id}
                            toggleOpen={toggleOpen[block.id]}
                            onToggleOpen={() => setToggleOpen(prev => ({ ...prev, [block.id]: !prev[block.id] }))}
                            onUpdate={(updates) => updateBlock(block.id, updates, true)}
                            onAddAfter={(type) => addBlock(block.id, type)}
                            onDelete={() => deleteBlock(block.id)}
                            onShowMenu={() => setShowMenu(showMenu === block.id ? null : block.id)}
                            onHideMenu={() => setShowMenu(null)}
                            onChangeType={(type) => changeType(block.id, type)}
                            onDragHandleDown={() => setActiveDragId(block.id)}
                            onDragHandleUp={() => setActiveDragId(null)}
                            onPasteMulti={(text) => handlePasteMulti(idx, text)}
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
                ))}
            </div>

            <button
                onClick={() => {
                    const last = blocks && blocks.length > 0 ? blocks[blocks.length - 1] : null;
                    if (last) addBlock(last.id);
                    else addBlock(null); // If no blocks exist, add the first one
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

            {/* --- CLIPBOARD TOAST UI --- */}
            {clipboardToast && (
                <div className="fixed bottom-6 right-6 w-80 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 font-sans">
                    <div className="bg-white/80 backdrop-blur-md border border-blue-100/50 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group ring-1 ring-black/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-transparent pointer-events-none -z-10"></div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 rounded-xl text-blue-600 shadow-sm">
                                    <Clipboard size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-bold text-gray-800 leading-tight">Clipboard Detected</h4>
                                    <p className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider mt-0.5">{clipboardToast.type}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setClipboardToast(null)}
                                className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-100/80 -mr-1 -mt-1"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="bg-gray-50/80 border border-gray-100/80 rounded-xl p-3 text-xs text-gray-600 leading-relaxed max-h-24 overflow-y-auto scrollbar-hide font-medium shadow-inner">
                            {clipboardToast.preview}
                        </div>
                        <button
                            onClick={() => {
                                const newBlocks = processContentToBlocks(clipboardToast.html, clipboardToast.text, null);
                                appendParsedBlocks(newBlocks);
                                setClipboardToast(null);
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Paste to Editor
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}