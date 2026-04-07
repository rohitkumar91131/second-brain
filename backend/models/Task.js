const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Done', 'Blocked', 'On Hold'],
      default: 'Not Started',
    },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    tags: [{ type: String, trim: true }],
    dueDate: { type: String },
    completed: { type: Boolean, default: false },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
    history: { type: [String], default: [] },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Task || mongoose.model('Task', TaskSchema)
