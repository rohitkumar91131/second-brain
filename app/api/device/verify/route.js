import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Device from '@/lib/models/Device'
import DeviceToken from '@/lib/models/DeviceToken'
import User from '@/lib/models/User'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'

const VerifySchema = z.object({
    token: z.string().min(1),
    deviceName: z.string().min(1).max(100).default('My Phone'),
    platform: z.enum(['android', 'ios', 'unknown']).default('unknown'),
    deviceId: z.string().min(1).max(200),
    fcmToken: z.string().optional().nullable(),
})

export async function POST(request) {
    try {
        const body = await request.json()
        const parsed = VerifySchema.safeParse(body)
        
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten() },
                { status: 422 }
            )
        }

        const { token, deviceName, platform, deviceId, fcmToken } = parsed.data

        await connectDB()

        // Find the device token
        const deviceToken = await DeviceToken.findOne({ token, isUsed: false })
        
        if (!deviceToken) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        }

        // Check expiration
        if (Date.now() > new Date(deviceToken.expiresAt).getTime()) {
            return NextResponse.json(
                { error: 'Token has expired' },
                { status: 401 }
            )
        }

        // Fetch user data separately
        const userData = await User.findById(deviceToken.userId).select('_id email name image')
        
        if (!userData) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
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

        return NextResponse.json({
            accessToken,
            user: {
                id: userData._id.toString(),
                name: userData.name,
                email: userData.email,
                image: userData.image || null,
            },
        })
    } catch (error) {
        console.error('Device verify error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
