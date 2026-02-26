import connectDB from '@/lib/mongodb'
import Block from '@/lib/models/Block'
import Note from '@/lib/models/Note'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { BlockBulkUpdateSchema, validateBody } from '@/lib/validators/schemas'
import { updateEntityPreview } from '@/lib/api/blocks'

export const GET = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    // Verify note ownership
    const note = await Note.findOne({ _id: params.id, userId: session.user.id })
    if (!note) return err('Note not found', 404)

    const blocks = await Block.find({ entityId: params.id, entityType: 'Note' }).sort({ order: 1 }).lean()

    return ok(blocks.map(b => ({ ...b, id: b._id.toString(), _id: undefined })))
})

export const PATCH = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(BlockBulkUpdateSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()

    // Verify note ownership
    const note = await Note.findOne({ _id: params.id, userId: session.user.id })
    if (!note) return err('Note not found', 404)

    const operations = validation.data.map(item => ({
        updateOne: {
            filter: { _id: item.id, entityId: params.id, entityType: 'Note' },
            update: { $set: { ...item, id: undefined, entityId: undefined, entityType: undefined } }
        }
    }))

    if (operations.length > 0) {
        await Block.bulkWrite(operations)
    }

    // Update parent preview
    await updateEntityPreview(params.id, 'Note')

    const blocks = await Block.find({ entityId: params.id, entityType: 'Note' }).sort({ order: 1 }).lean()
    return ok(blocks.map(b => ({ ...b, id: b._id.toString(), _id: undefined })))
})
