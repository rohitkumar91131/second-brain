const STATUS_STYLES = {
    'Not Started': 'bg-gray-100 dark:bg-[#363636] text-gray-600 dark:text-gray-300',
    'In Progress': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
    'Done': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400',
    'Blocked': 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
    'On Hold': 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400',
    'Active': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
    'Archived': 'bg-gray-100 dark:bg-[#363636] text-gray-500 dark:text-gray-400',
    'Reading': 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400',
    'To Read': 'bg-gray-100 dark:bg-[#363636] text-gray-600 dark:text-gray-300',
    'Completed': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400',
}

export default function StatusTag({ status, onChange, editable = false }) {
    if (!editable) {
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status] || 'bg-gray-100 dark:bg-[#363636] text-gray-600 dark:text-gray-300'}`}>
                {status}
            </span>
        )
    }

    return (
        <select
            value={status}
            onChange={e => onChange(e.target.value)}
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2eaadc] dark:bg-notion-sidebar dark:text-notion-text ${STATUS_STYLES[status] || 'bg-gray-100 dark:bg-[#363636] text-gray-600 dark:text-gray-300'}`}
        >
            {Object.keys(STATUS_STYLES).map(s => (
                <option key={s} value={s}>{s}</option>
            ))}
        </select>
    )
}
