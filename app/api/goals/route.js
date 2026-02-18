import connectDB from '@/lib/mongodb'
import Goal from '@/lib/models/Goal'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { GoalSchema, validateBody } from '@/lib/validators/schemas'

export const GET = withErrorHandler(async () => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const goals = await Goal.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean()
    return ok(goals.map(g => ({ ...g, id: g._id.toString(), _id: undefined })))
})

export const POST = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(GoalSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()
    const goal = await Goal.create({ ...validation.data, userId: session.user.id })
    return ok({ ...goal.toObject(), id: goal._id.toString(), _id: undefined }, 201)
})
