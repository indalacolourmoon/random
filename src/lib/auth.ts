import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password");
                }

                try {
                    const [rows]: any = await pool.execute(
                        'SELECT * FROM users WHERE email = ?',
                        [credentials.email]
                    )

                    const user = rows[0];

                    if (!user) {
                        throw new Error("Invalid email or password");
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

                    if (!isPasswordValid) {
                        throw new Error("Invalid email or password");
                    }

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.full_name,
                        role: user.role,
                    };
                } catch (error: any) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
};
