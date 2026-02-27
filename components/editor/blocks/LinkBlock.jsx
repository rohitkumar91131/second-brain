import { Link as LinkIcon, Minus, ExternalLink, GripVertical } from 'lucide-react' // GripVertical import kiya

export default function LinkBlock({ block, onUpdate, onDelete, onDragHandleDown, onDragHandleUp }) { // Naye props add kiye
    return (
        <div className="group flex flex-col gap-2 my-4 relative w-full">

            {/* --- DRAG HANDLE ADD KIYA --- */}
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

            {block.content ? (
                <div className="relative flex items-center gap-3 p-3 rounded-lg border border-notion-border bg-notion-bg hover:bg-[#f9f9f8] transition-colors shadow-sm">
                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                        <LinkIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <a
                            href={block.content.startsWith('http') ? block.content : `https://${block.content}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-notion-text hover:text-blue-600 truncate block transition-colors"
                        >
                            {block.content}
                        </a>
                    </div>
                    <a
                        href={block.content.startsWith('http') ? block.content : `https://${block.content}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-notion-muted hover:text-blue-600 transition-colors"
                    >
                        <ExternalLink size={16} />
                    </a>
                    <button
                        onClick={onDelete}
                        className="absolute -top-2 -right-2 bg-notion-bg border border-notion-border p-1 rounded-full text-notion-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                        <Minus size={12} />
                    </button>
                </div>
            ) : (
                <div className="relative w-full flex flex-col items-center gap-3 bg-notion-sidebar/50 border border-dashed border-notion-border rounded-xl p-6 transition-colors hover:bg-notion-sidebar">
                    <LinkIcon size={24} className="text-notion-muted opacity-40" />
                    <div className="w-full max-w-md flex items-center gap-2 bg-notion-bg border border-notion-border rounded-lg p-1 shadow-sm">
                        <input
                            autoFocus
                            placeholder="Paste link here..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value) {
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
                            Save Link
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}