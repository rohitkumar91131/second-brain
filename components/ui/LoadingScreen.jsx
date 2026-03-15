'use client'

import Loader from './Loader'

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-notion-bg/50 backdrop-blur-sm z-[9999]">
            <Loader size={32} />
        </div>
    )
}
