"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { submissions, submissionVersions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getMySubmissions() {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session?.user?.email) return [];

        // 1. Get the user's UUID from the email
        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        });

        if (!user) return [];

        // 2. Fetch submissions for the current user using relational query
        const mySubmissionsRaw = await db.query.submissions.findMany({
            where: eq(submissions.correspondingAuthorId, user.id),
            orderBy: [desc(submissions.submittedAt)],
            with: {
                versions: {
                    orderBy: [desc(submissionVersions.versionNumber)],
                    limit: 1
                }
            }
        });

        // 3. Map to a flatter structure for the UI
        return mySubmissionsRaw.map(sub => ({
            id: sub.id,
            paper_id: sub.paperId,
            title: sub.versions?.[0]?.title || "Untitled Manuscript",
            status: sub.status,
            submitted_at: sub.submittedAt
        }));
        
    } catch (error) {
        console.error("Get My Submissions Error:", error);
        return [];
    }
}
