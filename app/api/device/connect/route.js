import { requireAuth, ok, withErrorHandler } from '@/lib/apiHelpers'
import crypto from 'crypto'

/**
 * In-memory store for one-time QR pairing tokens (TTL: 5 minutes).
 *
 * ⚠️  PRODUCTION WARNING: In-memory storage does NOT work reliably in
 * serverless / edge environments (e.g. Vercel, AWS Lambda) because each
 * request may be handled by a different function instance.
 * For production, replace this Map with a short-lived Redis key-value store
 * (e.g. Upstash Redis) or a MongoDB document with a TTL index.
 */
const connectTokens = new Map()

const TOKEN_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Clean up expired tokens periodically
function pruneExpired() {
    const now = Date.now()
    for (const [token, entry] of connectTokens.entries()) {
        if (now > entry.expiresAt) connectTokens.delete(token)
    }
}

// POST /api/device/connect — generate a QR token for mobile pairing
export const POST = withErrorHandler(async () => {
    const { session, error } = await requireAuth()
    if (error) return error

    pruneExpired()

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + TOKEN_TTL_MS

    connectTokens.set(token, {
        userId: session.user.id,
        userName: session.user.name,
        userEmail: session.user.email,
        expiresAt,
    })

    return ok({ token, expiresAt })
})

// Export for use by the verify route
export { connectTokens }
