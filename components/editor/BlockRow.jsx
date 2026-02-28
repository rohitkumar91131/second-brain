import { useRef, useEffect, useState } from 'react'
import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react'
import { BLOCK_TYPES } from './constants'
import VideoBlock from './blocks/VideoBlock'
import AudioBlock from './blocks/AudioBlock'
import ImageBlock from './blocks/ImageBlock'
import TableBlock from './blocks/TableBlock'
import LinkBlock from './blocks/LinkBlock'

const CATEGORIZED_BLOCKS = BLOCK_TYPES.map(b => {
    if (['image', 'video', 'audio'].includes(b.type)) return { ...b, category: 'Media' };
    if (['table', 'divider', 'callout', 'link'].includes(b.type)) return { ...b, category: 'Advanced' };
    return { ...b, category: 'Basics' };
});

export default function BlockRow({
    block, index, listNumber, isDiary, showMenu, toggleOpen,
    onToggleOpen, onUpdate, onDelete, onShowMenu, onHideMenu,
    onChangeType, onEnter, onBackspace, onDragHandleDown, onDragHandleUp
}) {
    const inputRef = useRef(null)
    const toggleChildRef = useRef(null)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const isCommand = block.content.startsWith('/')
    const searchQuery = isCommand ? block.content.substring(1).toLowerCase() : ''

    const filteredBlocks = CATEGORIZED_BLOCKS.filter(b =>
        b.label.toLowerCase().includes(searchQuery) ||
        b.type.toLowerCase().includes(searchQuery)
    )

    useEffect(() => {
        if (showMenu && !block.content.startsWith('/')) {
            onHideMenu();
        }
        setSelectedIndex(0);
    }, [block.content, showMenu, onHideMenu])

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

    const handlePaste = (e) => {
        const pastedText = e.clipboardData.getData('text/plain');

        if (pastedText.includes('\t') && pastedText.includes('\n')) {
            e.preventDefault();
            const rows = pastedText.trim().split('\n').map(row =>
                row.split('\t').map(cell => cell.trim())
            );
            onUpdate({ type: 'table', content: JSON.stringify(rows) });
            return;
        }

        if (pastedText.trim().startsWith('|') && pastedText.includes('\n')) {
            const rows = pastedText.trim().split('\n')
                .filter(row => !row.includes('---'))
                .map(row => {
                    const cells = row.split('|').map(cell => cell.trim());
                    if (cells[0] === '') cells.shift();
                    if (cells[cells.length - 1] === '') cells.pop();
                    return cells;
                })
                .filter(row => row.length > 0);

            if (rows.length > 0) {
                e.preventDefault();
                onUpdate({ type: 'table', content: JSON.stringify(rows) });
                return;
            }
        }
    };

    const handleKeyDown = (e) => {
        if (showMenu) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, filteredBlocks.length - 1));
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
                return;
            }
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (filteredBlocks.length > 0) {
                    const selectedItem = filteredBlocks[selectedIndex];
                    if (selectedItem) {
                        onUpdate({ type: selectedItem.type, content: '' });
                        onHideMenu();
                    }
                }
                return;
            }
            if (e.key === 'Escape') {
                onHideMenu();
                return;
            }
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (block.content === '/') {
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
            setTimeout(() => onShowMenu(), 10)
        }
    }

    // Table ke andar humne pehle se drag handle daala hua hai
    if (block.type === 'table') return <TableBlock block={block} onUpdate={onUpdate} onDelete={onDelete} onDragHandleDown={onDragHandleDown} onDragHandleUp={onDragHandleUp} />

    // --- NAYA MEDIA WRAPPER: Image, Video, Audio aur Link ko Drag Drop me fit karne ke liye ---
    if (['video', 'audio', 'image', 'link'].includes(block.type)) {
        return (
            <div className="group flex items-start gap-2 my-4 relative w-full">
                {/* 6-Dots Drag Handle */}
                <div
                    className="absolute -left-6 top-1 opacity-0 group-hover:opacity-100 cursor-grab text-notion-muted hover:bg-notion-border rounded w-5 h-6 flex items-center justify-center transition-all z-10"
                    onMouseDown={onDragHandleDown}
                    onMouseUp={onDragHandleUp}
                    onMouseLeave={onDragHandleUp}
                    onTouchStart={onDragHandleDown}
                    onTouchEnd={onDragHandleUp}
                >
                    <GripVertical size={14} />
                </div>

                {/* Asli Block Component */}
                <div className="flex-1 w-full relative">
                    {block.type === 'link' && <LinkBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />}
                    {block.type === 'video' && <VideoBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />}
                    {block.type === 'audio' && <AudioBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />}
                    {block.type === 'image' && <ImageBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />}
                </div>
            </div>
        )
    }

    if (block.type === 'divider') {
        return (
            <div className="group flex items-center gap-2 my-8 relative">
                <div
                    className="absolute -left-6 top-0 opacity-0 group-hover:opacity-100 cursor-grab text-notion-muted hover:bg-notion-border rounded w-5 h-6 flex items-center justify-center transition-all z-10"
                    onMouseDown={onDragHandleDown}
                    onMouseUp={onDragHandleUp}
                    onMouseLeave={onDragHandleUp}
                    onTouchStart={onDragHandleDown}
                    onTouchEnd={onDragHandleUp}
                >
                    <GripVertical size={14} />
                </div>
                <hr className="flex-1 border-notion-border" />
                <button onClick={onDelete} className="hover-reveal text-xs text-notion-muted hover:text-red-400 transition-colors">×</button>
            </div>
        )
    }

    if (block.type === 'callout') {
        return (
            <div className={`callout-block my-6 group relative ${isDiary ? 'border-none bg-[#f1f1ef]/50' : ''}`}>
                <div
                    className="absolute -left-6 top-1 opacity-0 group-hover:opacity-100 cursor-grab text-notion-muted hover:bg-notion-border rounded w-5 h-6 flex items-center justify-center transition-all z-10"
                    onMouseDown={onDragHandleDown}
                    onMouseUp={onDragHandleUp}
                    onMouseLeave={onDragHandleUp}
                    onTouchStart={onDragHandleDown}
                    onTouchEnd={onDragHandleUp}
                >
                    <GripVertical size={14} />
                </div>
                <span className="text-lg flex-shrink-0">💡</span>
                <textarea
                    id={`block-${block.id}`}
                    ref={inputRef}
                    value={block.content}
                    onChange={e => onUpdate({ content: e.target.value })}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
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
            <div className="my-2 group relative">
                <div
                    className="absolute -left-6 top-1 opacity-0 group-hover:opacity-100 cursor-grab text-notion-muted hover:bg-notion-border rounded w-5 h-6 flex items-center justify-center transition-all z-10"
                    onMouseDown={onDragHandleDown}
                    onMouseUp={onDragHandleUp}
                    onMouseLeave={onDragHandleUp}
                    onTouchStart={onDragHandleDown}
                    onTouchEnd={onDragHandleUp}
                >
                    <GripVertical size={14} />
                </div>
                <div className="flex items-start gap-1">
                    <button onClick={onToggleOpen} className="mt-1 p-0.5 text-notion-muted hover:text-notion-text transition-colors">
                        {toggleOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <textarea
                        id={`block-${block.id}`}
                        ref={inputRef}
                        value={block.content}
                        onChange={e => onUpdate({ content: e.target.value })}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder="Toggle title..."
                        rows={1}
                        className={`block-editor-line text-sm font-medium flex-1 resize-none overflow-hidden leading-relaxed ${isDiary ? 'text-lg' : ''}`}
                        onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
                    />
                </div>
                {toggleOpen && (
                    <div className="ml-6 pl-3 border-l border-notion-border mt-1">
                        <textarea
                            ref={toggleChildRef}
                            value={block.children || ''}
                            onChange={e => onUpdate({ children: e.target.value })}
                            placeholder="Toggle content..."
                            rows={1}
                            className={`block-editor-line text-sm w-full resize-none overflow-hidden text-notion-muted leading-relaxed ${isDiary ? 'text-base' : ''}`}
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
            case 'heading1': return `${isDiary ? 'text-4xl' : 'text-2xl'} font-bold text-notion-text mt-10 mb-4 ${diaryBase}`
            case 'heading2': return `${isDiary ? 'text-3xl' : 'text-xl'} font-semibold text-notion-text mt-8 mb-3 ${diaryBase}`
            case 'heading3': return `${isDiary ? 'text-2xl' : 'text-base'} font-semibold text-notion-text mt-6 mb-2 ${diaryBase}`
            case 'bullet': return `${isDiary ? 'text-lg' : 'text-sm'} text-notion-text ${diaryBase}`
            default: return `${isDiary ? 'text-lg' : 'text-sm'} text-notion-text ${diaryBase}`
        }
    }

    return (
        <div className="group flex items-start gap-1 my-0.5 relative">

            <div
                className="absolute -left-6 top-1 opacity-0 group-hover:opacity-100 cursor-grab text-notion-muted hover:bg-notion-border rounded w-5 h-6 flex items-center justify-center transition-all z-10"
                onMouseDown={onDragHandleDown}
                onMouseUp={onDragHandleUp}
                onMouseLeave={onDragHandleUp}
                onTouchStart={onDragHandleDown}
                onTouchEnd={onDragHandleUp}
            >
                <GripVertical size={14} />
            </div>

            {block.type === 'bullet' && (
                <div className="w-6 flex-shrink-0 flex justify-center text-notion-muted pt-[3px] select-none">
                    <span className="text-[18px] leading-none">•</span>
                </div>
            )}

            {block.type === 'numbered' && (
                <div className="w-6 flex-shrink-0 text-notion-muted text-sm text-right pr-1 pt-[3px] font-medium select-none">
                    {listNumber}.
                </div>
            )}

            <div className="flex-1 relative">
                <textarea
                    id={`block-${block.id}`}
                    ref={inputRef}
                    value={block.content}
                    onChange={e => onUpdate({ content: e.target.value })}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={block.type === 'paragraph' ? "Type '/' for commands..." : `${BLOCK_TYPES.find(b => b.type === block.type)?.label}...`}
                    rows={1}
                    className={`block-editor-line w-full resize-none overflow-hidden ${getStyles()}`}
                    style={{ minHeight: '1.5em' }}
                    onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
                />

                {showMenu && (
                    <div className="absolute top-full left-0 z-50 bg-notion-bg border border-notion-border rounded-xl shadow-2xl py-2 w-52 animate-fade-in max-h-[300px] overflow-y-auto">
                        {filteredBlocks.length > 0 ? (
                            filteredBlocks.map((item, i) => {
                                const showHeader = i === 0 || item.category !== filteredBlocks[i - 1].category;
                                const Icon = item.icon;
                                const isSelected = i === selectedIndex;

                                return (
                                    <div key={item.type} id={isSelected ? 'selected-menu-item' : ''}>
                                        {showHeader && (
                                            <p className="px-3 py-1 mt-1 text-[10px] font-bold text-notion-muted uppercase tracking-widest">
                                                {item.category}
                                            </p>
                                        )}
                                        <button
                                            onClick={() => {
                                                onUpdate({ type: item.type, content: '' });
                                                onHideMenu();
                                            }}
                                            className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs text-notion-text transition-colors ${isSelected ? 'bg-[#f1f1ef] font-medium' : 'hover:bg-notion-sidebar'}`}
                                        >
                                            {Icon ? <Icon size={13} className={`text-notion-muted ${isSelected ? 'text-notion-accent' : ''}`} /> : <span className="w-3" />}
                                            {item.label}
                                        </button>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="px-3 py-3 text-xs text-notion-muted text-center">No blocks found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}