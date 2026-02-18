import connectDB from '@/lib/mongodb'
import Goal from '@/lib/models/Goal'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { GoalUpdateSchema, validateBody } from '@/lib/validators/schemas'

export const GET = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const goal = await Goal.findOne({ _id: params.id, userId: session.user.id }).lean()
    if (!goal) return err('Goal not found', 404)
    return ok({ ...goal, id: goal._id.toString(), _id: undefined })
})

export const PUT = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(GoalUpdateSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()
    const goal = await Goal.findOneAndUpdate(
        { _id: params.id, userId: session.user.id },
        { $set: validation.data },
        { new: true, runValidators: true }
    ).lean()

    if (!goal) return err('Goal not found', 404)
    return ok({ ...goal, id: goal._id.toString(), _id: undefined })
})

export const DELETE = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const goal = await Goal.findOneAndDelete({ _id: params.id, userId: session.user.id })
    if (!goal) return err('Goal not found', 404)
    return ok({ message: 'Goal deleted' })
})
