'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const pathname = usePathname()

    // Skip full layout wrap for workspace to behave like an IDE
    if (pathname === '/dashboard/workspace') {
        return <div className="h-screen bg-notion-bg overflow-hidden">{children}</div>
    }

    return (
        <div className="flex h-screen overflow-hidden bg-notion-bg">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="drawer-overlay md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header onMobileMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 overflow-y-auto bg-notion-bg">
                    {children}
                </main>
            </div>
        </div>
    )
}
