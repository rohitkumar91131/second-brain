import connectDB from '@/lib/mongodb'
import Note from '@/lib/models/Note'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { NoteSchema, validateBody } from '@/lib/validators/schemas'

export const GET = withErrorHandler(async () => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const notes = await Note.find({ userId: session.user.id }).sort({ updatedAt: -1 }).lean()
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
