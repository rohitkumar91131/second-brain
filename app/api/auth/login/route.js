import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { LoginSchema, validateBody } from '@/lib/validators/schemas'

export async function POST(request) {
    try {
        const body = await request.json()

        // Validate input
        const validation = validateBody(LoginSchema, body)
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.errors },
                { status: 422 }
            )
        }

        const { email, password } = validation.data

        await connectDB()

        // Find user with password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
        if (!user) {
            return NextResponse.json(
                { error: 'No account found with this email' },
                { status: 401 }
            )
        }

        if (!user.password) {
            return NextResponse.json(
                { error: 'This account uses social login. Please sign in with Google, Facebook, or GitHub.' },
                { status: 401 }
            )
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return NextResponse.json(
                { error: 'Incorrect password' },
                { status: 401 }
            )
        }

        // Generate JWT Token (compatible with NextAuth secret)
        const token = jwt.sign(
            { id: user._id.toString(), email: user.email, name: user.name },
            process.env.NEXTAUTH_SECRET,
            { expiresIn: '30d' }
        )

        return NextResponse.json(
            {
                message: 'Login successful',
                token,
                user: { id: user._id.toString(), name: user.name, email: user.email },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
