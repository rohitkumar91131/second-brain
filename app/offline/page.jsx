'use client'

import Link from 'next/link'

export default function OfflinePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F172A] text-slate-200 p-8">
            <div className="text-center max-w-md">
                {/* Offline icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-indigo-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 3l18 18M8.111 8.111A5.25 5.25 0 0 0 6.75 12c0 .414.05.816.144 1.2M12 6.75c2.895 0 5.25 2.355 5.25 5.25 0 .414-.05.816-.144 1.2M21 12a9 9 0 0 1-9 9m0 0a9 9 0 0 1-9-9m9 9v.375M12 3v.375"
                            />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-100 mb-3">
                    You&apos;re Offline
                </h1>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    No internet connection detected. You can still browse your
                    previously loaded notes, tasks, and projects from the local
                    cache.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/dashboard"
                        aria-label="Navigate to dashboard to access cached content"
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Open Dashboard
                    </Link>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg font-medium transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    )
}
