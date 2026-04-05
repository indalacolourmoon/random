"use server";

import { db } from "@/lib/db";
import { contactMessages, submissions, reviewAssignments } from "@/db/schema";
import { eq, count, and, or, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ActionResponse } from "@/db/types";

export async function getNotificationCounts(): Promise<ActionResponse<{ messages: number, submissions: number }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };

        const { role, id: userId } = session.user;
        let messageCount = 0;
        let submissionCount = 0;

        // 1. Messages are relevant for Admins and Editors
        if (role === 'admin' || role === 'editor') {
            const [msgResult] = await db.select({ count: count() })
                .from(contactMessages)
                .where(eq(contactMessages.status, 'pending'));
            messageCount = msgResult.count;
        }

        // 2. New Submissions / Pending Reviews
        if (role === 'admin' || role === 'editor') {
            // Desk screening for admins/editors
            const [subResult] = await db.select({ count: count() })
                .from(submissions)
                .where(eq(submissions.status, 'submitted'));
            submissionCount = subResult.count;
            // Note: Add new pending statuses (e.g., 'in_review') to the array below 
            // if the review workflow is expanded in the future.
            const [revResult] = await db.select({ count: count() })
                .from(reviewAssignments)
                .where(and(
                    eq(reviewAssignments.reviewerId, userId),
                    inArray(reviewAssignments.status, ['assigned', 'accepted'])
                ));
            submissionCount = revResult.count;
        }

        const data = {
            messages: messageCount,
            submissions: submissionCount
        };
        return { success: true, data };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Get Notification Counts Error:", error);
        return { success: false, error: message };
    }
}
