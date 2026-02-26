import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Block from '@/lib/models/Block'
import Note from '@/lib/models/Note'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { BlockUpdateSchema, validateBody } from '@/lib/validators/schemas'
import { updateEntityPreview } from '@/lib/api/blocks'

export const PATCH = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    // Early exit if ID is not a valid MongoDB ObjectId (e.g. temporary ID)
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return err('Invalid block ID', 404)
    }

    const body = await request.json()
    const validation = validateBody(BlockUpdateSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()

    const blockId = new mongoose.Types.ObjectId(params.id)
    const block = await Block.findById(blockId).lean()
    if (!block) return err('Block not found for single update', 404)

    const { entityId, entityType } = block
    const userId = new mongoose.Types.ObjectId(session.user.id)
    const castedEntityId = new mongoose.Types.ObjectId(entityId)

    if (entityType === 'Note') {
        const note = await Note.findOne({ _id: castedEntityId, userId }).lean()
        if (!note) return err('Unauthorized Note block update', 403)
    } else if (entityType === 'JournalEntry') {
        const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry')
        const entry = await JournalEntry.findOne({ _id: castedEntityId, userId }).lean()
        if (!entry) return err('Unauthorized Journal entry block update', 403)
    }

    const updatedBlock = await Block.findByIdAndUpdate(
        blockId,
        { $set: validation.data },
        { returnDocument: 'after', runValidators: true }
    ).lean()

    // Update parent preview
    await updateEntityPreview(entityId.toString(), entityType)

    return ok({ ...updatedBlock, id: updatedBlock._id.toString(), _id: undefined })
})

export const DELETE = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    // Early exit if ID is not a valid MongoDB ObjectId (e.g. temporary ID)
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return err('Invalid block ID', 404)
    }

    await connectDB()

    const blockId = new mongoose.Types.ObjectId(params.id)
    const block = await Block.findById(blockId).lean()
    if (!block) return err('Block not found for single deletion', 404)

    const { entityId, entityType } = block
    const userId = new mongoose.Types.ObjectId(session.user.id)
    const castedEntityId = new mongoose.Types.ObjectId(entityId)

    if (entityType === 'Note') {
        const note = await Note.findOne({ _id: castedEntityId, userId }).lean()
        if (!note) return err('Unauthorized Note block deletion', 403)
    } else if (entityType === 'JournalEntry') {
        const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry')
        const entry = await JournalEntry.findOne({ _id: castedEntityId, userId }).lean()
        if (!entry) return err('Unauthorized Journal entry block deletion', 403)
    }

    await Block.findByIdAndDelete(blockId)

    // Update parent preview
    await updateEntityPreview(entityId.toString(), entityType)

    return ok({ message: 'Block deleted' })
})
