import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                role: { label: "Role", type: "text" }
            },
            async authorize(credentials, req) {
                // Verify user credentials
                const { email, password, role } = credentials;
                if (
                    (email === 'admin@example.com' && password === 'password' && role === 'admin') ||
                    (email === 'user@example.com' && password === 'password' && role === 'user')
                ) {
                    return { id: 1, name: email, email, role };
                }
                // Clearly state if the credentials are wrong.
                throw new Error("Invalid credentials. Please check your email, password, and role.");
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.role = token.role;
            return session;
        }
    },
    pages: {
        signIn: '/signin'
    }
});