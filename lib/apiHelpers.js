import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

/**
 * Get the current authenticated session or return a 401 response.
 * Usage: const { session, error } = await requireAuth(request)
 */
export async function requireAuth() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return {
            session: null,
            error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        }
    }
    return { session, error: null }
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
