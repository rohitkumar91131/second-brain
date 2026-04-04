import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import DeviceVerification from '@/lib/models/DeviceVerification'
import { ok, err, withErrorHandler } from '@/lib/apiHelpers'

// GET /api/device/verify/[requestId] — check verification status
export const GET = withErrorHandler(async (request, { params }) => {
    const { requestId } = params

    if (!requestId) return err('Request ID required', 400)

    await connectDB()

    const verification = await DeviceVerification.findOne({ requestId }).select(
        'status expiresAt approvedAt userId'
    )

    if (!verification) {
        return err('Verification request not found', 404)
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
        await DeviceVerification.updateOne({ requestId }, { status: 'expired' })
        return ok({ status: 'expired' })
    }

    // If approved, generate and return token
    if (verification.status === 'approved' && verification.userId) {
        return ok({
            status: 'approved',
            userId: verification.userId.toString(),
        })
    }

    return ok({
        status: verification.status,
    })
})
