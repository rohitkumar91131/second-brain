const mongoose = require('mongoose')

const BlockSchema = new mongoose.Schema(
  {
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    entityType: { type: String, required: true, enum: ['Note', 'JournalEntry'], index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'paragraph', 'heading1', 'heading2', 'heading3',
        'bullet', 'toggle', 'divider', 'callout',
        'image', 'video', 'table', 'numbered', 'audio',
        'link', 'note_reference', 'todo',
      ],
    },
    content: { type: String, default: '' },
    order: { type: Number, required: true, index: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Block || mongoose.model('Block', BlockSchema)
