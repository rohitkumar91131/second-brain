import connectDB from '@/lib/mongodb'
import Device from '@/lib/models/Device'
import DeviceToken from '@/lib/models/DeviceToken'
import User from '@/lib/models/User'
import { ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'

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

    await connectDB()

    // Find token in database
    const entry = await DeviceToken.findOne({ token, isUsed: false }).populate('userId', 'email name image')
    if (!entry) return err('Invalid or expired token', 401)

    // Check if token has expired
    if (Date.now() > entry.expiresAt.getTime()) {
        return err('Token has expired', 401)
    }

    // Consume token (one-time use)
    await DeviceToken.findByIdAndUpdate(entry._id, { isUsed: true })

    // Verify user still exists - userId is already populated from ref
    if (!entry.userId) return err('User not found', 404)
    
    const user = entry.userId

    // Register / update device
    await Device.findOneAndUpdate(
        { deviceId },
        {
            userId: entry.userId._id,
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
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image ?? null,
        },
    })
})
