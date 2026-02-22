import connectDB from '@/lib/mongodb'
import Task from '@/lib/models/Task'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { TaskUpdateSchema, validateBody } from '@/lib/validators/schemas'
import { format } from 'date-fns'

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

    // If client wants to toggle a specific date in history, handle that atomically
    if (validation.data.toggleDate) {
        const date = validation.data.toggleDate
        const taskDoc = await Task.findOne({ _id: params.id, userId: session.user.id })
        if (!taskDoc) return err('Task not found', 404)

        const has = Array.isArray(taskDoc.history) && taskDoc.history.includes(date)
        if (has) {
            taskDoc.history = taskDoc.history.filter(d => d !== date)
        } else {
            taskDoc.history = [...(taskDoc.history || []), date]
        }

        // Keep `completed` in sync for today's date
        const today = format(new Date(), 'yyyy-MM-dd')
        taskDoc.completed = (taskDoc.history || []).includes(today)

        await taskDoc.save()
        const t = taskDoc.toObject()
        return ok({ ...t, id: t._id.toString(), _id: undefined })
    }

    // Regular partial update
    const updates = { ...validation.data }
    delete updates.toggleDate

    // If client toggled `completed` directly, update history for today's date too
    if (Object.prototype.hasOwnProperty.call(updates, 'completed')) {
        const today = format(new Date(), 'yyyy-MM-dd')
        let taskDoc = null
        if (updates.completed) {
            taskDoc = await Task.findOneAndUpdate(
                { _id: params.id, userId: session.user.id },
                { $addToSet: { history: today }, $set: updates },
                { returnDocument: 'after', runValidators: true }
            ).lean()
        } else {
            taskDoc = await Task.findOneAndUpdate(
                { _id: params.id, userId: session.user.id },
                { $pull: { history: today }, $set: updates },
                { returnDocument: 'after', runValidators: true }
            ).lean()
        }

        if (!taskDoc) return err('Task not found', 404)
        return ok({ ...taskDoc, id: taskDoc._id.toString(), _id: undefined })
    }

    const task = await Task.findOneAndUpdate(
        { _id: params.id, userId: session.user.id },
        { $set: updates },
        { returnDocument: 'after', runValidators: true }
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
