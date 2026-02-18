import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Invalid verification link`)
        }

        await connectDB()

        // Find user with this token and ensure it hasn't expired
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() },
        })

        if (!user) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Invalid or expired verification link`)
        }

        // Verify user and clear token
        user.emailVerified = new Date()
        user.verificationToken = undefined
        user.verificationTokenExpires = undefined
        await user.save()

        // Redirect to login with success message
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?message=Email verified successfully! You can now sign in.`)
    } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Something went wrong during verification`)
    }
}
