"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getNotificationCounts() {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session?.user) return { messages: 0, submissions: 0 };

        const { role } = session.user;
        let messageCount = 0;
        let submissionCount = 0;

        // 1. Messages are relevant for Admins and Editors
        if (role === 'admin' || role === 'editor') {
            const msgRows: any = await db.execute(
                sql`SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'`
            );
            messageCount = msgRows[0][0].count;
        }

        // 2. New Submissions are primarily for Editors and Admins (awaiting desk screening)
        if (role === 'admin' || role === 'editor') {
            const subRows: any = await db.execute(
                sql`SELECT COUNT(*) as count FROM submissions WHERE status = 'submitted'`
            );
            submissionCount = subRows[0][0].count;
        }

        return {
            messages: messageCount,
            submissions: submissionCount
        };
    } catch (error) {
        console.error("Get Notification Counts Error:", error);
        return { messages: 0, submissions: 0 };
    }
}
