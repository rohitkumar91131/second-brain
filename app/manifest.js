export default function manifest() {
    return {
        name: 'Second Brain',
        short_name: 'Second Brain',
        description: 'Your personal knowledge management system',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#0F172A',
        theme_color: '#6366F1',
        orientation: 'portrait',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
            },
            {
                src: '/favicon.ico',
                sizes: '48x48',
                type: 'image/x-icon',
            },
        ],
    }
}
