import './globals.css';
import { Toaster } from 'sonner';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from '@/context/AppContext';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
    title: 'Second Brain',
    description: 'Your personal knowledge management system',
    manifest: '/manifest.webmanifest',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Second Brain',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <meta name="theme-color" content="#6366F1" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Second Brain" />
                <link rel="apple-touch-icon" href="/icon-192.png" />
            </head>
            <body>
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
                    <ThemeProvider>
                        <AppProvider>
                            {children}
                        </AppProvider>
                        <Toaster position="bottom-right" richColors closeButton />
                    </ThemeProvider>
                    <Analytics />
                </GoogleOAuthProvider>
            </body>
        </html>
    );
}
