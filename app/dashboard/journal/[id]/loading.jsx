'use client'

import Loader from '@/components/ui/Loader'

export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#fcfaf7] z-[70]">
            <div className="flex flex-col items-center gap-4">
                <Loader />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Opening Diary</span>
            </div>
        </div>
    )
}
