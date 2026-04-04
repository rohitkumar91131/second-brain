import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import DeviceVerification from '@/lib/models/DeviceVerification'
import Device from '@/lib/models/Device'
import User from '@/lib/models/User'
import { sign } from 'jsonwebtoken'
import { ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { getServerSession } from 'next-auth'

// POST /api/device/verify/[requestId]/approve — approve device from web
export const POST = withErrorHandler(async (request, { params }) => {
    const { requestId } = params

    if (!requestId) return err('Request ID required', 400)

    const session = await getServerSession()
    if (!session?.user?.id) return err('Unauthorized', 401)

    await connectDB()

    const verification = await DeviceVerification.findOne({ requestId })

    if (!verification) {
        return err('Verification request not found', 404)
    }

    // Check expiration
    if (new Date() > verification.expiresAt) {
        await DeviceVerification.updateOne({ requestId }, { status: 'expired' })
        return err('Verification request expired', 410)
    }

    if (verification.status !== 'pending') {
        return err(`Verification already ${verification.status}`, 400)
    }

    const userId = session.user.id

    // Update verification status
    await DeviceVerification.findByIdAndUpdate(verification._id, {
        status: 'approved',
        userId,
        approvedAt: new Date(),
        approverIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        approverUserAgent: request.headers.get('user-agent'),
    })

    // Upsert device
    await Device.findOneAndUpdate(
        { deviceId: verification.deviceId },
        {
            userId,
            name: verification.deviceName,
            platform: verification.platform,
            fcmToken: verification.fcmToken || null,
            lastSeen: new Date(),
            isActive: true,
        },
        { upsert: true, new: true }
    )

    const user = await User.findById(userId).select('_id email name image')

    if (!user) {
        return err('User not found', 404)
    }

    // Generate JWT
    const accessToken = sign(
        {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            provider: 'device',
            deviceId: verification.deviceId,
        },
        process.env.NEXTAUTH_SECRET,
        { expiresIn: '30d' }
    )

    return ok({
        accessToken,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image || null,
        },
    })
})
