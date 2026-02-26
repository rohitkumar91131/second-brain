import connectDB from '@/lib/mongodb'
import Note from '@/lib/models/Note'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { NoteSchema, validateBody } from '@/lib/validators/schemas'

export const GET = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const archived = searchParams.get('archived') === 'true'
    const deleted = searchParams.get('deleted') === 'true'

    await connectDB()
    const query = { userId: session.user.id }

    if (deleted) {
        query.deletedAt = { $ne: null }
    } else if (archived) {
        query.isArchived = true
        query.deletedAt = null
    } else {
        query.isArchived = false
        query.deletedAt = null
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 }).lean()
    return ok(notes.map(n => ({ ...n, id: n._id.toString(), _id: undefined })))
})

export const POST = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(NoteSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()
    const note = await Note.create({ ...validation.data, userId: session.user.id })
    return ok({ ...note.toObject(), id: note._id.toString(), _id: undefined }, 201)
})
