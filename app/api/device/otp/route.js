import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import DeviceOtp from '@/lib/models/DeviceOtp'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connectDB()

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + OTP_TTL_MS)

        const otpRecord = new DeviceOtp({
            otp,
            userId: session.user.id,
            userEmail: session.user.email,
            expiresAt,
        })

        await otpRecord.save()

        return NextResponse.json({
            otp,
            expiresAt: expiresAt.getTime(),
        })
    } catch (error) {
        console.error('Device OTP generate error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
