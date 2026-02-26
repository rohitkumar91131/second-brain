import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Block from '@/lib/models/Block'
import Note from '@/lib/models/Note'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { BlockSchema, validateBody } from '@/lib/validators/schemas'
import { updateEntityPreview } from '@/lib/api/blocks'

export const POST = withErrorHandler(async (request) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(BlockSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()

    const { entityId, entityType } = validation.data
    const userId = new mongoose.Types.ObjectId(session.user.id)
    const castedEntityId = new mongoose.Types.ObjectId(entityId)

    if (!mongoose.Types.ObjectId.isValid(entityId)) {
        return err(`Invalid ${entityType} ID format`, 400)
    }

    if (entityType === 'Note') {
        const note = await Note.findOne({ _id: castedEntityId, userId }).lean()
        if (!note) return err('Note not found for block creation', 404)
    } else if (entityType === 'JournalEntry') {
        const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry')
        const entry = await JournalEntry.findOne({ _id: castedEntityId, userId }).lean()
        if (!entry) return err('Journal entry not found for block creation', 404)
    }

    const { parentId, ...rest } = validation.data
    const blockData = {
        ...rest,
        entityId: castedEntityId,
        parentId: mongoose.Types.ObjectId.isValid(parentId) ? new mongoose.Types.ObjectId(parentId) : null
    }

    const block = await Block.create(blockData)

    // Update parent preview
    await updateEntityPreview(entityId.toString(), entityType)

    return ok({ ...block.toObject(), id: block._id.toString(), _id: undefined })
})
