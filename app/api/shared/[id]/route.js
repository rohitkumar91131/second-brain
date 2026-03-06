import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import SharedNote from '@/lib/models/SharedNote'
import { ok, err, withErrorHandler } from '@/lib/apiHelpers'

export const GET = withErrorHandler(async (request, { params }) => {
    await connectDB()

    const sharedId = params.id

    if (!mongoose.Types.ObjectId.isValid(sharedId)) {
        return err('Invalid shared ID', 400)
    }

    const sharedNote = await SharedNote.findById(sharedId).lean()
    if (!sharedNote) {
        return err('Shared note not found', 404)
    }

    return ok({
        id: sharedNote._id,
        title: sharedNote.title,
        blocks: sharedNote.blocks,
        createdAt: sharedNote.createdAt
    })
})
