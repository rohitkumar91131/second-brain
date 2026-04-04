import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { RegisterSchema, validateBody } from '@/lib/validators/schemas'
import { sendVerificationEmail } from '@/lib/mail'

export async function POST(request) {
    try {
        const body = await request.json()

        // Validate input
        const validation = validateBody(RegisterSchema, body)
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.errors },
                { status: 422 }
            )
        }

        const { name, email, password } = validation.data

        await connectDB()

        // Check if user already exists
        const existing = await User.findOne({ email: email.toLowerCase() })
        if (existing) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            provider: 'credentials',
            verificationToken,
            verificationTokenExpires,
        })

        // Send verification email
        try {
            await sendVerificationEmail(user.email, user.name, verificationToken)
        } catch (mailError) {
            console.error('Failed to send verification email:', mailError)
            // We still created the user, they can try resending later or we can handle this error
        }

        return NextResponse.json(
            {
                message: 'Account created! Please check your email to verify your account.',
                user: { id: user._id.toString(), name: user.name, email: user.email },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Register error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
