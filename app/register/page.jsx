'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Brain, Eye, EyeOff, Loader2, Check, X } from 'lucide-react'

function PasswordRule({ met, label }) {
    return (
        <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-[#9b9a97]'}`}>
            {met ? <Check size={11} /> : <X size={11} />}
            {label}
        </div>
    )
}

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const rules = {
        length: form.password.length >= 8,
        upper: /[A-Z]/.test(form.password),
        number: /[0-9]/.test(form.password),
        match: form.password === form.confirm && form.confirm.length > 0,
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!rules.length || !rules.upper || !rules.number) {
            setError('Password does not meet requirements')
            return
        }
        if (!rules.match) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Registration failed')
                setLoading(false)
                return
            }

            // Auto sign-in after registration
            await signIn('credentials', {
                email: form.email,
                password: form.password,
                callbackUrl: '/',
            })
        } catch {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-[#37352f] rounded-xl mb-4">
                        <Brain size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#37352f]">Create account</h1>
                    <p className="text-sm text-[#9b9a97] mt-1">Start building your second brain</p>
                </div>

                <div className="bg-white rounded-2xl border border-[#e9e9e7] p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {error && (
                            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-[#37352f] mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="Your name"
                                className="w-full px-3 py-2 text-sm border border-[#e9e9e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37352f]/20 focus:border-[#37352f] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[#37352f] mb-1">Email</label>
                            <input
                                type="email"
                                required
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
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 pr-9 text-sm border border-[#e9e9e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37352f]/20 focus:border-[#37352f] transition-all"
                                />
                                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9b9a97]">
                                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            {form.password && (
                                <div className="mt-1.5 space-y-0.5">
                                    <PasswordRule met={rules.length} label="At least 8 characters" />
                                    <PasswordRule met={rules.upper} label="One uppercase letter" />
                                    <PasswordRule met={rules.number} label="One number" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[#37352f] mb-1">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={form.confirm}
                                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 text-sm border border-[#e9e9e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37352f]/20 focus:border-[#37352f] transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#37352f] text-white text-sm font-medium rounded-lg hover:bg-[#2f2d28] transition-colors disabled:opacity-60"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            Create account
                        </button>
                    </form>

                    <p className="text-center text-xs text-[#9b9a97] mt-4">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#37352f] font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
