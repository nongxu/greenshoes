import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Pool } from 'pg';

// PostgreSQL connect pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                role: { label: "Role", type: "text" }
            },
            async authorize(credentials) {
                const { email, password, role } = credentials;

                const client = await pool.connect();
                try {
                    const result = await client.query(
                        'SELECT * FROM users WHERE email = $1',
                        [email]
                    );

                    const user = result.rows[0];

                    if (!user) {
                        throw new Error('User not found');
                    }

                    // 
                    if (user.password_hash !== password) {
                        throw new Error('Invalid password');
                    }

                    if (user.role !== role) {
                        throw new Error('Invalid role');
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.full_name,
                        role: user.role
                    };
                } finally {
                    client.release();
                }
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
