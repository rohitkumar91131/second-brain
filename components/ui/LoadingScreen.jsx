'use client'

import Loader from './Loader'

export default function LoadingScreen() {
    return (
        <div className="flex items-center justify-center h-full w-full relative overflow-hidden bg-white/50 backdrop-blur-sm z-50">
            <Loader />
        </div>
    )
}
