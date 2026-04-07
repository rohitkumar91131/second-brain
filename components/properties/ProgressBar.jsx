export default function ProgressBar({ value = 0, showLabel = true, color = '#2eaadc', height = 6 }) {
    const pct = Math.min(100, Math.max(0, value))
    return (
        <div className="flex items-center gap-3 w-full">
            <div
                className="flex-1 bg-white/5 rounded-full overflow-hidden"
                style={{ height }}
            >
                <div
                    className="progress-bar-fill h-full rounded-full premium-gradient shadow-lg shadow-indigo-500/20"
                    style={{ width: `${pct}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-[10px] font-black text-slate-500 w-8 text-right flex-shrink-0">{pct}%</span>
            )}
        </div>
    )
}
