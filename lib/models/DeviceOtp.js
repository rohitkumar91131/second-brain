import mongoose from 'mongoose'

// 6-digit OTP for device connection (email-based)
const DeviceOtpSchema = new mongoose.Schema(
    {
        otp: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        userEmail: { type: String, required: true, index: true },
        expiresAt: { type: Date, required: true },
        isUsed: { type: Boolean, default: false },
    },
    { timestamps: true }
)

// TTL index to automatically delete expired OTPs
DeviceOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.DeviceOtp || mongoose.model('DeviceOtp', DeviceOtpSchema)
