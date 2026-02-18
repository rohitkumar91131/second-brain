import connectDB from '@/lib/mongodb'
import Task from '@/lib/models/Task'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { TaskUpdateSchema, validateBody } from '@/lib/validators/schemas'

// GET /api/tasks/[id]
export const GET = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const task = await Task.findOne({ _id: params.id, userId: session.user.id }).lean()
    if (!task) return err('Task not found', 404)

    return ok({ ...task, id: task._id.toString(), _id: undefined })
})

// PUT /api/tasks/[id]
export const PUT = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(TaskUpdateSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()
    const task = await Task.findOneAndUpdate(
        { _id: params.id, userId: session.user.id },
        { $set: validation.data },
        { new: true, runValidators: true }
    ).lean()

    if (!task) return err('Task not found', 404)
    return ok({ ...task, id: task._id.toString(), _id: undefined })
})

// DELETE /api/tasks/[id]
export const DELETE = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const task = await Task.findOneAndDelete({ _id: params.id, userId: session.user.id })
    if (!task) return err('Task not found', 404)

    return ok({ message: 'Task deleted' })
})
