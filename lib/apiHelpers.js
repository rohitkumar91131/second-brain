import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verify } from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

/**
 * Get the current authenticated session or return a 401 response.
 * Supports both NextAuth sessions (web) and JWT Bearer tokens (mobile).
 * CRITICAL: Verifies user exists in DB and uses email fallback for ID mismatch
 * Usage: const { session, error } = await requireAuth()
 */
export async function requireAuth(request) {
    // 1. Try NextAuth session first (web browser)
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
        // Verify user exists in database and use consistent ID
        try {
            await connectDB()
            let user = await User.findById(session.user.id).select('_id email name image').lean()
            
            // CRITICAL FIX: If user not found by ID, try email (handles NextAuth sync mismatch)
            if (!user) {
                console.log('[AUTH] User not found by ID, trying email fallback:', session.user.email)
                user = await User.findOne({ email: session.user.email }).select('_id email name image').lean()
                
                if (!user) {
                    console.error('[AUTH] User not found in database:', session.user.email)
                    return {
                        session: null,
                        error: NextResponse.json({ error: 'User not found - please log in again' }, { status: 401 }),
                    }
                }
                
                // Update session with correct MongoDB ID
                session.user.id = user._id.toString()
                console.log('[AUTH] User verified by email fallback. Using ID:', user._id)
            }
        } catch (error) {
            console.error('[AUTH] Error verifying user:', error)
            // Don't fail entirely, just log it
        }
        
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
            
            // CRITICAL FIX: Verify user exists and use email fallback
            try {
                await connectDB()
                let user = await User.findById(payload.id).select('_id email name image').lean()
                
                if (!user) {
                    console.log('[AUTH] User not found by ID, trying email fallback:', payload.email)
                    user = await User.findOne({ email: payload.email }).select('_id email name image').lean()
                    
                    if (!user) {
                        console.error('[AUTH] User not found:', payload.email)
                        return {
                            session: null,
                            error: NextResponse.json({ error: 'User not found - please register first' }, { status: 401 }),
                        }
                    }
                }
                
                // Use correct MongoDB ID
                const userId = user._id.toString()
                
                return {
                    session: {
                        user: {
                            id: userId,
                            email: user.email,
                            name: user.name,
                            image: user.image ?? null,
                        },
                    },
                    error: null,
                }
            } catch (dbError) {
                console.error('[AUTH] Database error:', dbError)
                // Fall back to token payload if DB fails
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
