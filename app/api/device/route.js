import connectDB from '@/lib/mongodb'
import Device from '@/lib/models/Device'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { z } from 'zod'

const RegisterDeviceSchema = z.object({
    name: z.string().min(1).max(100),
    platform: z.enum(['android', 'ios', 'unknown']).default('unknown'),
    deviceId: z.string().min(1).max(200),
    fcmToken: z.string().optional().nullable(),
})

// GET /api/device — list all devices for current user
export const GET = withErrorHandler(async () => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const devices = await Device.find({ userId: session.user.id, isActive: true })
        .sort({ lastSeen: -1 })
        .lean()

    return ok(devices.map(d => ({ ...d, id: d._id.toString(), _id: undefined })))
})

// POST /api/device — register a new device
export const POST = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const parsed = RegisterDeviceSchema.safeParse(body)
    if (!parsed.success) return err('Validation failed', 422, parsed.error.flatten())

    await connectDB()

    // Upsert by deviceId — if device already registered update it
    const device = await Device.findOneAndUpdate(
        { deviceId: parsed.data.deviceId },
        {
            userId: session.user.id,
            name: parsed.data.name,
            platform: parsed.data.platform,
            fcmToken: parsed.data.fcmToken ?? null,
            lastSeen: new Date(),
            isActive: true,
        },
        { upsert: true, new: true, runValidators: true }
    )

    return ok({ ...device.toObject(), id: device._id.toString(), _id: undefined }, 201)
})
