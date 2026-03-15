'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import {
    LayoutDashboard, CheckSquare, FolderOpen, Target, Map,
    BookOpen, FileText, BookMarked, Archive, ChevronLeft,
    ChevronRight, Brain, LogOut, User, Settings, Trash2,
    Image as ImageIcon,
    ExternalLink
} from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/dashboard/media', label: 'Media Bank', icon: ImageIcon },
    { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
    { href: '/dashboard/goals', label: 'Goals', icon: Target },
    { href: '/dashboard/areas', label: 'Areas', icon: Map },
    { href: '/dashboard/resources', label: 'Resources', icon: BookOpen },
    { href: '/dashboard/notes', label: 'Notes', icon: FileText },
    { href: '/dashboard/journal', label: 'Journal', icon: BookMarked },
    { href: '/dashboard/archive', label: 'Archive', icon: Archive },
    { href: '/dashboard/recycle-bin', label: 'Recycle Bin', icon: Trash2 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ mobileOpen, onMobileClose }) {
    const pathname = usePathname()
    const { sidebarCollapsed, setSidebarCollapsed } = useApp()

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className={`
          hidden md:flex flex-col h-full bg-transparent overflow-hidden flex-shrink-0
          sidebar-transition
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
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
          md:hidden fixed top-0 left-0 h-full w-72 bg-[#0F172A] z-50 sidebar-transition flex flex-col
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
        <div className="flex flex-col h-full glass m-2 md:m-3 overflow-hidden border-white/5">
            {/* Header */}
            <div className={`flex items-center h-16 px-4 border-b border-white/5 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed ? (
                    <>
                        <Link href="/" className="flex items-center gap-3 min-w-0 group">
                            <div className="w-8 h-8 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Brain size={18} className="text-white" />
                            </div>
                            <span className="font-bold text-base text-white tracking-tight truncate">Second Brain</span>
                        </Link>
                        {!isMobile && (
                            <button
                                onClick={onToggle}
                                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                                title="Collapse sidebar"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        )}
                    </>
                ) : (
                    <button
                        onClick={onToggle}
                        className="group relative w-10 h-10 flex items-center justify-center"
                        title="Expand sidebar"
                    >
                        <div className="absolute inset-0 rounded-xl premium-gradient opacity-100 group-hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20" />
                        <div className="relative z-10 transition-all duration-300 group-hover:opacity-0 group-hover:scale-50">
                            <Brain size={18} className="text-white" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <ChevronRight size={20} className="text-white" strokeWidth={3} />
                        </div>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const { href, label, icon: Icon } = item;
                    const isActive = href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(href)

                    return (
                        <Link
                            key={href}
                            href={href}
                            target={item.target}
                            rel={item.target === '_blank' ? "noopener noreferrer" : undefined}
                            title={collapsed ? label : item.title}
                            className={`
                              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                              transition-all duration-200 group relative
                              ${isActive
                                    ? 'bg-white/10 text-white font-semibold shadow-sm'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }
                              ${collapsed ? 'justify-center px-0' : ''}
                            `}
                        >
                            {isActive && (
                                <div className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-full" />
                            )}
                            <Icon size={18} className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : ''}`} />
                            {!collapsed && (
                                <span className="truncate flex-1">{label}</span>
                            )}
                            {!collapsed && item.target === '_blank' && (
                                <ExternalLink size={12} className="text-white/20 ml-auto group-hover:text-white/50 transition-colors" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User footer */}
            <div className="p-4 border-t border-white/5">
                {isAuthenticated && user ? (
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="relative group">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    width={32}
                                    height={32}
                                    className="rounded-xl ring-2 ring-white/5 group-hover:ring-indigo-500/50 transition-all"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-xl premium-gradient flex items-center justify-center ring-2 ring-white/5">
                                    <User size={14} className="text-white" />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#1E293B] rounded-full"></div>
                        </div>

                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                            </div>
                        )}

                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            title="Sign out"
                            className={`p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all ${collapsed ? 'hidden' : ''}`}
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    !collapsed && <p className="text-[10px] text-slate-500 text-center font-medium uppercase tracking-wider">Public Mode</p>
                )}

                {collapsed && isAuthenticated && user && (
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        title="Sign out"
                        className="mt-4 w-full flex justify-center p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                    >
                        <LogOut size={16} />
                    </button>
                )}
            </div>
        </div>
    )
}
