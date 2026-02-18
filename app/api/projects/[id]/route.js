import connectDB from '@/lib/mongodb'
import Project from '@/lib/models/Project'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { ProjectUpdateSchema, validateBody } from '@/lib/validators/schemas'

export const GET = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const project = await Project.findOne({ _id: params.id, userId: session.user.id }).lean()
    if (!project) return err('Project not found', 404)
    return ok({ ...project, id: project._id.toString(), _id: undefined })
})

export const PUT = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(ProjectUpdateSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()
    const project = await Project.findOneAndUpdate(
        { _id: params.id, userId: session.user.id },
        { $set: validation.data },
        { new: true, runValidators: true }
    ).lean()

    if (!project) return err('Project not found', 404)
    return ok({ ...project, id: project._id.toString(), _id: undefined })
})

export const DELETE = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const project = await Project.findOneAndDelete({ _id: params.id, userId: session.user.id })
    if (!project) return err('Project not found', 404)
    return ok({ message: 'Project deleted' })
})
