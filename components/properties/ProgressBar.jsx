export default function ProgressBar({ value = 0, showLabel = true, color = '#2eaadc', height = 6 }) {
    const pct = Math.min(100, Math.max(0, value))
    return (
        <div className="flex items-center gap-2 w-full">
            <div
                className="flex-1 bg-gray-100 rounded-full overflow-hidden"
                style={{ height }}
            >
                <div
                    className="progress-bar-fill h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
            {showLabel && (
                <span className="text-xs text-[#9b9a97] w-8 text-right flex-shrink-0">{pct}%</span>
            )}
        </div>
    )
}
