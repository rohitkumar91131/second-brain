import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { ProfileUpdateSchema, validateBody } from '@/lib/validators/schemas'

// GET /api/user/profile
export const GET = withErrorHandler(async () => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const user = await User.findById(session.user.id).lean()
    if (!user) return err('User not found', 404)

    return ok({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        provider: user.provider,
        viewPreferences: user.viewPreferences || {},
        createdAt: user.createdAt,
    })
})

// PUT /api/user/profile
export const PUT = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(ProfileUpdateSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    console.log('UPDATING PROFILE for user:', session.user.id)
    console.log('UPDATE DATA:', JSON.stringify(validation.data, null, 2))

    await connectDB()
    const user = await User.findByIdAndUpdate(
        session.user.id,
        { $set: validation.data },
        { new: true, runValidators: true }
    ).lean()

    if (!user) return err('User not found', 404)
    return ok({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        viewPreferences: user.viewPreferences || {}
    })
})
