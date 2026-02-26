import connectDB from '@/lib/mongodb'
import Block from '@/lib/models/Block'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { BlockBulkUpdateSchema, validateBody } from '@/lib/validators/schemas'
import mongoose from 'mongoose'

export const GET = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    // Verify journal entry ownership
    const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry')
    const entry = await JournalEntry.findOne({ _id: params.id, userId: session.user.id })
    if (!entry) return err('Journal entry not found', 404)

    const blocks = await Block.find({ entityId: params.id, entityType: 'JournalEntry' }).sort({ order: 1 }).lean()

    return ok(blocks.map(b => ({ ...b, id: b._id.toString(), _id: undefined })))
})

export const PATCH = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(BlockBulkUpdateSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()

    // Verify journal entry ownership
    const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry')
    const entry = await JournalEntry.findOne({ _id: params.id, userId: session.user.id })
    if (!entry) return err('Journal entry not found', 404)

    const operations = validation.data.map(item => ({
        updateOne: {
            filter: { _id: item.id, entityId: params.id, entityType: 'JournalEntry' },
            update: { $set: { ...item, id: undefined, entityId: undefined, entityType: undefined } }
        }
    }))

    if (operations.length > 0) {
        await Block.bulkWrite(operations)
    }

    // Update parent preview
    await updateEntityPreview(params.id, 'JournalEntry')

    const blocks = await Block.find({ entityId: params.id, entityType: 'JournalEntry' }).sort({ order: 1 }).lean()
    return ok(blocks.map(b => ({ ...b, id: b._id.toString(), _id: undefined })))
})
