"use server";

import pool from "@/lib/db";
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

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // --- Reviewer Fatigue & Conflict Checks ---
        
        // 1. Check for Active review limit (Max 2)
        const [activeReviews]: any = await connection.execute(
            "SELECT COUNT(*) as count FROM reviews WHERE reviewer_id = ? AND status IN ('pending', 'in_progress')",
            [reviewerId]
        );
        if (activeReviews[0].count >= 2) {
            await connection.rollback();
            return { error: "This reviewer already has 2 active assignments. Please wait until they complete one." };
        }

        // 2. Check for 30-day Cooldown
        const [lastCompletion]: any = await connection.execute(
            "SELECT completed_at FROM reviews WHERE reviewer_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 1",
            [reviewerId]
        );
        if (lastCompletion.length > 0 && lastCompletion[0].completed_at) {
            const daysSinceLast = (Date.now() - new Date(lastCompletion[0].completed_at).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLast < 30) {
                await connection.rollback();
                return { error: `This reviewer completed a review recently. Please allow a 30-day cooldown (Days passed: ${Math.floor(daysSinceLast)}).` };
            }
        }

        // 3. Conflict of Interest Check (Basic: Same Institution)
        const [reviewerInfo]: any = await connection.execute("SELECT institute FROM users WHERE id = ?", [reviewerId]);
        const [authorInfo]: any = await connection.execute("SELECT affiliation FROM submissions WHERE id = ?", [submissionId]);
        if (reviewerInfo[0] && authorInfo[0] && reviewerInfo[0].institute === authorInfo[0].affiliation) {
            await connection.rollback();
            return { error: "Conflict of Interest detected: Reviewer and Author are from the same institution." };
        }

        // --- Assignment Logic ---

        // Fetch current PDF status
        const [existing]: any = await connection.execute("SELECT pdf_url FROM submissions WHERE id = ?", [submissionId]);
        const currentPdf = existing[0]?.pdf_url;

        if (!currentPdf && (!pdfFile || pdfFile.size === 0)) {
            await connection.rollback();
            return { error: "A secure PDF version of the manuscript is REQUIRED for assignment as none is currently attached." };
        }

        // Update submission status to 'under_review'
        await connection.execute(
            "UPDATE submissions SET status = 'under_review' WHERE id = ? AND status = 'submitted'",
            [submissionId]
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
            await connection.execute(
                "UPDATE submissions SET pdf_url = ? WHERE id = ?",
                [pdfUrl, submissionId]
            );
        }

        await connection.execute(
            'INSERT INTO reviews (submission_id, reviewer_id, deadline, status) VALUES (?, ?, ?, ?)',
            [submissionId, reviewerId, deadline, 'in_progress']
        );

        // Fetch user and paper details for the email
        const [userRows]: any = await connection.execute('SELECT email, full_name FROM users WHERE id = ?', [reviewerId]);
        const [subRows]: any = await connection.execute('SELECT title, paper_id FROM submissions WHERE id = ?', [submissionId]);

        await connection.commit();

        const reviewer = userRows[0];
        const paperTitle = subRows[0]?.title || "Assigned Paper";
        const paperId = subRows[0]?.paper_id || "Unknown ID";

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
    } catch (error: any) {
        await connection.rollback();
        console.error("Assign Reviewer Error:", error);
        return { error: "Failed to assign reviewer: " + error.message };
    } finally {
        connection.release();
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

        await pool.execute(
            "UPDATE reviews SET feedback_file_path = COALESCE(?, feedback_file_path), feedback = ?, status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?",
            [relativePath, feedbackText, reviewId]
        );

        // Notify Editor/Admin
        try {
            const [details]: any = await pool.execute(`
                SELECT r.reviewer_id, u.full_name as reviewer_name, s.paper_id, s.title 
                FROM reviews r
                JOIN users u ON r.reviewer_id = u.id
                JOIN submissions s ON r.submission_id = s.id
                WHERE r.id = ?
            `, [reviewId]);

            if (details.length > 0) {
                const { reviewer_name, paper_id, title } = details[0];
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
        let query = `
            SELECT r.*, s.title, s.paper_id, s.pdf_url as manuscript_path, s.status as submission_status, u.full_name as reviewer_name
            FROM reviews r 
            JOIN submissions s ON r.submission_id = s.id 
            JOIN users u ON r.reviewer_id = u.id
        `;
        const params = [];

        if (reviewerId) {
            query += " WHERE r.reviewer_id = ?";
            params.push(reviewerId);
        }

        query += " ORDER BY r.assigned_at DESC";

        const [rows]: any = await pool.execute(query, params);
        return rows;
    } catch (error: any) {
        console.error("Get Reviews Error:", error);
        return [];
    }
}

export async function getUnassignedAcceptedPapers() {
    try {
        const [rows]: any = await pool.execute(`
            SELECT id, paper_id, title, pdf_url
            FROM submissions 
            WHERE status IN ('submitted', 'under_review', 'accepted') 
            AND id NOT IN (SELECT submission_id FROM reviews WHERE status != 'completed')
        `);
        return rows;
    } catch (error: any) {
        console.error("Get Unassigned Error:", error);
        return [];
    }
}
