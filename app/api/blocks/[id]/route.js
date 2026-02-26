import connectDB from '@/lib/mongodb'
import Block from '@/lib/models/Block'
import Note from '@/lib/models/Note'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { BlockUpdateSchema, validateBody } from '@/lib/validators/schemas'
import { updateEntityPreview } from '@/lib/api/blocks'

export const PATCH = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(BlockUpdateSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()

    const block = await Block.findById(params.id)
    if (!block) return err('Block not found', 404)

    const { entityId, entityType } = block

    if (entityType === 'Note') {
        const note = await Note.findOne({ _id: entityId, userId: session.user.id })
        if (!note) return err('Unauthorized', 403)
    } else if (entityType === 'JournalEntry') {
        const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry')
        const entry = await JournalEntry.findOne({ _id: entityId, userId: session.user.id })
        if (!entry) return err('Unauthorized', 403)
    }

    const updatedBlock = await Block.findByIdAndUpdate(
        params.id,
        { $set: validation.data },
        { returnDocument: 'after', runValidators: true }
    ).lean()

    // Update parent preview
    await updateEntityPreview(entityId, entityType)

    return ok({ ...updatedBlock, id: updatedBlock._id.toString(), _id: undefined })
})

export const DELETE = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    const block = await Block.findById(params.id)
    if (!block) return err('Block not found', 404)

    const { entityId, entityType } = block

    if (entityType === 'Note') {
        const note = await Note.findOne({ _id: entityId, userId: session.user.id })
        if (!note) return err('Unauthorized', 403)
    } else if (entityType === 'JournalEntry') {
        const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry')
        const entry = await JournalEntry.findOne({ _id: entityId, userId: session.user.id })
        if (!entry) return err('Unauthorized', 403)
    }

    await Block.findByIdAndDelete(params.id)

    // Update parent preview
    await updateEntityPreview(entityId, entityType)

    return ok({ message: 'Block deleted' })
})
