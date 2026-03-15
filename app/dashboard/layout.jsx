'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'

export default function DashboardLayout({ children }) {
    const { focusMode } = useApp()
    const [mobileOpen, setMobileOpen] = useState(false)
    const pathname = usePathname()

    // Skip full layout wrap for workspace to behave like an IDE
    if (pathname === '/dashboard/workspace') {
        return <div className="h-screen bg-notion-bg overflow-hidden">{children}</div>
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#0F172A] text-slate-200 selection:bg-indigo-500/30">
            {/* Mobile overlay */}
            {mobileOpen && !focusMode && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            {!focusMode && (
                <Sidebar
                    mobileOpen={mobileOpen}
                    onMobileClose={() => setMobileOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
                {/* Subtle background glow */}
                {!focusMode && (
                    <>
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
                    </>
                )}

                {!focusMode && <Header onMobileMenuClick={() => setMobileOpen(true)} />}
                <main className={`flex-1 overflow-y-auto custom-scrollbar ${focusMode ? 'z-50 bg-[#0F172A]' : ''}`}>
                    <div className={`${focusMode ? 'p-0 max-w-none' : 'p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto'}`}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
