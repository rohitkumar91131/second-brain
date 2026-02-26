import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Block from '@/lib/models/Block'
import { requireAuth, ok, err, withErrorHandler } from '@/lib/apiHelpers'
import { BlockBulkUpdateSchema, validateBody } from '@/lib/validators/schemas'
import { updateEntityPreview } from '@/lib/api/blocks'

export const GET = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return err('Invalid journal entry ID format', 400)
    }

    // Verify journal entry ownership with explicit casting
    const entryId = new mongoose.Types.ObjectId(params.id)
    const userId = new mongoose.Types.ObjectId(session.user.id)

    const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry')
    const entry = await JournalEntry.findOne({ _id: entryId, userId }).lean()
    if (!entry) return err('Journal entry not found or access denied for retrieval', 404)

    const blocks = await Block.find({ entityId: entryId, entityType: 'JournalEntry' }).sort({ order: 1 }).lean()

    return ok(blocks.map(b => ({ ...b, id: b._id.toString(), _id: undefined })))
})

export const PATCH = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const validation = validateBody(BlockBulkUpdateSchema, body)
    if (!validation.success) return err('Validation failed', 422, validation.errors)

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return err('Invalid journal entry ID format', 400)
    }

    // Verify journal entry ownership with explicit casting
    const entryId = new mongoose.Types.ObjectId(params.id)
    const userId = new mongoose.Types.ObjectId(session.user.id)

    const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry')
    const entry = await JournalEntry.findOne({ _id: entryId, userId }).lean()
    if (!entry) return err('Journal entry not found or access denied for update', 404)

    const operations = validation.data.map((item, index) => {
        const isExisting = mongoose.Types.ObjectId.isValid(item.id)
        const order = typeof item.order === 'number' ? item.order : index
        const type = item.type || 'paragraph'

        if (isExisting) {
            return {
                updateOne: {
                    filter: { _id: item.id, entityId: entryId, entityType: 'JournalEntry' },
                    update: {
                        $set: {
                            ...item,
                            id: undefined,
                            entityId: undefined,
                            entityType: undefined,
                            order,
                            type,
                            parentId: mongoose.Types.ObjectId.isValid(item.parentId) ? item.parentId : null
                        }
                    }
                }
            }
        } else {
            return {
                insertOne: {
                    document: {
                        ...item,
                        id: undefined,
                        _id: undefined,
                        entityId: entryId,
                        entityType: 'JournalEntry',
                        order,
                        type,
                        parentId: mongoose.Types.ObjectId.isValid(item.parentId) ? item.parentId : null
                    }
                }
            }
        }
    })

    if (operations.length > 0) {
        await Block.bulkWrite(operations)
    }

    // Update parent preview
    await updateEntityPreview(entryId.toString(), 'JournalEntry')

    const blocks = await Block.find({ entityId: entryId, entityType: 'JournalEntry' }).sort({ order: 1 }).lean()
    return ok(blocks.map(b => ({ ...b, id: b._id.toString(), _id: undefined })))
})
