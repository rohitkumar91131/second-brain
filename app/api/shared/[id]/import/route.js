import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import SharedNote from '@/lib/models/SharedNote'
import Note from '@/lib/models/Note'
import Block from '@/lib/models/Block'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'

export const POST = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    const sharedId = params.id
    const userId = session.user.id

    if (!mongoose.Types.ObjectId.isValid(sharedId)) {
        return err('Invalid shared ID', 400)
    }

    const sharedNote = await SharedNote.findById(sharedId).lean()
    if (!sharedNote) {
        return err('Shared note not found', 404)
    }

    // Create a new note for the current user
    const newNote = await Note.create({
        userId,
        title: `${sharedNote.title}`,
        preview: sharedNote.blocks[0]?.content?.substring(0, 100) || ''
    })

    // Create blocks for the new note
    const blockOperations = sharedNote.blocks.map(b => ({
        insertOne: {
            document: {
                entityId: newNote._id,
                entityType: 'Note',
                type: b.type,
                content: b.content,
                order: b.order
            }
        }
    }))

    if (blockOperations.length > 0) {
        await Block.bulkWrite(blockOperations)
    }

    return ok({ id: newNote._id })
})
