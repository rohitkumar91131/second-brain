'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Sun, Moon } from 'lucide-react'

const themeOptions = [
    { value: 'system', label: 'System', icon: Monitor, desc: 'Follow your device\'s system preference' },
    { value: 'light', label: 'Light', icon: Sun, desc: 'Always use light mode' },
    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Always use dark mode' },
]

export default function SettingsPage() {
    const [homepageDashboard, setHomepageDashboard] = useState(false)
    const [defaultPdfTheme, setDefaultPdfTheme] = useState('bright')
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const val = localStorage.getItem('setting_homepage_dashboard') === 'true'
        setHomepageDashboard(val)

        const pdfVal = localStorage.getItem('setting_pdf_theme') || 'bright'
        setDefaultPdfTheme(pdfVal)
    }, [])

    const toggleHomepageDashboard = () => {
        const newVal = !homepageDashboard
        setHomepageDashboard(newVal)
        localStorage.setItem('setting_homepage_dashboard', newVal.toString())
    }

    const handlePdfThemeChange = (val) => {
        setDefaultPdfTheme(val)
        localStorage.setItem('setting_pdf_theme', val)
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-notion-bg">
            <div className="px-6 py-4 border-b border-notion-border">
                <h1 className="text-xl font-bold text-notion-text">Settings</h1>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-2xl">

                    {/* Theme Section */}
                    <section className="mb-10">
                        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-4">Appearance</h2>

                        <div className="p-4 border border-notion-border rounded-xl bg-notion-card">
                            <div className="mb-4">
                                <h3 className="font-semibold text-notion-text text-sm">Theme</h3>
                                <p className="text-xs text-notion-muted mt-1">
                                    Choose how Second Brain looks. Defaults to your system setting.
                                </p>
                            </div>

                            {mounted ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {themeOptions.map(({ value, label, icon: Icon, desc }) => {
                                        const isActive = theme === value
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => setTheme(value)}
                                                className={`
                                                    flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150
                                                    ${isActive
                                                        ? 'border-notion-accent bg-notion-hover text-notion-text'
                                                        : 'border-notion-border bg-notion-bg text-notion-muted hover:border-notion-accent hover:text-notion-text hover:bg-notion-hover'
                                                    }
                                                `}
                                                title={desc}
                                            >
                                                <Icon
                                                    size={22}
                                                    className={isActive ? 'text-notion-accent' : 'text-notion-muted'}
                                                />
                                                <span className={`text-xs font-semibold ${isActive ? 'text-notion-text' : 'text-notion-muted'}`}>
                                                    {label}
                                                </span>
                                                {isActive && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-notion-accent" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {themeOptions.map(({ value }) => (
                                        <div key={value} className="h-24 rounded-xl border border-notion-border bg-notion-hover animate-pulse" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* General Preferences Section */}
                    <section className="mb-10">
                        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-4">General Preferences</h2>

                        <div className="flex items-center justify-between p-4 border border-notion-border rounded-xl bg-notion-card">
                            <div>
                                <h3 className="font-semibold text-notion-text text-sm">Dashboard as Homepage</h3>
                                <p className="text-xs text-notion-muted mt-1">
                                    Automatically redirect to the dashboard when visiting the root URL.
                                </p>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={homepageDashboard}
                                    onChange={toggleHomepageDashboard}
                                />
                                <div className="w-11 h-6 bg-notion-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-notion-accent"></div>
                            </label>
                        </div>
                    </section>

                    {/* Export Preferences Section */}
                    <section className="mb-10">
                        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-4">Export Preferences</h2>

                        <div className="p-4 border border-notion-border rounded-xl bg-notion-card">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-semibold text-notion-text text-sm">Default PDF Theme</h3>
                                    <p className="text-xs text-notion-muted mt-1">
                                        Choose the default visual style for PDF exports.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handlePdfThemeChange('bright')}
                                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${defaultPdfTheme === 'bright' ? 'border-notion-accent bg-notion-accent/10 text-notion-text' : 'border-notion-border text-notion-muted hover:border-notion-muted'}`}
                                >
                                    Bright Mode
                                </button>
                                <button
                                    onClick={() => handlePdfThemeChange('dark')}
                                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${defaultPdfTheme === 'dark' ? 'border-notion-accent bg-notion-accent/10 text-notion-text' : 'border-notion-border text-notion-muted hover:border-notion-muted'}`}
                                >
                                    Dark Mode
                                </button>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    )
}
