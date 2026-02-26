import { Video, Minus } from 'lucide-react'

export default function VideoBlock({ block, onUpdate, onDelete }) {
    const getEmbedInfo = (url) => {
        if (!url) return { type: 'none', url: '' };

        // 1. Direct Video Files (.mp4, .webm, .ogg, .mov)
        if (url.match(/\.(mp4|webm|ogg|mov)$/i)) {
            return { type: 'video', url };
        }

        // 2. YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
            return { type: 'iframe', url: `https://www.youtube.com/embed/${videoId}` };
        }

        // 3. Instagram
        if (url.includes('instagram.com')) {
            const parts = url.split('/p/') || url.split('/reel/');
            if (parts[1]) {
                const id = parts[1].split('/')[0];
                return { type: 'iframe', url: `https://www.instagram.com/p/${id}/embed` };
            }
            return { type: 'iframe', url: url.split('?')[0] + 'embed' };
        }

        // 4. Vimeo
        if (url.includes('vimeo.com')) {
            const id = url.split('vimeo.com/')[1]?.split('/')[0];
            return { type: 'iframe', url: `https://player.vimeo.com/video/${id}` };
        }

        // 5. Generic Hosted or Embed Link Fallback
        return { type: 'iframe', url };
    }

    const embedInfo = getEmbedInfo(block.content);

    return (
        <div className="group flex flex-col gap-2 my-6 relative">
            {block.content ? (
                <div className="relative w-full rounded-lg overflow-hidden bg-black/5 aspect-video border border-[#e9e9e7]">
                    {embedInfo.type === 'video' ? (
                        <video
                            src={embedInfo.url}
                            controls
                            className="w-full h-full object-contain bg-black"
                            controlsList="nodownload"
                        />
                    ) : (
                        <iframe
                            src={embedInfo.url}
                            className="w-full h-full border-none"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    )}
                    <button
                        onClick={onDelete}
                        className="absolute top-2 right-2 z-10 bg-white/80 p-1.5 rounded-md text-[#9b9a97] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
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
                            placeholder="Paste any video URL (.mp4, YouTube, Insta...)"
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
                    <p className="text-[10px] text-[#9b9a97] font-medium uppercase tracking-widest text-center">
                        Supports YouTube, Instagram, Vimeo & Direct Video files (.mp4)
                    </p>
                </div>
            )}
        </div>
    )
}