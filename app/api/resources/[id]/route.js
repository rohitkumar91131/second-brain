import connectDB from '@/lib/mongodb'
import Resource from '@/lib/models/Resource'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { ResourceUpdateSchema, validateBody } from '@/lib/validators/schemas'

export const GET = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const resource = await Resource.findOne({ _id: params.id, userId: session.user.id }).lean()
    if (!resource) return err('Resource not found', 404)
    return ok({ ...resource, id: resource._id.toString(), _id: undefined })
})

export const PUT = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(ResourceUpdateSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()
    const resource = await Resource.findOneAndUpdate(
        { _id: params.id, userId: session.user.id },
        { $set: validation.data },
        { new: true, runValidators: true }
    ).lean()

    if (!resource) return err('Resource not found', 404)
    return ok({ ...resource, id: resource._id.toString(), _id: undefined })
})

export const DELETE = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const resource = await Resource.findOneAndDelete({ _id: params.id, userId: session.user.id })
    if (!resource) return err('Resource not found', 404)
    return ok({ message: 'Resource deleted' })
})
