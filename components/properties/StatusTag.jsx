const STATUS_STYLES = {
    'Not Started': 'bg-white/5 text-slate-400 border-white/5',
    'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Done': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Blocked': 'bg-red-500/10 text-red-400 border-red-500/20',
    'On Hold': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Active': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'Archived': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    'Reading': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'To Read': 'bg-white/5 text-slate-400 border-white/5',
    'Completed': 'bg-green-500/10 text-green-400 border-green-500/20',
}

export default function StatusTag({ status, onChange, editable = false }) {
    if (!editable) {
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${STATUS_STYLES[status] || STATUS_STYLES['Not Started']}`}>
                {status}
            </span>
        )
    }

    return (
        <select
            value={status}
            onChange={e => onChange(e.target.value)}
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${STATUS_STYLES[status] || STATUS_STYLES['Not Started']}`}
        >
            {Object.keys(STATUS_STYLES).map(s => (
                <option key={s} value={s}>{s}</option>
            ))}
        </select>
    )
}
