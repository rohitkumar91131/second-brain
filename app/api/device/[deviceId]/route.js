import connectDB from '@/lib/mongodb'
import Device from '@/lib/models/Device'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'

// GET /api/device/[deviceId]
export const GET = withErrorHandler(async (_req, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const device = await Device.findOne({ _id: params.deviceId, userId: session.user.id }).lean()
    if (!device) return err('Device not found', 404)

    return ok({ ...device, id: device._id.toString(), _id: undefined })
})

// PATCH /api/device/[deviceId]
export const PATCH = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()

    await connectDB()
    const device = await Device.findOneAndUpdate(
        { _id: params.deviceId, userId: session.user.id },
        { $set: { ...body, lastSeen: new Date() } },
        { new: true, runValidators: true }
    ).lean()

    if (!device) return err('Device not found', 404)
    return ok({ ...device, id: device._id.toString(), _id: undefined })
})

// DELETE /api/device/[deviceId] — soft-delete (deactivate)
export const DELETE = withErrorHandler(async (_req, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const device = await Device.findOneAndUpdate(
        { _id: params.deviceId, userId: session.user.id },
        { $set: { isActive: false } },
        { new: true }
    ).lean()

    if (!device) return err('Device not found', 404)
    return ok({ success: true })
})
