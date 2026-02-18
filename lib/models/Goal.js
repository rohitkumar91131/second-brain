import mongoose from 'mongoose'

const GoalSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, required: true, trim: true, maxlength: 500 },
        status: {
            type: String,
            enum: ['Not Started', 'Active', 'Done', 'On Hold', 'Blocked'],
            default: 'Active',
        },
        tags: [{ type: String, trim: true }],
        dueDate: { type: String },
        progress: { type: Number, min: 0, max: 100, default: 0 },
        areaId: { type: String, default: null },
        metric: { type: String, default: '' },
    },
    { timestamps: true }
)

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema)
