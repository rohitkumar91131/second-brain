import { requireAuth, ok, withErrorHandler } from '@/lib/apiHelpers'
import connectDB from '@/lib/mongodb'
import DeviceToken from '@/lib/models/DeviceToken'
import mongoose from 'mongoose'
import crypto from 'crypto'

const TOKEN_TTL_MS = 5 * 60 * 1000

export const POST = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth(request)
    if (error) return error

    await connectDB()

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)
    
    let userId
    try {
        userId = new mongoose.Types.ObjectId(session.user.id)
    } catch (e) {
        console.error('Invalid userId:', session.user.id, e)
        userId = session.user.id
    }

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
