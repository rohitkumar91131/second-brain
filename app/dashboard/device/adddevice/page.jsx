'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useSession, signIn } from 'next-auth/react'
import { useLayoutEffect } from 'react'
import Link from 'next/link'

export default function AddDevicePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session, status } = useSession()
    const [verification, setVerification] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState(false)
    const [timeLeft, setTimeLeft] = useState(300)

    const requestId = searchParams.get('requestId')

    // Fetch verification details
    useEffect(() => {
        if (!requestId) {
            setError('No verification request found')
            setLoading(false)
            return
        }

        const fetchVerification = async () => {
            try {
                const res = await fetch(`/api/device/verify/${requestId}`)
                const data = await res.json()

                if (!res.ok) {
                    setError(data.error || 'Failed to fetch verification')
                    return
                }

                setVerification(data)
            } catch (err) {
                console.error('Error fetching verification:', err)
                setError('Failed to fetch verification details')
            } finally {
                setLoading(false)
            }
        }

        fetchVerification()
    }, [requestId])

    // Handle session redirect - if not logged in, show login prompt
    useEffect(() => {
        if (status === 'loading') return

        if (status === 'unauthenticated') {
            // User needs to login first
        }
    }, [status])

    // Countdown timer
    useEffect(() => {
        if (!requestId) return

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    setError('Verification request expired')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [requestId])

    const handleApprove = async () => {
        if (!session?.user) {
            // Redirect to login
            await signIn()
            return
        }

        setApproving(true)
        setError(null)

        try {
            const res = await fetch(`/api/device/verify/${requestId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to approve device')
                return
            }

            // Show success message
            setVerification({ status: 'approved' })
        } catch (err) {
            console.error('Error approving device:', err)
            setError('Failed to approve device')
        } finally {
            setApproving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-center text-gray-600">Loading verification...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="text-4xl text-red-500 mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Error</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Link
                            href="/dashboard"
                            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (verification?.status === 'approved') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="text-5xl text-green-500 mb-4">✓</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Device Approved!</h1>
                        <p className="text-gray-600 mb-6">Your device has been successfully verified. You can now close this window and return to your app.</p>
                        <Link
                            href="/dashboard"
                            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">📱</div>
                    <h1 className="text-2xl font-bold text-gray-900">Device Verification</h1>
                    <p className="text-gray-600 mt-2">Approve access from your mobile device</p>
                </div>

                {status === 'unauthenticated' ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <p className="text-amber-800 text-sm mb-4">Please log in to approve this device</p>
                        <button
                            onClick={() => signIn()}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                        >
                            Sign In First
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600 mb-3 font-medium">Verification Details</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Request ID:</span>
                                    <span className="text-gray-900 font-mono text-xs">{requestId?.slice(0, 8)}...</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Expires in:</span>
                                    <span className="text-gray-900 font-semibold">
                                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleApprove}
                                disabled={approving || timeLeft <= 0}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {approving ? 'Approving...' : 'Approve Device'}
                            </button>
                            <Link
                                href="/dashboard"
                                className="w-full block text-center bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                            >
                                Deny
                            </Link>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Make sure you recognize this device before approving
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
