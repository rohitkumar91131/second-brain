'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Smartphone, RefreshCw, Trash2, CheckCircle2, Clock, Wifi, Key } from 'lucide-react'
import { format } from 'date-fns'

// ─── QR Code renderer (pure-SVG, no external library needed) ──────────────
// We use the `qrcode` npm package via a dynamic import so it only loads client-side
async function generateQRDataURL(text) {
    const QRCode = (await import('qrcode')).default
    return QRCode.toDataURL(text, { width: 240, margin: 2, color: { dark: '#fff', light: '#0F172A' } })
}

export default function ConnectPage() {
    const [qrDataUrl, setQrDataUrl] = useState(null)
    const [token, setToken] = useState(null)
    const [expiresAt, setExpiresAt] = useState(null)
    const [secondsLeft, setSecondsLeft] = useState(0)
    const [loading, setLoading] = useState(false)
    const [devices, setDevices] = useState([])
    const [devicesLoading, setDevicesLoading] = useState(true)

    const fetchDevices = useCallback(async () => {
        setDevicesLoading(true)
        try {
            const res = await fetch('/api/device')
            if (res.ok) {
                const data = await res.json()
                setDevices(Array.isArray(data) ? data : [])
            }
        } finally {
            setDevicesLoading(false)
        }
    }, [])

    const generateToken = useCallback(async () => {
        setLoading(true)
        setQrDataUrl(null)
        try {
            const res = await fetch('/api/device/connect', { method: 'POST' })
            if (!res.ok) throw new Error('Failed')
            const data = await res.json()
            setToken(data.token)
            setExpiresAt(data.expiresAt)
            setSecondsLeft(Math.floor((data.expiresAt - Date.now()) / 1000))

            // Build the deep-link URL the mobile app will parse
            const appUrl = window.location.origin
            const deepLink = `secondbrain://connect?token=${data.token}&server=${encodeURIComponent(appUrl)}`
            const dataUrl = await generateQRDataURL(deepLink)
            setQrDataUrl(dataUrl)
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
                setQrDataUrl(null)
                setToken(null)
            } else {
                setSecondsLeft(s)
            }
        }, 1000)
        return () => clearInterval(id)
    }, [expiresAt])

    // Poll for new device connections while QR is visible
    useEffect(() => {
        if (!token) return
        const id = setInterval(fetchDevices, 4000)
        return () => clearInterval(id)
    }, [token, fetchDevices])

    useEffect(() => {
        fetchDevices()
        generateToken()
    }, [fetchDevices, generateToken])

    const removeDevice = async (deviceId) => {
        try {
            await fetch(`/api/device/${deviceId}`, { method: 'DELETE' })
            setDevices(prev => prev.filter(d => d.id !== deviceId))
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                    <Wifi size={28} className="text-indigo-400" />
                    Connect Mobile App
                </h1>
                <p className="text-slate-400">
                    Scan the QR code with your Second Brain mobile app to instantly sync your data.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* QR Code Card */}
                <div className="glass rounded-3xl p-8 border border-white/5 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 self-start">
                        <Smartphone size={16} className="text-indigo-400" />
                        Scan to Connect
                    </div>

                    <div className="relative w-60 h-60 rounded-2xl overflow-hidden flex items-center justify-center bg-[#0F172A] border border-white/10">
                        {loading && (
                            <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
                        )}
                        {!loading && qrDataUrl && secondsLeft > 0 && (
                            <Image src={qrDataUrl} alt="QR Code" width={240} height={240} className="w-full h-full object-contain" unoptimized />
                        )}
                        {!loading && (!qrDataUrl || secondsLeft <= 0) && (
                            <div className="text-center text-slate-500 text-sm px-4">
                                <Clock size={32} className="mx-auto mb-2 text-slate-600" />
                                QR code expired
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full">
                        {secondsLeft > 0 && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={12} />
                                Expires in {secondsLeft}s
                            </span>
                        )}
                        <button
                            onClick={generateToken}
                            disabled={loading}
                            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-semibold transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>

                    <div className="text-xs text-slate-500 text-center space-y-1">
                        <p>1. Open the Second Brain app on your phone</p>
                        <p>2. Go to <strong className="text-slate-400">Settings → Connect to Web</strong></p>
                        <p>3. Tap <strong className="text-slate-400">Scan QR Code</strong></p>
                    </div>

                    {/* OTP alternative */}
                    <div className="w-full border-t border-white/5 pt-4 mt-2">
                        <p className="text-xs text-slate-500 text-center mb-3">Can't scan? Use OTP instead</p>
                        <Link
                            href="/dashboard/connect/otp"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-semibold transition-all border border-indigo-500/20"
                        >
                            <Key size={16} />
                            Connect via 6-Digit OTP
                        </Link>
                    </div>
                </div>

                {/* Connected Devices */}
                <div className="glass rounded-3xl p-8 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-green-400" />
                            Connected Devices
                            <span className="ml-auto text-xs font-normal text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                                {devices.length}
                            </span>
                        </h2>
                        <button
                            onClick={fetchDevices}
                            disabled={devicesLoading}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold transition-all disabled:opacity-50"
                            title="Manually fetch connected devices"
                        >
                            <RefreshCw size={12} className={devicesLoading ? 'animate-spin' : ''} />
                            Fetch
                        </button>
                    </div>

                    {devicesLoading && (
                        <div className="space-y-3">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    )}

                    {!devicesLoading && devices.length === 0 && (
                        <div className="text-center text-slate-500 text-sm py-8">
                            <Smartphone size={32} className="mx-auto mb-2 text-slate-600" />
                            No devices connected yet.
                            <br />
                            Scan the QR code to get started.
                        </div>
                    )}

                    <div className="space-y-3">
                        {devices.map(device => (
                            <div
                                key={device.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                    <Smartphone size={16} className="text-indigo-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{device.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {device.platform} · Last seen {device.lastSeen ? format(new Date(device.lastSeen), 'MMM d, HH:mm') : 'N/A'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeDevice(device.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                                    title="Remove device"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
