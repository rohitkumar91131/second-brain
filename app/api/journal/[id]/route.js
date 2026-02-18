import connectDB from '@/lib/mongodb'
import JournalEntry from '@/lib/models/JournalEntry'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { JournalEntryUpdateSchema, validateBody } from '@/lib/validators/schemas'

export const GET = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const entry = await JournalEntry.findOne({ _id: params.id, userId: session.user.id }).lean()
    if (!entry) return err('Journal entry not found', 404)
    return ok({ ...entry, id: entry._id.toString(), _id: undefined })
})

export const PUT = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(JournalEntryUpdateSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()
    const entry = await JournalEntry.findOneAndUpdate(
        { _id: params.id, userId: session.user.id },
        { $set: validation.data },
        { new: true, runValidators: true }
    ).lean()

    if (!entry) return err('Journal entry not found', 404)
    return ok({ ...entry, id: entry._id.toString(), _id: undefined })
})

export const DELETE = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const entry = await JournalEntry.findOneAndDelete({ _id: params.id, userId: session.user.id })
    if (!entry) return err('Journal entry not found', 404)
    return ok({ message: 'Journal entry deleted' })
})
