import mongoose from 'mongoose'

const BlockSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ['paragraph', 'heading1', 'heading2', 'heading3', 'bullet', 'toggle', 'divider', 'callout'],
        default: 'paragraph',
    },
    content: { type: String, default: '' },
    children: { type: String, default: '' },
}, { _id: false })

const JournalEntrySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, required: true, trim: true },
        date: { type: String, required: true }, // yyyy-MM-dd
        mood: {
            type: String,
            enum: ['Amazing', 'Good', 'Okay', 'Tough', 'Bad'],
            default: 'Good',
        },
        content: [BlockSchema],
    },
    { timestamps: true }
)

export default mongoose.models.JournalEntry || mongoose.model('JournalEntry', JournalEntrySchema)
