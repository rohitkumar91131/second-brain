import connectDB from '@/lib/mongodb'
import Device from '@/lib/models/Device'
import DeviceToken from '@/lib/models/DeviceToken'
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

export const POST = withErrorHandler(async (request) => {
    const body = await request.json()
    const parsed = VerifySchema.safeParse(body)
    if (!parsed.success) {
        return err('Validation failed', 422, parsed.error.flatten())
    }

    const { token, deviceName, platform, deviceId, fcmToken } = parsed.data

    await connectDB()

    // Find the device token
    const deviceToken = await DeviceToken.findOne({ token, isUsed: false }).populate('userId', '_id email name image')
    
    if (!deviceToken) {
        return err('Invalid or expired token', 401)
    }

    // Check expiration
    if (Date.now() > new Date(deviceToken.expiresAt).getTime()) {
        return err('Token has expired', 401)
    }

    // Get user data from populated reference
    const userData = deviceToken.userId
    
    if (!userData) {
        return err('User not found', 404)
    }

    // Mark token as used
    await DeviceToken.findByIdAndUpdate(deviceToken._id, { isUsed: true })

    // Upsert device
    await Device.findOneAndUpdate(
        { deviceId },
        {
            userId: userData._id,
            name: deviceName,
            platform: platform || 'unknown',
            fcmToken: fcmToken || null,
            lastSeen: new Date(),
            isActive: true,
        },
        { upsert: true, new: true }
    )

    // Generate JWT
    const accessToken = sign(
        {
            id: userData._id.toString(),
            email: userData.email,
            name: userData.name,
            provider: 'device',
            deviceId,
        },
        process.env.NEXTAUTH_SECRET,
        { expiresIn: '30d' }
    )

    return ok({
        accessToken,
        user: {
            id: userData._id.toString(),
            name: userData.name,
            email: userData.email,
            image: userData.image || null,
        },
    })
})
