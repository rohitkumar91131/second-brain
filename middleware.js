import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl
        const token = req.nextauth.token

        // If authenticated user tries to access login/register, redirect to dashboard
        if (token && (pathname === '/login' || pathname === '/register')) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized({ token, req }) {
                const { pathname } = req.nextUrl

                // Only protect dashboard routes
                if (pathname.startsWith('/dashboard')) {
                    return !!token
                }

                // Allow everything else (homepage, login, register, api, etc.)
                return true
            },
        },
        pages: {
            signIn: '/login',
        },
    }
)

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
