import './globals.css';
import { Toaster } from 'sonner';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from '@/context/AppContext';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
    title: 'Second Brain',
    description: 'Your personal knowledge management system',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
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
