import connectDB from '@/lib/mongodb'
import JournalEntry from '@/lib/models/JournalEntry'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { JournalEntrySchema, validateBody } from '@/lib/validators/schemas'

export const GET = withErrorHandler(async () => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const entries = await JournalEntry.find({ userId: session.user.id }).sort({ date: -1 }).lean()
    return ok(entries.map(e => ({ ...e, id: e._id.toString(), _id: undefined })))
})

export const POST = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(JournalEntrySchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()
    const entry = await JournalEntry.create({ ...validation.data, userId: session.user.id })
    return ok({ ...entry.toObject(), id: entry._id.toString(), _id: undefined }, 201)
})
