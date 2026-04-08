import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import DeviceOtp from '@/lib/models/DeviceOtp'
import crypto from 'crypto'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

export async function POST(request) {
    try {
        console.log('[OTP GENERATE] Request received')
        const session = await getServerSession(authOptions)
        console.log('[OTP GENERATE] Session user:', session?.user?.email)

        if (!session?.user?.id) {
            console.log('[OTP GENERATE] Unauthorized - no session')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('[OTP GENERATE] Connecting to database...')
        await connectDB()
        console.log('[OTP GENERATE] Database connected')

        // Verify user exists in backend
        const User = (await import('@/lib/models/User')).default
        console.log('[OTP GENERATE] Looking up user by ID:', session.user.id)
        let user = await User.findById(session.user.id).select('_id email name')
        
        // Fallback: Try finding by email if ID lookup fails
        if (!user) {
            console.log('[OTP GENERATE] User not found by ID, trying email fallback:', session.user.email)
            user = await User.findOne({ email: session.user.email }).select('_id email name')
        }
        
        if (!user) {
            console.error('[OTP GENERATE] User not found in MongoDB')
            console.error('[OTP GENERATE] Session ID:', session.user.id)
            console.error('[OTP GENERATE] Session email:', session.user.email)
            console.error('[OTP GENERATE] [ACTION] User must be created in MongoDB first')
            console.error('[OTP GENERATE] [ACTION] Try logging in again or registering via social login')
            return NextResponse.json({ 
                error: 'User not found in database - please register first and try again' 
            }, { status: 404 })
        }
        console.log('[OTP GENERATE] User verified:', user._id, user.email)

        // Generate cryptographically secure 6-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString()
        const expiresAt = new Date(Date.now() + OTP_TTL_MS)

        console.log('[OTP GENERATE] Creating OTP record...')
        const otpRecord = new DeviceOtp({
            otp,
            userId: user._id,
            userEmail: user.email,
            expiresAt,
        })

        await otpRecord.save()
        console.log('[OTP GENERATE] OTP created:', otp, 'expires at:', expiresAt, 'User ID:', user._id)

        return NextResponse.json({
            otp,
            expiresAt: expiresAt.getTime(),
        })
    } catch (error) {
        console.error('[OTP GENERATE] Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
