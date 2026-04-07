import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Block from '@/lib/models/Block'
import Note from '@/lib/models/Note'
import { requireAuth, ok, withErrorHandler } from '@/lib/apiHelpers'

export const GET = withErrorHandler(async () => {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    const userId = new mongoose.Types.ObjectId(session.user.id)

    // Using aggregation to join with Notes and JournalEntries
    const mediaBlocks = await Block.aggregate([
        {
            $match: {
                type: { $in: ['image', 'video', 'audio'] }
            }
        },
        {
            $lookup: {
                from: 'notes',
                localField: 'entityId',
                foreignField: '_id',
                as: 'note'
            }
        },
        {
            $lookup: {
                from: 'journalentries',
                localField: 'entityId',
                foreignField: '_id',
                as: 'journal'
            }
        },
        {
            $addFields: {
                parent: {
                    $cond: [
                        { $gt: [{ $size: '$note' }, 0] },
                        { $arrayElemAt: ['$note', 0] },
                        { $arrayElemAt: ['$journal', 0] }
                    ]
                }
            }
        },
        {
            $match: {
                'parent.userId': userId
            }
        },
        {
            $project: {
                id: '$_id',
                _id: 0,
                type: 1,
                content: 1,
                entityId: 1,
                entityType: 1,
                order: 1,
                parentId: 1,
                noteTitle: '$parent.title',
                updatedAt: '$parent.updatedAt'
            }
        },
        {
            $sort: { updatedAt: -1 }
        }
    ])

    return ok(mediaBlocks)
})
