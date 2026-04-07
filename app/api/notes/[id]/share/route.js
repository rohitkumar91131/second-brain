import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Note from '@/lib/models/Note'
import Block from '@/lib/models/Block'
import SharedNote from '@/lib/models/SharedNote'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'

export const POST = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    const noteId = params.id
    const userId = session.user.id

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
        return err('Invalid note ID', 400)
    }

    const note = await Note.findOne({ _id: noteId, userId }).lean()
    if (!note) {
        return err('Note not found', 404)
    }

    const blocks = await Block.find({ entityId: noteId, entityType: 'Note' }).sort({ order: 1 }).lean()

    const sharedNote = await SharedNote.create({
        title: note.title,
        blocks: blocks.map(b => ({
            type: b.type,
            content: b.content,
            order: b.order
        })),
        originalNoteId: noteId,
        userId: userId
    })

    return ok({ id: sharedNote._id })
})
