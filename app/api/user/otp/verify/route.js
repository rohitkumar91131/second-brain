import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { VerifyOtpSchema, validateBody } from '@/lib/validators/schemas'

export const POST = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(VerifyOtpSchema, body)
    if (!validation.success) return err('Invalid OTP format', 422, validation.errors)

    const { otp } = validation.data

    await connectDB()
    const user = await User.findById(session.user.id)

    if (!user) return err('User not found', 404)
    if (!user.otp || !user.otpExpires) return err('No OTP sent for this user', 400)

    if (new Date() > user.otpExpires) {
        return err('OTP has expired', 400)
    }

    if (user.otp !== otp) {
        return err('Invalid OTP', 400)
    }

    // OTP matches and is not expired
    user.phoneNumberVerified = true
    user.otp = undefined
    user.otpExpires = undefined
    await user.save()

    return ok({ message: 'Phone number verified successfully' })
})
