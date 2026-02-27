import { Music, Minus, GripVertical } from 'lucide-react'

export default function AudioBlock({ block, onUpdate, onDelete, onDragHandleDown, onDragHandleUp }) {
    const getAudioEmbed = (url) => {
        if (!url) return null;
        // YouTube detection
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
            return { type: 'youtube', id: videoId };
        }
        // Direct audio file or Fallback
        return { type: 'direct', url };
    }

    const embed = getAudioEmbed(block.content);

    return (
        <div className="group flex flex-col gap-2 my-6 relative w-full">

            {/* --- DRAG HANDLE ADD KIYA --- */}
            <div
                className="absolute -left-6 top-2 opacity-0 group-hover:opacity-100 cursor-grab text-notion-muted hover:bg-notion-border rounded w-5 h-6 flex items-center justify-center transition-all z-10"
                onMouseDown={onDragHandleDown}
                onMouseUp={onDragHandleUp}
                onMouseLeave={onDragHandleUp}
                onTouchStart={onDragHandleDown}
                onTouchEnd={onDragHandleUp}
            >
                <GripVertical size={14} />
            </div>

            {block.content ? (
                <div className="relative w-full p-4 rounded-xl bg-notion-bg border border-notion-border shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#f1f1ef] flex items-center justify-center text-notion-muted">
                            <Music size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-notion-muted uppercase tracking-widest leading-none mb-1">Audio Source</p>
                            <p className="text-xs text-notion-text truncate font-medium">{block.content}</p>
                        </div>
                        <button
                            onClick={onDelete}
                            className="p-1.5 rounded-md text-notion-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Minus size={14} />
                        </button>
                    </div>

                    {embed.type === 'youtube' ? (
                        <div className="w-full">
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-[#f1f1ef] to-white border border-notion-border">
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
                                        <div className="w-1 bg-notion-bg/40 h-2 animate-pulse"></div>
                                        <div className="w-1 bg-notion-bg h-4 animate-pulse"></div>
                                        <div className="w-1 bg-notion-bg/60 h-3 animate-pulse"></div>
                                    </div>
                                </button>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-notion-text">YouTube Audio Player</p>
                                    <p className="text-[10px] text-notion-muted uppercase font-bold tracking-tighter">Click to Play/Pause • Video is hidden</p>
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
                        <div className="w-full mt-1">
                            <audio
                                key={embed.url}
                                controls
                                src={embed.url}
                                className="w-full h-11 outline-none rounded-md"
                            >
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative w-full flex flex-col items-center gap-3 bg-notion-sidebar/50 border border-dashed border-notion-border rounded-xl p-8 transition-colors hover:bg-notion-sidebar">
                    <Music size={24} className="text-notion-muted opacity-40" />
                    <div className="w-full max-w-md flex items-center gap-2 bg-notion-bg border border-notion-border rounded-lg p-1 shadow-sm">
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
                    <p className="text-[10px] text-notion-muted font-medium uppercase tracking-widest">YouTube links will play in compact player</p>
                </div>
            )}
        </div>
    )
}