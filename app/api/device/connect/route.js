import { requireAuth, ok, withErrorHandler } from '@/lib/apiHelpers'
import connectDB from '@/lib/mongodb'
import DeviceToken from '@/lib/models/DeviceToken'
import mongoose from 'mongoose'
import crypto from 'crypto'

const TOKEN_TTL_MS = 5 * 60 * 1000 // 5 minutes

// POST /api/device/connect — generate a QR token for mobile pairing
export const POST = withErrorHandler(async () => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)
    const userId = new mongoose.Types.ObjectId(session.user.id)

    // Save token to MongoDB
    const deviceToken = new DeviceToken({
        token,
        userId,
        userName: session.user.name,
        userEmail: session.user.email,
        expiresAt,
    })

    await deviceToken.save()

    return ok({ token, expiresAt: expiresAt.getTime() })
})
