const mongoose = require('mongoose')

const DeviceVerificationSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired'],
      default: 'pending',
    },
    deviceName: { type: String, default: null },
    platform: { type: String, enum: ['android', 'ios', 'unknown'], default: 'unknown' },
    deviceId: { type: String, default: null },
    fcmToken: { type: String, default: null },
    expiresAt: { type: Date, required: true, index: true },
    approvedAt: { type: Date, default: null },
    approverIp: { type: String, default: null },
    approverUserAgent: { type: String, default: null },
  },
  { timestamps: true }
)

DeviceVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.models.DeviceVerification || mongoose.model('DeviceVerification', DeviceVerificationSchema)