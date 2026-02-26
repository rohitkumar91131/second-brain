'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
    const [homepageDashboard, setHomepageDashboard] = useState(false)

    useEffect(() => {
        const val = localStorage.getItem('setting_homepage_dashboard') === 'true'
        setHomepageDashboard(val)
    }, [])

    const toggleHomepageDashboard = () => {
        const newVal = !homepageDashboard
        setHomepageDashboard(newVal)
        localStorage.setItem('setting_homepage_dashboard', newVal.toString())
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white">
            <div className="px-6 py-4 border-b border-[#e9e9e7]">
                <h1 className="text-xl font-bold text-[#37352f]">Settings</h1>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-2xl">
                    <section className="mb-10">
                        <h2 className="text-sm font-semibold text-[#9b9a97] uppercase tracking-wider mb-4">General Preferences</h2>

                        <div className="flex items-center justify-between p-4 border border-[#e9e9e7] rounded-xl bg-[#fcfcfc]">
                            <div>
                                <h3 className="font-semibold text-[#37352f] text-sm">Dashboard as Homepage</h3>
                                <p className="text-xs text-[#787774] mt-1">
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
                                <div className="w-11 h-6 bg-[#e9e9e7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2eaadc]"></div>
                            </label>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
