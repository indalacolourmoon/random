"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function trackManuscript(paperId: string, authorEmail?: string) {
    try {
        let query = sql`SELECT id, paper_id, title, author_name, status, submitted_at, updated_at,
             (SELECT MIN(assigned_at) FROM reviews WHERE submission_id = submissions.id) as review_started_at
             FROM submissions 
             WHERE paper_id = ${paperId}`;

        if (authorEmail) {
            query = sql`${query} AND author_email = ${authorEmail}`;
        }

        const rows: any = await db.execute(query);

        if (rows[0].length === 0) {
            return { error: "No manuscript found with these credentials. Please check your Paper ID and Email." };
        }

        const manuscript = rows[0][0];

        // If rejected, fetch reviewer feedback
        if (manuscript.status === 'rejected') {
            const feedbackRows: any = await db.execute(
                sql`SELECT feedback FROM reviews WHERE submission_id = ${manuscript.id} AND status = "completed"`
            );
            manuscript.reviewer_feedback = (feedbackRows[0] || []).map((r: any) => r.feedback);
        }

        return { success: true, manuscript };
    } catch (error: any) {
        console.error("Track Manuscript Error:", error);
        return { error: "An error occurred while fetching the status. Please try again later." };
    }
}
