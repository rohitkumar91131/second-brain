import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import twilio from 'twilio'

export const POST = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const { phoneNumber } = await request.json()
    if (!phoneNumber) return err('Phone number is required', 400)

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await connectDB()
    const user = await User.findByIdAndUpdate(
        session.user.id,
        {
            $set: {
                otp,
                otpExpires,
                phoneNumber,
                phoneNumberVerified: false
            }
        },
        { new: true }
    )

    if (!user) return err('User not found', 404)

    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
        // Fallback — no Twilio keys configured
        console.log(`\n=========================================`)
        console.log(`[FALLBACK] OTP for ${phoneNumber}: ${otp}`)
        console.log(`Expires: ${otpExpires.toLocaleString()}`)
        console.log(`=========================================\n`)
        return ok({ message: 'OTP generated (no SMS keys — check terminal)' })
    }

    // Send real SMS via Twilio
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    const message = await client.messages.create({
        body: `Your Second Brain OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,
        from: TWILIO_FROM_NUMBER,
        to: phoneNumber,
    })

    console.log(`[TWILIO] SMS sent to ${phoneNumber} | SID: ${message.sid}`)

    return ok({ message: 'OTP sent via SMS successfully' })
})
