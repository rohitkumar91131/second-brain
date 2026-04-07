import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import JournalEntry from '@/lib/models/JournalEntry'
import Block from '@/lib/models/Block'
import SharedNote from '@/lib/models/SharedNote'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'

export const POST = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    const entryId = params.id
    const userId = session.user.id

    if (!mongoose.Types.ObjectId.isValid(entryId)) {
        return err('Invalid journal ID', 400)
    }

    const entry = await JournalEntry.findOne({ _id: entryId, userId }).lean()
    if (!entry) {
        return err('Journal entry not found', 404)
    }

    const blocks = await Block.find({ entityId: entryId, entityType: 'JournalEntry' }).sort({ order: 1 }).lean()

    const sharedNote = await SharedNote.create({
        title: entry.title,
        blocks: blocks.map(b => ({
            type: b.type,
            content: b.content,
            order: b.order
        })),
        originalNoteId: entryId,
        userId: userId
    })

    return ok({ id: sharedNote._id })
})
