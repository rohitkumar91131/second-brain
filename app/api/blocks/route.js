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

    if (entityType === 'Note') {
        const note = await Note.findOne({ _id: entityId, userId: session.user.id })
        if (!note) return err('Note not found', 404)
    } else if (entityType === 'JournalEntry') {
        const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry')
        const entry = await JournalEntry.findOne({ _id: entityId, userId: session.user.id })
        if (!entry) return err('Journal entry not found', 404)
    }

    const block = await Block.create(validation.data)

    // Update parent preview
    await updateEntityPreview(entityId, entityType)

    return ok({ ...block.toObject(), id: block._id.toString(), _id: undefined })
})
