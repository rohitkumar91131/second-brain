import { Heading1, Heading2, Heading3, List, ChevronRight, Minus, AlertCircle, Image as ImageIcon, Video, Table, ListOrdered, Music, Link as LinkIcon, CheckSquare, StickyNote } from 'lucide-react'

export const BLOCK_TYPES = [
    { type: 'paragraph', label: 'Text', icon: null },
    { type: 'heading1', label: 'Heading 1', icon: Heading1 },
    { type: 'heading2', label: 'Heading 2', icon: Heading2 },
    { type: 'heading3', label: 'Heading 3', icon: Heading3 },
    { type: 'todo', label: 'To-do list', icon: CheckSquare },
    { type: 'bullet', label: 'Bullet List', icon: List },
    { type: 'numbered', label: 'Numbered List', icon: ListOrdered },
    { type: 'toggle', label: 'Toggle', icon: ChevronRight },
    { type: 'table', label: 'Table', icon: Table },
    { type: 'divider', label: 'Divider', icon: Minus },
    { type: 'callout', label: 'Callout', icon: AlertCircle },
    { type: 'note_reference', label: 'Link to Notes', icon: StickyNote },
    { type: 'link', label: 'Link', icon: LinkIcon },
    { type: 'image', label: 'Image', icon: ImageIcon },
    { type: 'video', label: 'Video', icon: Video },
    { type: 'audio', label: 'Audio', icon: Music },
]