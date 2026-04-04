import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import DeviceVerification from '@/lib/models/DeviceVerification'
import Device from '@/lib/models/Device'
import User from '@/lib/models/User'
import { sign } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { ok, err, withErrorHandler } from '@/lib/apiHelpers'

const InitiateVerificationSchema = z.object({
    deviceName: z.string().min(1).max(100),
    platform: z.enum(['android', 'ios', 'unknown']).default('unknown'),
    deviceId: z.string().min(1).max(200),
    fcmToken: z.string().optional().nullable(),
})

// POST /api/device/verify/initiate — create a verification request
export const POST = withErrorHandler(async (request) => {
    const body = await request.json()
    const parsed = InitiateVerificationSchema.safeParse(body)
    if (!parsed.success) return err('Validation failed', 422, parsed.error.flatten())

    await connectDB()

    const requestId = uuidv4()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    const verification = await DeviceVerification.create({
        requestId,
        deviceName: parsed.data.deviceName,
        platform: parsed.data.platform,
        deviceId: parsed.data.deviceId,
        fcmToken: parsed.data.fcmToken || null,
        expiresAt,
    })

    return ok(
        {
            requestId,
            verificationUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/device/adddevice?requestId=${requestId}`,
            expiresIn: 300, // 5 minutes in seconds
        },
        201
    )
})
