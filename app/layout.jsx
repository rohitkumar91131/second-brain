import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
    title: 'Second Brain Tracker',
    description: 'Your personal knowledge management system',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <ToastProvider>
                    <AppProvider>
                        {children}
                    </AppProvider>
                </ToastProvider>
                <Analytics />
            </body>
        </html>
    );
}
