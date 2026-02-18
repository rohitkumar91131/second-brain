import connectDB from '@/lib/mongodb'
import Project from '@/lib/models/Project'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { ProjectSchema, validateBody } from '@/lib/validators/schemas'

export const GET = withErrorHandler(async () => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const projects = await Project.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean()
    return ok(projects.map(p => ({ ...p, id: p._id.toString(), _id: undefined })))
})

export const POST = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(ProjectSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()
    const project = await Project.create({ ...validation.data, userId: session.user.id })
    return ok({ ...project.toObject(), id: project._id.toString(), _id: undefined }, 201)
})
