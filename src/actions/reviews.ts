"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { sendEmail, emailTemplates } from "@/lib/mail";
import { safeDeleteFile } from "@/lib/fs-utils";

export async function assignReviewer(formData: FormData) {
    const submissionId = parseInt(formData.get('submissionId') as string);
    const reviewerId = parseInt(formData.get('reviewerId') as string);
    const deadline = formData.get('deadline') as string;
    const pdfFile = formData.get('pdfFile') as File;

    try {
        return await db.transaction(async (tx) => {
            // --- Reviewer Fatigue & Conflict Checks ---
            
            // 1. Check for Active review limit (Max 2)
            const activeReviews: any = await tx.execute(
                sql`SELECT COUNT(*) as count FROM reviews WHERE reviewer_id = ${reviewerId} AND status IN ('pending', 'in_progress')`
            );
            if (activeReviews[0][0].count >= 2) {
                return { error: "This reviewer already has 2 active assignments. Please wait until they complete one." };
            }

            // 2. Check for 30-day Cooldown
            const lastCompletion: any = await tx.execute(
                sql`SELECT completed_at FROM reviews WHERE reviewer_id = ${reviewerId} AND status = 'completed' ORDER BY completed_at DESC LIMIT 1`
            );
            if (lastCompletion[0].length > 0 && lastCompletion[0][0].completed_at) {
                const daysSinceLast = (Date.now() - new Date(lastCompletion[0][0].completed_at).getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceLast < 30) {
                    return { error: `This reviewer completed a review recently. Please allow a 30-day cooldown (Days passed: ${Math.floor(daysSinceLast)}).` };
                }
            }

            // 3. Conflict of Interest Check (Basic: Same Institution)
            const reviewerInfoRows: any = await tx.execute(sql`SELECT institute FROM users WHERE id = ${reviewerId}`);
            const authorInfoRows: any = await tx.execute(sql`SELECT affiliation FROM submissions WHERE id = ${submissionId}`);
            
            const reviewerInfo = reviewerInfoRows[0][0];
            const authorInfo = authorInfoRows[0][0];

            if (reviewerInfo && authorInfo && reviewerInfo.institute === authorInfo.affiliation) {
                return { error: "Conflict of Interest detected: Reviewer and Author are from the same institution." };
            }

            // --- Assignment Logic ---

            // Fetch current PDF status
            const existingRows: any = await tx.execute(sql`SELECT pdf_url FROM submissions WHERE id = ${submissionId}`);
            const currentPdf = existingRows[0][0]?.pdf_url;

            if (!currentPdf && (!pdfFile || pdfFile.size === 0)) {
                return { error: "A secure PDF version of the manuscript is REQUIRED for assignment as none is currently attached." };
            }

            // Update submission status to 'under_review'
            await tx.execute(
                sql`UPDATE submissions SET status = 'under_review' WHERE id = ${submissionId} AND status = 'submitted'`
            );

            // If a new PDF was uploaded, update the submission's PDF URL
            if (pdfFile && pdfFile.size > 0) {
                const bytes = await pdfFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = `secure-${submissionId}-${Date.now()}.pdf`;
                const uploadDir = path.join(process.cwd(), "public", "uploads", "submissions");
                await fs.mkdir(uploadDir, { recursive: true });
                const filePath = path.join(uploadDir, fileName);
                await fs.writeFile(filePath, buffer);

                const pdfUrl = `/uploads/submissions/${fileName}`;
                await tx.execute(
                    sql`UPDATE submissions SET pdf_url = ${pdfUrl} WHERE id = ${submissionId}`
                );
            }

            await tx.execute(
                sql`INSERT INTO reviews (submission_id, reviewer_id, deadline, status) VALUES (${submissionId}, ${reviewerId}, ${deadline}, 'in_progress')`
            );

            // Fetch user and paper details for the email
            const userRows: any = await tx.execute(sql`SELECT email, full_name FROM users WHERE id = ${reviewerId}`);
            const subRows: any = await tx.execute(sql`SELECT title, paper_id FROM submissions WHERE id = ${submissionId}`);

            const reviewer = userRows[0][0];
            const paperTitle = subRows[0][0]?.title || "Assigned Paper";
            const paperId = subRows[0][0]?.paper_id || "Unknown ID";

            if (reviewer) {
                const template = emailTemplates.reviewAssignment(reviewer.full_name, paperTitle, deadline, paperId);
                sendEmail({
                    to: reviewer.email,
                    subject: template.subject,
                    html: template.html
                });
            }

            revalidatePath('/admin/reviews');
            revalidatePath('/admin/submissions');
            return { success: true };
        });
    } catch (error: any) {
        console.error("Assign Reviewer Error:", error);
        return { error: "Failed to assign reviewer: " + error.message };
    }
}


export async function uploadReviewFeedback(reviewId: number, formData: FormData) {
    let relativePath: string | null = null;
    try {
        const file = formData.get('feedbackFile') as File;
        const feedbackText = formData.get('feedbackText') as string;

        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const fileExt = file.name.split('.').pop();
            const fileName = `review-${reviewId}-${Date.now()}.${fileExt}`;
            const uploadDir = path.join(process.cwd(), "public/uploads/reviews");
            await fs.mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, fileName);
            await fs.writeFile(filePath, buffer);
            relativePath = `/uploads/reviews/${fileName}`;
        }

        await db.execute(
            sql`UPDATE reviews SET feedback_file_path = COALESCE(${relativePath}, feedback_file_path), feedback = ${feedbackText}, status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ${reviewId}`
        );

        // Notify Editor/Admin
        try {
            const details: any = await db.execute(sql`
                SELECT r.reviewer_id, u.full_name as reviewer_name, s.paper_id, s.title 
                FROM reviews r
                JOIN users u ON r.reviewer_id = u.id
                JOIN submissions s ON r.submission_id = s.id
                WHERE r.id = ${reviewId}
            `);

            if (details[0].length > 0) {
                const { reviewer_name, paper_id, title } = details[0][0];
                const template = emailTemplates.reviewCompleted(reviewer_name, title, paper_id);
                sendEmail({
                    to: process.env.SMTP_USER as string, // Notify Admin/Editor
                    subject: template.subject,
                    html: template.html
                });
            }
        } catch (emailErr) {
            console.error("Failed to send review completion email:", emailErr);
        }

        revalidatePath('/admin/reviews');
        return { success: true };
    } catch (error: any) {
        console.error("Upload Feedback Error:", error);
        if (relativePath) {
            await safeDeleteFile(relativePath);
        }
        return { error: "Failed to upload feedback: " + error.message };
    }
}

export async function getActiveReviews(reviewerId?: number) {
    try {
        let rawQuery = sql`
            SELECT r.*, s.title, s.paper_id, s.pdf_url as manuscript_path, s.status as submission_status, u.full_name as reviewer_name
            FROM reviews r 
            JOIN submissions s ON r.submission_id = s.id 
            JOIN users u ON r.reviewer_id = u.id
        `;

        if (reviewerId) {
            rawQuery = sql`${rawQuery} WHERE r.reviewer_id = ${reviewerId}`;
        }

        rawQuery = sql`${rawQuery} ORDER BY r.assigned_at DESC`;

        const rows: any = await db.execute(rawQuery);
        return rows[0] || [];
    } catch (error: any) {
        console.error("Get Reviews Error:", error);
        return [];
    }
}

export async function getUnassignedAcceptedPapers() {
    try {
        const rows: any = await db.execute(sql`
            SELECT id, paper_id, title, pdf_url
            FROM submissions 
            WHERE status IN ('submitted', 'under_review', 'accepted') 
            AND id NOT IN (SELECT submission_id FROM reviews WHERE status != 'completed')
        `);
        return rows[0] || [];
    } catch (error: any) {
        console.error("Get Unassigned Error:", error);
        return [];
    }
}
