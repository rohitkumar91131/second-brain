'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-white">
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
                <main className="flex-1 overflow-y-auto bg-white">
                    {children}
                </main>
            </div>
        </div>
    )
}
