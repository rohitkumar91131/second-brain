import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Make sure to add these to your .env.local file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
    try {
        const { file } = await req.json(); // Accept the Data URL from frontend

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(file, {
            folder: 'notes_app_uploads', // Optional folder name
            resource_type: 'image',
        });

        // Return the permanent secure URL
        return NextResponse.json({ url: uploadResponse.secure_url });

    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
    }
}