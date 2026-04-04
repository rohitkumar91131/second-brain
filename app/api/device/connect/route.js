import { requireAuth, ok, withErrorHandler } from '@/lib/apiHelpers'
import crypto from 'crypto'

// In-memory store for connect tokens (TTL: 5 minutes).
// For production you can move this to Redis / MongoDB.
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
