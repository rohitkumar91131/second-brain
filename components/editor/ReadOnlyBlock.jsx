import VideoBlock from './blocks/VideoBlock'
import AudioBlock from './blocks/AudioBlock'
import ImageBlock from './blocks/ImageBlock'
import TableBlock from './blocks/TableBlock'
import LinkBlock from './blocks/LinkBlock'

export default function ReadOnlyBlock({ block, listNumber }) {
    if (block.type === 'table') return <TableBlock block={block} readOnly />
    if (block.type === 'link') return <LinkBlock block={block} readOnly />
    if (block.type === 'video') return <VideoBlock block={block} readOnly />
    if (block.type === 'audio') return <AudioBlock block={block} readOnly />
    if (block.type === 'image') return <ImageBlock block={block} readOnly />

    if (block.type === 'task') {
        const data = (() => {
            try {
                if (block.content && (block.content.startsWith('{') || block.content.startsWith('['))) {
                    return JSON.parse(block.content)
                }
                return { checked: false, text: block.content || '' }
            } catch (e) {
                return { checked: false, text: block.content || '' }
            }
        })();

        return (
            <div className="flex items-start gap-2 my-1">
                <div className="flex items-center pt-[5px]">
                    <input
                        type="checkbox"
                        readOnly
                        checked={data.checked || false}
                        className="w-4 h-4 rounded border-notion-border text-notion-accent cursor-default pointer-events-none"
                    />
                </div>
                <p className={`text-sm leading-relaxed ${data.checked ? 'line-through text-notion-muted' : 'text-notion-text'} whitespace-pre-wrap`}>
                    {data.text}
                </p>
            </div>
        )
    }

    if (block.type === 'divider') {
        return <hr className="my-8 border-notion-border" />
    }

    if (block.type === 'callout') {
        return (
            <div className="callout-block my-6 flex items-start gap-3 p-4 bg-[#f1f1ef]/50 rounded-lg border border-notion-border/50">
                <span className="text-lg flex-shrink-0">💡</span>
                <p className="text-sm text-notion-text whitespace-pre-wrap leading-relaxed">{block.content}</p>
            </div>
        )
    }

    if (block.type === 'toggle') {
        return (
            <details className="my-2 group">
                <summary className="flex items-center gap-1 cursor-pointer list-none text-sm font-medium text-notion-text hover:bg-notion-hover p-1 rounded transition-colors">
                    <span className="group-open:rotate-90 transition-transform">▶</span>
                    <span>{block.content}</span>
                </summary>
                {block.children && (
                    <div className="ml-6 pl-3 border-l border-notion-border mt-1 text-sm text-notion-muted whitespace-pre-wrap leading-relaxed">
                        {block.children}
                    </div>
                )}
            </details>
        )
    }

    const getStyles = () => {
        switch (block.type) {
            case 'heading1': return 'text-3xl font-bold text-notion-text mt-10 mb-4'
            case 'heading2': return 'text-2xl font-semibold text-notion-text mt-8 mb-3'
            case 'heading3': return 'text-xl font-semibold text-notion-text mt-6 mb-2'
            default: return 'text-sm text-notion-text leading-relaxed'
        }
    }

    return (
        <div className="flex items-start gap-1 my-1">
            {block.type === 'bullet' && (
                <div className="w-6 flex-shrink-0 flex justify-center text-notion-muted pt-[3px]">
                    <span className="text-[18px] leading-none">•</span>
                </div>
            )}
            {block.type === 'numbered' && (
                <div className="w-6 flex-shrink-0 text-notion-muted text-sm text-right pr-1 pt-[3px] font-medium">
                    {listNumber}.
                </div>
            )}
            <p className={`${getStyles()} whitespace-pre-wrap`}>{block.content}</p>
        </div>
    )
}
