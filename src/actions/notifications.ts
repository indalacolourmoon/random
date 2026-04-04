"use server";

import { db } from "@/lib/db";
import { contactMessages, submissions } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ActionResponse } from "@/db/types";

export async function getNotificationCounts(): Promise<ActionResponse<{ messages: number, submissions: number }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };

        const { role } = session.user;
        let messageCount = 0;
        let submissionCount = 0;

        // 1. Messages are relevant for Admins and Editors
        if (role === 'admin' || role === 'editor') {
            const [msgResult] = await db.select({ count: count() })
                .from(contactMessages)
                .where(eq(contactMessages.status, 'pending'));
            messageCount = msgResult.count;
        }

        // 2. New Submissions are primarily for Editors and Admins (awaiting desk screening)
        if (role === 'admin' || role === 'editor') {
            const [subResult] = await db.select({ count: count() })
                .from(submissions)
                .where(eq(submissions.status, 'submitted'));
            submissionCount = subResult.count;
        }

        const data = {
            messages: messageCount,
            submissions: submissionCount
        };
        return { success: true, data };
    } catch (error) {
        const message = error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error);
        console.error("Get Notification Counts Error:", error);
        return { success: false, error: message };
    }
}
