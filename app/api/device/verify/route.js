import connectDB from '@/lib/mongodb'
import Device from '@/lib/models/Device'
import User from '@/lib/models/User'
import { ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'

// Import shared token store from the connect route module
import { connectTokens } from '@/app/api/device/connect/route'

const VerifySchema = z.object({
    token: z.string().min(1),
    deviceName: z.string().min(1).max(100).default('My Phone'),
    platform: z.enum(['android', 'ios', 'unknown']).default('unknown'),
    deviceId: z.string().min(1).max(200),
    fcmToken: z.string().optional().nullable(),
})

// POST /api/device/verify — called by mobile app after scanning QR code
export const POST = withErrorHandler(async (request) => {
    const body = await request.json()
    const parsed = VerifySchema.safeParse(body)
    if (!parsed.success) return err('Validation failed', 422, parsed.error.flatten())

    const { token, deviceName, platform, deviceId, fcmToken } = parsed.data

    const entry = connectTokens.get(token)
    if (!entry) return err('Invalid or expired token', 401)
    if (Date.now() > entry.expiresAt) {
        connectTokens.delete(token)
        return err('Token has expired', 401)
    }

    // Consume token (one-time use)
    connectTokens.delete(token)

    await connectDB()

    // Verify user still exists
    const user = await User.findById(entry.userId).lean()
    if (!user) return err('User not found', 404)

    // Register / update device
    await Device.findOneAndUpdate(
        { deviceId },
        {
            userId: entry.userId,
            name: deviceName,
            platform,
            fcmToken: fcmToken ?? null,
            lastSeen: new Date(),
            isActive: true,
        },
        { upsert: true, new: true, runValidators: true }
    )

    // Issue a JWT for the mobile client to use on subsequent API calls
    const jwtSecret = process.env.NEXTAUTH_SECRET
    const accessToken = sign(
        {
            id: entry.userId.toString(),
            email: entry.userEmail,
            name: entry.userName,
            provider: 'device',
            deviceId,
        },
        jwtSecret,
        { expiresIn: '30d' }
    )

    return ok({
        accessToken,
        user: {
            id: entry.userId.toString(),
            name: entry.userName,
            email: entry.userEmail,
            image: user.image ?? null,
        },
    })
})
