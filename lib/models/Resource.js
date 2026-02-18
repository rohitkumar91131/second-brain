import mongoose from 'mongoose'

const ResourceSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, required: true, trim: true, maxlength: 500 },
        type: {
            type: String,
            enum: ['Book', 'Article', 'Website', 'Video', 'Course', 'Podcast', 'Tool', 'Other'],
            default: 'Other',
        },
        url: { type: String, default: '' },
        tags: [{ type: String, trim: true }],
        status: {
            type: String,
            enum: ['To Read', 'Reading', 'Completed', 'Active'],
            default: 'To Read',
        },
        areaId: { type: String, default: null },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
)

export default mongoose.models.Resource || mongoose.model('Resource', ResourceSchema)
