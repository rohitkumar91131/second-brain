import mongoose from 'mongoose'

const DeviceSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        name: { type: String, required: true, trim: true, maxlength: 100 },
        platform: { type: String, enum: ['android', 'ios', 'unknown'], default: 'unknown' },
        deviceId: { type: String, required: true, unique: true }, // unique device identifier from app
        fcmToken: { type: String, default: null }, // Firebase push notification token
        lastSeen: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

export default mongoose.models.Device || mongoose.model('Device', DeviceSchema)
