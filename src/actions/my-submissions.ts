"use server";

import pool from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getMySubmissions() {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session?.user) return [];

        const [rows]: any = await pool.execute(
            'SELECT * FROM submissions WHERE author_email = ? ORDER BY submitted_at DESC',
            [session.user.email]
        );
        return rows;
    } catch (error) {
        console.error("Get My Submissions Error:", error);
        return [];
    }
}
