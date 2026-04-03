"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { submissions, submissionVersions, users } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function getMySubmissions() {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session?.user?.email) return [];

        // 1. Get the user's UUID from the email
        const userRows = await db.select().from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);
        const user = userRows[0];

        if (!user) return [];

        // 2. Fetch submissions for the current user using relational query
        const rows = await db.select({
            submission: submissions,
            version: submissionVersions
        })
        .from(submissions)
        .where(eq(submissions.correspondingAuthorId, user.id))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, sql`(SELECT MAX(version_number) FROM submission_versions WHERE submission_id = ${submissions.id})`)
        ))
        .orderBy(desc(submissions.submittedAt));

        // 3. Map to a flatter structure for the UI
        return rows.map(row => ({
            id: row.submission.id,
            paper_id: row.submission.paperId,
            title: row.version?.title || "Untitled Manuscript",
            status: row.submission.status,
            submitted_at: row.submission.submittedAt
        }));
        
    } catch (error) {
        console.error("Get My Submissions Error:", error);
        return [];
    }
}
