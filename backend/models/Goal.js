const mongoose = require('mongoose')

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
    history: { type: [String], default: [] },
    logs: [{ date: { type: String, required: true }, text: { type: String, required: true } }],
  },
  { timestamps: true }
)

module.exports = mongoose.models.Goal || mongoose.model('Goal', GoalSchema)
