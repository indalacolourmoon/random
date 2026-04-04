import { NextAuthOptions, DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users, userProfiles } from "@/db/schema";
import bcrypt from "bcryptjs";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: string;
        email: string;
        name: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
    }
}

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
                    const result = await db.select({
                        id: users.id,
                        email: users.email,
                        passwordHash: users.passwordHash,
                        role: users.role,
                        fullName: userProfiles.fullName,
                        isActive: users.isActive
                    })
                    .from(users)
                    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
                    .where(eq(users.email, credentials.email))
                    .limit(1);

                    const user = result[0];

                    if (!user || !user.isActive) {
                        throw new Error("Invalid email or password or account deactivated");
                    }

                    if (!user.passwordHash) {
                        throw new Error("Please set up your account password first.");
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

                    if (!isPasswordValid) {
                        throw new Error("Invalid email or password");
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.fullName || "User",
                        role: user.role,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }): Promise<JWT> {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
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
