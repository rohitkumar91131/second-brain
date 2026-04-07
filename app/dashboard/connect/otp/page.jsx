'use client'

import { useState, useEffect, useCallback } from 'react'
import { Smartphone, RefreshCw, Clock, Key, WifiOff, Wifi } from 'lucide-react'
import Link from 'next/link'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

export default function ConnectOtpPage() {
    const [otp, setOtp] = useState(null)
    const [expiresAt, setExpiresAt] = useState(null)
    const [secondsLeft, setSecondsLeft] = useState(0)
    const [loading, setLoading] = useState(false)
    const [fetchingDevices, setFetchingDevices] = useState(false)
    const [devicesFetching, setDevicesFetching] = useState(true)
    const [devices, setDevices] = useState([])

    const fetchDevices = useCallback(async () => {
        setFetchingDevices(true)
        try {
            const res = await fetch('/api/device')
            if (res.ok) {
                const data = await res.json()
                setDevices(Array.isArray(data) ? data : [])
            }
        } finally {
            setFetchingDevices(false)
        }
    }, [])

    const generateOtp = useCallback(async () => {
        setLoading(true)
        setOtp(null)
        try {
            const res = await fetch('/api/device/otp', { method: 'POST' })
            if (!res.ok) throw new Error('Failed to generate OTP')
            const data = await res.json()
            setOtp(data.otp)
            setExpiresAt(data.expiresAt)
            setSecondsLeft(Math.floor((data.expiresAt - Date.now()) / 1000))
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [])

    // Countdown timer
    useEffect(() => {
        if (!expiresAt) return
        const id = setInterval(() => {
            const s = Math.floor((expiresAt - Date.now()) / 1000)
            if (s <= 0) {
                clearInterval(id)
                setSecondsLeft(0)
                setOtp(null)
            } else {
                setSecondsLeft(s)
            }
        }, 1000)
        return () => clearInterval(id)
    }, [expiresAt])

    // Auto-poll for new devices
    useEffect(() => {
        if (!devicesFetching) return
        fetchDevices()
        const id = setInterval(fetchDevices, 5000)
        return () => clearInterval(id)
    }, [devicesFetching, fetchDevices])

    useEffect(() => {
        fetchDevices()
        generateOtp()
    }, [fetchDevices, generateOtp])

    const formatTime = (s) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m}:${sec.toString().padStart(2, '0')}`
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                    <Link href="/dashboard/connect" className="hover:text-white transition-colors">Connect</Link>
                    <span>/</span>
                    <span className="text-white">OTP</span>
                </div>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                    <Key size={28} className="text-indigo-400" />
                    Connect via OTP
                </h1>
                <p className="text-slate-400">
                    Use this 6-digit code to connect the Second Brain mobile app without scanning a QR code.
                </p>
            </div>

            <div className="grid gap-6">
                {/* OTP Display Card */}
                <div className="glass rounded-3xl p-8 border border-white/5 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 self-start">
                        <Key size={16} className="text-indigo-400" />
                        Your One-Time Password
                    </div>

                    {/* OTP Digits */}
                    <div className="flex items-center justify-center gap-2">
                        {loading ? (
                            <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
                        ) : otp && secondsLeft > 0 ? (
                            otp.split('').map((digit, i) => (
                                <div
                                    key={i}
                                    className="w-14 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-3xl font-black text-white"
                                >
                                    {digit}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 text-sm px-4">
                                <Clock size={32} className="mx-auto mb-2 text-slate-600" />
                                OTP expired
                            </div>
                        )}
                    </div>

                    {/* Timer and Refresh */}
                    <div className="flex items-center gap-3 w-full">
                        {secondsLeft > 0 && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={12} />
                                Expires in {formatTime(secondsLeft)}
                            </span>
                        )}
                        <button
                            onClick={generateOtp}
                            disabled={loading}
                            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-semibold transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Refresh OTP
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="w-full p-4 bg-white/5 rounded-2xl text-xs text-slate-400 space-y-1.5">
                        <p className="font-semibold text-slate-300 mb-2">How to use:</p>
                        <p>1. Open the Second Brain app on your phone</p>
                        <p>2. Go to <strong className="text-slate-300">Settings → Connect to Web</strong></p>
                        <p>3. Tap <strong className="text-slate-300">Connect via OTP</strong></p>
                        <p>4. Enter your email address and this 6-digit code</p>
                    </div>
                </div>

                {/* Device Fetch Controls */}
                <div className="glass rounded-3xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            {devicesFetching ? (
                                <Wifi size={16} className="text-green-400 animate-pulse" />
                            ) : (
                                <WifiOff size={16} className="text-slate-500" />
                            )}
                            Device Polling
                            <span className="text-xs font-normal text-slate-500">
                                {devicesFetching ? 'Active (every 5s)' : 'Paused'}
                            </span>
                        </h2>
                        <button
                            onClick={() => setDevicesFetching(prev => !prev)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                devicesFetching
                                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                    : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                            }`}
                        >
                            {devicesFetching ? (
                                <>
                                    <WifiOff size={12} />
                                    Stop Fetching
                                </>
                            ) : (
                                <>
                                    <Wifi size={12} />
                                    Resume Fetching
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{devices.length} device{devices.length !== 1 ? 's' : ''} connected</span>
                        <button
                            onClick={fetchDevices}
                            disabled={fetchingDevices}
                            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={10} className={fetchingDevices ? 'animate-spin' : ''} />
                            Refresh now
                        </button>
                    </div>
                </div>

                {/* Back link */}
                <Link
                    href="/dashboard/connect"
                    className="text-center text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                    ← Back to Connect
                </Link>
            </div>
        </div>
    )
}
