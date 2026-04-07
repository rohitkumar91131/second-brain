/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === 'development',
    workboxOptions: {
        disableDevLogs: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
            // Cache Next.js static assets (JS, CSS) — long-lived, content-hashed
            {
                urlPattern: /^\/_next\/static\/.*/i,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'next-static-assets',
                    expiration: {
                        maxEntries: 300,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                    },
                },
            },
            // Cache Next.js image optimization responses
            {
                urlPattern: /^\/_next\/image\?.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'next-image-cache',
                    expiration: {
                        maxEntries: 100,
                        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                    },
                },
            },
            // Cache API responses with NetworkFirst so fresh data is preferred
            // but cached data is served when offline
            {
                urlPattern: /^https?:\/\/[^/]+\/api\/.*/i,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'api-cache',
                    networkTimeoutSeconds: 10,
                    expiration: {
                        maxEntries: 150,
                        maxAgeSeconds: 24 * 60 * 60, // 1 day
                    },
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                },
            },
            // Cache all navigated HTML pages so they are available offline
            {
                urlPattern: /^https?:\/\/[^/]+\/(dashboard|login|register)(\/.*)?$/i,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'pages-cache',
                    networkTimeoutSeconds: 10,
                    expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                    },
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                },
            },
            // Cache public static files (icons, fonts, images)
            {
                urlPattern: /\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/i,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'static-media',
                    expiration: {
                        maxEntries: 200,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                    },
                },
            },
        ],
    },
    fallbacks: {
        document: '/offline',
    },
})

const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'http', hostname: '**' },
            { protocol: 'https', hostname: '**' },
        ],
    },
}

module.exports = withPWA(nextConfig)
