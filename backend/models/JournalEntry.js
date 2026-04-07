const mongoose = require('mongoose')

const JournalEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    mood: {
      type: String,
      enum: ['Amazing', 'Good', 'Okay', 'Tough', 'Bad'],
      default: 'Good',
    },
    preview: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.models.JournalEntry || mongoose.model('JournalEntry', JournalEntrySchema)
