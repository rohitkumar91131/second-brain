import connectDB from '@/lib/mongodb'
import Task from '@/lib/models/Task'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { TaskSchema, validateBody } from '@/lib/validators/schemas'

// GET /api/tasks — list all tasks for current user
export const GET = withErrorHandler(async () => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const tasks = await Task.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean()

    return ok(tasks.map(t => ({ ...t, id: t._id.toString(), _id: undefined })))
})

// POST /api/tasks — create a new task
export const POST = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(TaskSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()
    const task = await Task.create({ ...validation.data, userId: session.user.id })

    return ok({ ...task.toObject(), id: task._id.toString(), _id: undefined }, 201)
})
