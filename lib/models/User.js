import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, select: false }, // only for credentials provider
        image: { type: String },
        provider: { type: String, default: 'credentials' }, // google | facebook | github | credentials
        emailVerified: { type: Date },
        verificationToken: { type: String },
        verificationTokenExpires: { type: Date },
        viewPreferences: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
)

export default mongoose.models.User || mongoose.model('User', UserSchema)
