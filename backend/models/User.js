const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    image: { type: String },
    provider: { type: String, default: 'credentials' },
    emailVerified: { type: Date },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    viewPreferences: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

module.exports = mongoose.models.User || mongoose.model('User', UserSchema)
