/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // Google profile pictures
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
            // Facebook profile pictures
            { protocol: 'https', hostname: 'graph.facebook.com' },
            { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
            // GitHub avatars
            { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
            // Generic CDN
            { protocol: 'https', hostname: '*.googleusercontent.com' },
        ],
    },
}

module.exports = nextConfig
