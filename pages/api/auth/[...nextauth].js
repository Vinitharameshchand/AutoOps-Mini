import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "mock_id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_secret",
        }),
        // Mock Credentials for Development
        CredentialsProvider({
            name: "Development Login",
            credentials: {}, // No inputs needed
            async authorize(credentials) {
                // Allow any login in development
                return {
                    id: "1",
                    name: "Dev User",
                    email: "dev@autoops.com",
                    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                };
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
    },
    callbacks: {
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};

export default NextAuth(authOptions);
