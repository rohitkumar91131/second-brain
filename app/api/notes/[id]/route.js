import connectDB from '@/lib/mongodb'
import Note from '@/lib/models/Note'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { NoteUpdateSchema, validateBody } from '@/lib/validators/schemas'

export const GET = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const note = await Note.findOne({ _id: params.id, userId: session.user.id }).lean()
    if (!note) return err('Note not found', 404)
    return ok({ ...note, id: note._id.toString(), _id: undefined })
})

export const PUT = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(NoteUpdateSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()
    const note = await Note.findOneAndUpdate(
        { _id: params.id, userId: session.user.id },
        { $set: validation.data },
        { new: true, runValidators: true }
    ).lean()

    if (!note) return err('Note not found', 404)
    return ok({ ...note, id: note._id.toString(), _id: undefined })
})

export const DELETE = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const note = await Note.findOneAndDelete({ _id: params.id, userId: session.user.id })
    if (!note) return err('Note not found', 404)
    return ok({ message: 'Note deleted' })
})
