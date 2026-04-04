import connectDB from '@/lib/mongodb'
import Resource from '@/lib/models/Resource'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { ResourceSchema, validateBody } from '@/lib/validators/schemas'

export const GET = withErrorHandler(async () => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const resources = await Resource.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean()
    return ok(resources.map(r => ({ ...r, id: r._id.toString(), _id: undefined })))
})

export const POST = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(ResourceSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()
    const resource = await Resource.create({ ...validation.data, userId: session.user.id })
    return ok({ ...resource.toObject(), id: resource._id.toString(), _id: undefined }, 201)
})
