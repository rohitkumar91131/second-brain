import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import DeviceToken from '@/lib/models/DeviceToken'
import mongoose from 'mongoose'
import crypto from 'crypto'

const TOKEN_TTL_MS = 5 * 60 * 1000

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        await connectDB()

        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)
        
        let userId
        try {
            userId = new mongoose.Types.ObjectId(session.user.id)
        } catch (e) {
            console.error('Invalid userId:', session.user.id)
            userId = session.user.id
        }

        const deviceToken = new DeviceToken({
            token,
            userId,
            userName: session.user.name,
            userEmail: session.user.email,
            expiresAt,
        })

        await deviceToken.save()

        return NextResponse.json({
            token,
            expiresAt: expiresAt.getTime(),
        })
    } catch (error) {
        console.error('Device connect error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
