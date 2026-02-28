import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
    title: 'Second Brain',
    description: 'Your personal knowledge management system',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider>
                    <ToastProvider>
                        <AppProvider>
                            {children}
                        </AppProvider>
                    </ToastProvider>
                </ThemeProvider>
                <Analytics />
            </body>
        </html>
    );
}
