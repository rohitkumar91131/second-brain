'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Brain, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

function OAuthButton({ provider, icon, label, color }) {
    const [loading, setLoading] = useState(false)
    return (
        <button
            onClick={async () => {
                setLoading(true)
                await signIn(provider, { callbackUrl: '/' })
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-[#e9e9e7] rounded-lg text-sm font-medium text-[#37352f] bg-white hover:bg-[#f7f7f5] transition-colors disabled:opacity-60"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
            {label}
        </button>
    )
}

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlMessage = searchParams.get('message')
    const urlError = searchParams.get('error')

    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState(urlError || '')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await signIn('credentials', {
            email: form.email,
            password: form.password,
            redirect: false,
        })

        setLoading(false)

        if (result?.error) {
            setError(result.error)
        } else {
            router.push('/')
        }
    }

    return (
        <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-[#37352f] rounded-xl mb-4">
                        <Brain size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#37352f]">Second Brain</h1>
                    <p className="text-sm text-[#9b9a97] mt-1">Sign in to your workspace</p>
                </div>

                <div className="bg-white rounded-2xl border border-[#e9e9e7] p-6 shadow-sm">
                    {/* OAuth Buttons */}
                    <div className="space-y-2.5 mb-5">
                        <OAuthButton
                            provider="google"
                            label="Continue with Google"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            }
                        />
                        <OAuthButton
                            provider="facebook"
                            label="Continue with Facebook"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            }
                        />
                        <OAuthButton
                            provider="github"
                            label="Continue with GitHub"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            }
                        />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-[#e9e9e7]" />
                        <span className="text-xs text-[#9b9a97]">or</span>
                        <div className="flex-1 h-px bg-[#e9e9e7]" />
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {urlMessage && (
                            <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-600 flex items-center gap-2">
                                <CheckCircle2 size={14} />
                                {urlMessage}
                            </div>
                        )}

                        {error && (
                            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-[#37352f] mb-1">Email</label>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                placeholder="you@example.com"
                                className="w-full px-3 py-2 text-sm border border-[#e9e9e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37352f]/20 focus:border-[#37352f] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[#37352f] mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 pr-9 text-sm border border-[#e9e9e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37352f]/20 focus:border-[#37352f] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(s => !s)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9b9a97] hover:text-[#37352f]"
                                >
                                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#37352f] text-white text-sm font-medium rounded-lg hover:bg-[#2f2d28] transition-colors disabled:opacity-60"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            Sign in
                        </button>
                    </form>

                    <p className="text-center text-xs text-[#9b9a97] mt-4">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-[#37352f] font-medium hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-[#37352f]" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
