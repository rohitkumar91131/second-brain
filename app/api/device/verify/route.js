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

    // Find token in database with user details populated
    let entry
    try {
        entry = await DeviceToken.findOne({ token, isUsed: false }).populate('userId', 'email name image')
    } catch (e) {
        console.error('Populate error:', e)
        return err('Database error', 500)
    }

    if (!entry) return err('Invalid or expired token', 401)

    // Check if token has expired
    if (Date.now() > entry.expiresAt.getTime()) {
        return err('Token has expired', 401)
    }

    // Verify user still exists - userId is already populated from ref
    let user = entry.userId
    
    // Fallback: if populate failed, query user directly
    if (!user) {
        try {
            user = await User.findById(entry.userId).lean()
        } catch (e) {
            console.error('User lookup error:', e)
        }
    }
    
    if (!user) return err('User not found', 404)

    // Consume token (one-time use) - ONLY after all validations pass
    await DeviceToken.findByIdAndUpdate(entry._id, { isUsed: true })

    // Register / update device
    await Device.findOneAndUpdate(
        { deviceId },
        {
            userId: user._id,
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
            id: user._id.toString(),
            email: user.email,
            name: user.name,
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
