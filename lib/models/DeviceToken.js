import mongoose from 'mongoose'

const DeviceTokenSchema = new mongoose.Schema(
    {
        token: { type: String, required: true, unique: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        userName: { type: String, required: true },
        userEmail: { type: String, required: true },
        expiresAt: { type: Date, required: true, index: true },
        isUsed: { type: Boolean, default: false },
    },
    { timestamps: true }
)

// TTL index to automatically delete expired tokens after expiresAt
DeviceTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.DeviceToken || mongoose.model('DeviceToken', DeviceTokenSchema)
