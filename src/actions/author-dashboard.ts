'use server';

import { db } from "@/lib/db";
import { submissions, submissionVersions, users } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { eq, and, desc, sql, count } from "drizzle-orm";

export async function getAuthorDashboardData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // 1. Fetch Summary Stats
    const statsResult = await db.execute(sql`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
            SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as underReview,
            SUM(CASE WHEN status = 'revision_requested' THEN 1 ELSE 0 END) as revisionRequested,
            SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
            SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM submissions
        WHERE corresponding_author_id = ${userId}
    `);

    const stats = (statsResult[0] as any)[0] || {
        total: 0,
        submitted: 0,
        underReview: 0,
        revisionRequested: 0,
        accepted: 0,
        published: 0,
        rejected: 0
    };

    // 2. Fetch Recent Submissions with their latest version title
    // Note: In this schema, it seems we might need to join with submission_versions 
    // but the submissions table doesn't have the title directly. 
    // Let's verify the schema again for where the "active" title is.
    // Based on schema.ts reviewed earlier, title is in submission_versions.
    
    const recentSubmissions = await db.execute(sql`
        SELECT 
            s.id, 
            s.paper_id, 
            s.status, 
            s.submitted_at, 
            v.title
        FROM submissions s
        LEFT JOIN submission_versions v ON v.submission_id = s.id AND v.version_number = (
            SELECT MAX(version_number) FROM submission_versions WHERE submission_id = s.id
        )
        WHERE s.corresponding_author_id = ${userId}
        ORDER BY s.submitted_at DESC
        LIMIT 5
    `);

    return {
        stats,
        recentSubmissions: recentSubmissions[0] as any[]
    };
}
