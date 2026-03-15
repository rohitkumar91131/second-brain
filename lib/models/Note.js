import mongoose from 'mongoose'

const NoteSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, required: true, trim: true, maxlength: 500 },
        tags: [{ type: String, trim: true }],
        areaId: { type: String, default: null },
        projectIds: [{ type: String }],
        preview: { type: String, default: '' },
        isPinned: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
)

export default mongoose.models.Note || mongoose.model('Note', NoteSchema)