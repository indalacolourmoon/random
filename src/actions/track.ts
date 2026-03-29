"use server";

import pool from "@/lib/db";

export async function trackManuscript(paperId: string, authorEmail?: string) {
    try {
        let sql = `SELECT id, paper_id, title, author_name, status, submitted_at, updated_at,
             (SELECT MIN(assigned_at) FROM reviews WHERE submission_id = submissions.id) as review_started_at
             FROM submissions 
             WHERE paper_id = ?`;
        const params: any[] = [paperId];

        if (authorEmail) {
            sql += ` AND author_email = ?`;
            params.push(authorEmail);
        }

        const [rows]: any = await pool.execute(sql, params);

        if (rows.length === 0) {
            return { error: "No manuscript found with these credentials. Please check your Paper ID and Email." };
        }

        const manuscript = rows[0];

        // If rejected, fetch reviewer feedback
        if (manuscript.status === 'rejected') {
            const [reviews]: any = await pool.execute(
                'SELECT feedback FROM reviews WHERE submission_id = ? AND status = "completed"',
                [manuscript.id]
            );
            manuscript.reviewer_feedback = reviews.map((r: any) => r.feedback);
        }

        return { success: true, manuscript };
    } catch (error: any) {
        console.error("Track Manuscript Error:", error);
        return { error: "An error occurred while fetching the status. Please try again later." };
    }
}
