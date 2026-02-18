'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import {
    LayoutDashboard, CheckSquare, FolderOpen, Target, Map,
    BookOpen, FileText, BookMarked, Archive, ChevronLeft,
    ChevronRight, Brain, LogOut, User
} from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
    { href: '/dashboard/goals', label: 'Goals', icon: Target },
    { href: '/dashboard/areas', label: 'Areas', icon: Map },
    { href: '/dashboard/resources', label: 'Resources', icon: BookOpen },
    { href: '/dashboard/notes', label: 'Notes', icon: FileText },
    { href: '/dashboard/journal', label: 'Journal', icon: BookMarked },
    { href: '/dashboard/archive', label: 'Archive', icon: Archive },
]

export default function Sidebar({ mobileOpen, onMobileClose }) {
    const pathname = usePathname()
    const { sidebarCollapsed, setSidebarCollapsed } = useApp()

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className={`
          hidden md:flex flex-col h-full bg-[#f7f7f5] border-r border-[#e9e9e7]
          sidebar-transition overflow-hidden flex-shrink-0
          ${sidebarCollapsed ? 'w-14' : 'w-56'}
        `}
            >
                <SidebarContent
                    collapsed={sidebarCollapsed}
                    pathname={pathname}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </aside>

            {/* Mobile sidebar drawer */}
            <aside
                className={`
          md:hidden fixed top-0 left-0 h-full w-64 bg-[#f7f7f5] border-r border-[#e9e9e7]
          z-50 sidebar-transition flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <SidebarContent
                    collapsed={false}
                    pathname={pathname}
                    onToggle={onMobileClose}
                    isMobile
                />
            </aside>
        </>
    )
}

function SidebarContent({ collapsed, pathname, onToggle, isMobile }) {
    const { session, isAuthenticated } = useApp()
    const user = session?.user

    return (
        <>
            {/* Header */}
            <div className={`flex items-center h-12 px-3 border-b border-[#e9e9e7] flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <Link href="/" className="flex items-center gap-2 min-w-0">
                        <Brain size={18} className="text-[#2eaadc] flex-shrink-0" />
                        <span className="font-semibold text-sm text-[#37352f] truncate">Second Brain</span>
                    </Link>
                )}
                <button
                    onClick={onToggle}
                    className="p-1 rounded hover:bg-[#efefef] text-[#9b9a97] hover:text-[#37352f] transition-colors flex-shrink-0"
                    title={isMobile ? 'Close' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isMobile ? (
                        <ChevronLeft size={16} />
                    ) : collapsed ? (
                        <ChevronRight size={16} />
                    ) : (
                        <ChevronLeft size={16} />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2 px-2">
                {navItems.map(({ href, label, icon: Icon }) => {
                    // Check if link is active. /dashboard should only match exactly to avoid matching other /dashboard/ routes
                    const isActive = href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(href)

                    return (
                        <Link
                            key={href}
                            href={href}
                            title={collapsed ? label : undefined}
                            className={`
                flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm mb-0.5
                transition-colors duration-100 group
                ${isActive
                                    ? 'bg-[#efefef] text-[#37352f] font-medium'
                                    : 'text-[#787774] hover:bg-[#efefef] hover:text-[#37352f]'
                                }
                ${collapsed ? 'justify-center' : ''}
              `}
                        >
                            <Icon size={16} className="flex-shrink-0" />
                            {!collapsed && <span className="truncate">{label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* User footer */}
            {!collapsed && (
                <div className="px-3 py-3 border-t border-[#e9e9e7]">
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-2">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    width={28}
                                    height={28}
                                    className="rounded-full flex-shrink-0"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-[#37352f] flex items-center justify-center flex-shrink-0">
                                    <User size={13} className="text-white" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[#37352f] truncate">{user.name}</p>
                                <p className="text-[10px] text-[#9b9a97] truncate">{user.email}</p>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                title="Sign out"
                                className="p-1 rounded hover:bg-red-50 text-[#9b9a97] hover:text-red-500 transition-colors flex-shrink-0"
                            >
                                <LogOut size={13} />
                            </button>
                        </div>
                    ) : (
                        <p className="text-[10px] text-[#9b9a97]">Public Viewing Mode</p>
                    )}
                </div>
            )}

            {/* Collapsed user avatar */}
            {collapsed && isAuthenticated && user && (
                <div className="px-2 py-3 border-t border-[#e9e9e7] flex justify-center">
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        title="Sign out"
                        className="p-1 rounded hover:bg-red-50 text-[#9b9a97] hover:text-red-500 transition-colors"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            )}
        </>
    )
}
