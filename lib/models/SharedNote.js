import mongoose from 'mongoose'

const SharedNoteSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        blocks: [
            {
                type: { type: String, required: true },
                content: { type: String, default: '' },
                order: { type: Number, required: true },
            }
        ],
        originalNoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
)

export default mongoose.models.SharedNote || mongoose.model('SharedNote', SharedNoteSchema)
