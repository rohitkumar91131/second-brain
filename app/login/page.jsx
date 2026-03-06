'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Brain, ArrowRight, Loader2 } from 'lucide-react'

function LoginContent() {
    const router = useRouter()
    const { status } = useSession()
    const searchParams = useSearchParams()
    const [redirecting, setRedirecting] = useState(false)
    const [countdown, setCountdown] = useState(5)
    const timerRef = useRef(null)
    const toastIdRef = useRef(null)

    useEffect(() => {
        if (status === 'authenticated' && !redirecting) {
            setRedirecting(true)

            // Show Sonner toast with countdown
            toastIdRef.current = toast.info(`Redirecting to dashboard in 5s...`, {
                duration: Infinity,
                action: {
                    label: 'Cancel',
                    onClick: () => {
                        if (timerRef.current) clearInterval(timerRef.current)
                        setRedirecting(false)
                        toast.dismiss(toastIdRef.current)
                        toast('Redirection cancelled', { icon: '🛑' })
                    }
                }
            })

            let count = 5
            timerRef.current = setInterval(() => {
                count -= 1
                setCountdown(count)
                if (count <= 0) {
                    clearInterval(timerRef.current)
                    toast.dismiss(toastIdRef.current)
                    router.push('/dashboard')
                } else {
                    toast.info(`Redirecting to dashboard in ${count}s...`, {
                        id: toastIdRef.current,
                    })
                }
            }, 1000)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [status, router, redirecting])

    useEffect(() => {
        const error = searchParams.get('error')
        if (error) {
            toast.error(`Authentication Error: ${error}`, {
                description: 'Please check your connection and account settings.'
            })
        }
    }, [searchParams])

    const [loading, setLoading] = useState(false)

    const handleGoogleSignIn = async () => {
        setLoading(true)
        await signIn('google', { callbackUrl: '/dashboard' })
    }

    return (
        <div className="min-h-screen bg-animate-gradient flex items-center justify-center p-4">
            <div className="w-full max-w-sm animate-fade-in-up">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#37352f] rounded-2xl mb-4 shadow-xl hover-lift">
                        <Brain size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-notion-text tracking-tight">SecondBrain</h1>
                    <p className="text-sm text-notion-muted mt-2 font-medium">Your intelligence engine, organized.</p>
                </div>

                <div className="glass rounded-3xl border border-white/20 dark:border-white/10 p-8 shadow-2xl backdrop-blur-xl bg-white/40 dark:bg-black/40">
                    <h2 className="text-lg font-semibold text-notion-text mb-6 text-center">Welcome Back</h2>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading || redirecting}
                        className="w-full h-12 flex items-center justify-center gap-3 px-6 py-3 bg-notion-bg border border-notion-border rounded-xl text-sm font-bold text-notion-text hover:bg-notion-sidebar hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin text-notion-accent" />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
                    </button>

                    <div className="mt-8 pt-6 border-t border-black/5">
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 text-xs font-semibold text-notion-muted hover:text-notion-text transition-colors group"
                        >
                            <span>Back to homepage</span>
                            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                <p className="text-center text-[11px] text-notion-muted mt-8 font-medium">
                    By continuing, you agree to SecondBrain&apos;s <br />
                    <span className="hover:underline cursor-pointer">Terms of Service</span> and <span className="hover:underline cursor-pointer">Privacy Policy</span>
                </p>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-notion-sidebar flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-notion-text" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
