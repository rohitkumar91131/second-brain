const STATUS_STYLES = {
    'Not Started': 'bg-gray-100 text-gray-600',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Done': 'bg-green-100 text-green-700',
    'Blocked': 'bg-red-100 text-red-700',
    'On Hold': 'bg-yellow-100 text-yellow-700',
    'Active': 'bg-blue-100 text-blue-700',
    'Archived': 'bg-gray-100 text-gray-500',
    'Reading': 'bg-purple-100 text-purple-700',
    'To Read': 'bg-gray-100 text-gray-600',
    'Completed': 'bg-green-100 text-green-700',
}

export default function StatusTag({ status, onChange, editable = false }) {
    if (!editable) {
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
                {status}
            </span>
        )
    }

    return (
        <select
            value={status}
            onChange={e => onChange(e.target.value)}
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2eaadc] ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}
        >
            {Object.keys(STATUS_STYLES).map(s => (
                <option key={s} value={s}>{s}</option>
            ))}
        </select>
    )
}
