import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verify } from 'jsonwebtoken'

/**
 * Get the current authenticated session or return a 401 response.
 * Supports both NextAuth sessions (web) and JWT Bearer tokens (mobile).
 * Usage: const { session, error } = await requireAuth()
 */
export async function requireAuth(request) {
    // 1. Try NextAuth session first (web browser)
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
        return { session, error: null }
    }

    // 2. Fall back to Bearer JWT (mobile app).
    // Prefer the explicit request object; fall back to Next.js headers() for
    // handlers that do not forward the request argument.
    let authHeader = request?.headers?.get?.('authorization') ?? ''
    if (!authHeader) {
        try {
            authHeader = (await headers()).get('authorization') ?? ''
        } catch {
            authHeader = ''
        }
    }

    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        try {
            const payload = verify(token, process.env.NEXTAUTH_SECRET)
            return {
                session: {
                    user: {
                        id: payload.id,
                        email: payload.email,
                        name: payload.name,
                        image: payload.image ?? null,
                    },
                },
                error: null,
            }
        } catch {
            return {
                session: null,
                error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }),
            }
        }
    }

    return {
        session: null,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
}

/**
 * Standard success response
 */
export function ok(data, status = 200) {
    return NextResponse.json(data, { status })
}

/**
 * Standard error response
 */
export function err(message, status = 400, details = null) {
    return NextResponse.json({ error: message, ...(details && { details }) }, { status })
}

/**
 * Wrap an API handler with error catching
 */
export function withErrorHandler(handler) {
    return async (...args) => {
        try {
            return await handler(...args)
        } catch (error) {
            console.error('API Error:', error)
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
        }
    }
}
