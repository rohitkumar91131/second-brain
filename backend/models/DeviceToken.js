const mongoose = require('mongoose')

const DeviceTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

DeviceTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.models.DeviceToken || mongoose.model('DeviceToken', DeviceTokenSchema)
