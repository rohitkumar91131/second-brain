import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { LoginSchema } from '@/lib/validators/schemas'

// MongoDB client for the adapter (uses native driver, not mongoose)
const clientPromise = MongoClient.connect(process.env.MONGODB_URI)

export const authOptions = {
    adapter: MongoDBAdapter(clientPromise),

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),

        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        }),

        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),

        CredentialsProvider({
            name: 'Email & Password',
            credentials: {
                email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // Validate input
                const parsed = LoginSchema.safeParse(credentials)
                if (!parsed.success) {
                    throw new Error('Invalid credentials format')
                }

                await connectDB()

                // Find user with password field (select: false by default)
                const user = await User.findOne({ email: parsed.data.email }).select('+password')
                if (!user) {
                    throw new Error('No account found with this email')
                }

                if (!user.password) {
                    throw new Error('This account uses social login. Please sign in with Google, Facebook, or GitHub.')
                }

                const isValid = await bcrypt.compare(parsed.data.password, user.password)
                if (!isValid) {
                    throw new Error('Incorrect password')
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                }
            },
        }),
    ],

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id
                token.provider = account?.provider || 'credentials'
            }
            return token
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.provider = token.provider
            }
            return session
        },

        async signIn({ user, account, profile }) {
            // Allow all OAuth sign-ins
            if (account?.type === 'oauth') {
                return true
            }
            // Credentials sign-in handled in authorize()
            return true
        },
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },

    secret: process.env.NEXTAUTH_SECRET,

    debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
