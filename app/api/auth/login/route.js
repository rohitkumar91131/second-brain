import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        return NextResponse.json(
            { error: 'Email and password login is deprecated. Please use QR code to connect from the mobile app.' },
            { status: 403 }
        )
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
