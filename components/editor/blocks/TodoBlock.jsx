import { useRef, useEffect } from 'react'
import { GripVertical } from 'lucide-react'

export default function TodoBlock({ block, onUpdate, onDelete, onEnter, onBackspace, onDragHandleDown, onDragHandleUp }) {
    const inputRef = useRef(null)

    // Parse checked state from child content. If not present, default to false.
    const isChecked = block.children === 'true'

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onEnter()
        }
        if (e.key === 'Backspace' && !e.target.value) {
            onBackspace(true)
        }
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto'
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
        }
    }, [block.content])

    return (
        <div className="group flex items-start gap-2 my-1 relative w-full">
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

            <button
                onClick={() => onUpdate({ children: isChecked ? 'false' : 'true' })}
                className={`w-4 h-4 mt-[5px] rounded border flex items-center flex-shrink-0 justify-center transition-colors ${isChecked ? 'bg-blue-500 border-blue-500' : 'border-notion-muted hover:border-notion-text'}`}
            >
                {isChecked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>

            <textarea
                ref={inputRef}
                value={block.content}
                onChange={e => onUpdate({ content: e.target.value })}
                onKeyDown={handleKeyDown}
                placeholder="To-do"
                rows={1}
                className={`block-editor-line flex-1 text-sm resize-none overflow-hidden leading-relaxed ${isChecked ? 'line-through text-notion-muted' : 'text-notion-text'}`}
                style={{ minHeight: '1.5em' }}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
            />
        </div>
    )
}
