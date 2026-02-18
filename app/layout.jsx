import './globals.css'
import { AppProvider } from '@/context/AppContext'

export const metadata = {
    title: 'Second Brain Tracker',
    description: 'Your personal knowledge management system',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AppProvider>
                    {children}
                </AppProvider>
            </body>
        </html>
    )
}
