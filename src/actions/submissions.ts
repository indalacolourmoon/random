"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";
import fs from 'fs/promises';
import path from 'path';

export async function decideSubmission(id: number, decision: 'accepted' | 'rejected') {
    try {
        // 1. Fetch deep details including reviewer feedback
        const [subRows]: any = await pool.execute('SELECT * FROM submissions WHERE id = ?', [id]);
        if (!subRows[0]) return { error: "Submission not found" };

        const submission = subRows[0];
        const [reviewRows]: any = await pool.execute('SELECT feedback, feedback_file_path FROM reviews WHERE submission_id = ? AND status = "completed"', [id]);

        // Aggregate feedback
        const aggregatedFeedback = reviewRows.map((r: any, i: number) => `Reviewer ${i + 1}:\n${r.feedback}`).join('\n\n');

        if (decision === 'accepted') {
            await pool.execute('UPDATE submissions SET status = "accepted" WHERE id = ?', [id]);
            const template = emailTemplates.manuscriptAcceptance(submission.author_name, submission.title, submission.paper_id);
            sendEmail({
                to: submission.author_email,
                subject: template.subject,
                html: template.html
            });
        } else {
            // REJECTION LOGIC
            // 1. Delete original file if exists
            if (submission.file_path && submission.file_path.startsWith('/')) {
                try {
                    const fullPath = path.join(process.cwd(), 'public', submission.file_path);
                    // Check if file exists first
                    await fs.access(fullPath);
                    await fs.unlink(fullPath);
                    console.log(`Deleted manuscript file: ${fullPath}`);
                } catch (e: any) {
                    if (e.code !== 'ENOENT') {
                        console.error("Manuscript Cleanup Error:", e);
                    }
                }
            }

            // 1.5 Delete reviewer feedback files if exist
            for (const review of reviewRows) {
                if (review.feedback_file_path && review.feedback_file_path.startsWith('/')) {
                    try {
                        const fullPath = path.join(process.cwd(), 'public', review.feedback_file_path);
                        await fs.access(fullPath);
                        await fs.unlink(fullPath);
                        console.log(`Deleted reviewer feedback file: ${fullPath}`);
                    } catch (e: any) {
                        if (e.code !== 'ENOENT') {
                            console.error("Reviewer File Cleanup Error:", e);
                        }
                    }
                }
            }

            // 2. Update status
            await pool.execute('UPDATE submissions SET status = "rejected" WHERE id = ?', [id]);

            // 3. Send Rejection Email with feedback
            const template = emailTemplates.manuscriptRejection(submission.author_name, submission.title, submission.paper_id, aggregatedFeedback);
            sendEmail({
                to: submission.author_email,
                subject: template.subject,
                html: template.html
            });
        }

        if (decision === 'accepted') {
            // Fetch APC setting or default
            const [settings]: any = await pool.execute('SELECT setting_value FROM settings WHERE setting_key = "apc_inr"');
            const amount = settings[0]?.setting_value || '2500';

            // Create payment record
            await pool.execute(
                'INSERT INTO payments (submission_id, amount, currency, status) VALUES (?, ?, ?, ?)',
                [id, amount, 'INR', 'unpaid']
            );
            console.log(`Created payment record for submission ${id} with amount ${amount}`);
        }

        revalidatePath('/editor/submissions');
        revalidatePath('/editor/submissions/[id]', 'page');
        revalidatePath('/editor');
        revalidatePath('/admin/submissions');
        revalidatePath('/admin/submissions/[id]', 'page');
        revalidatePath('/admin');
        revalidatePath('/admin/reviews');
        revalidatePath('/editor/reviews');
        revalidatePath('/admin/payments');
        revalidatePath('/track');
        return { success: true };
    } catch (error: any) {
        console.error("Decision Workflow Error:", error);
        return { error: "Failed to finalize decision: " + error.message };
    }
}

export async function updateSubmissionStatus(id: number, status: string) {
    try {
        await pool.execute(
            'UPDATE submissions SET status = ? WHERE id = ?',
            [status, id]
        );

        // Fetch author details to send notification
        const [rows]: any = await pool.execute('SELECT author_name, author_email, title, paper_id FROM submissions WHERE id = ?', [id]);
        if (rows[0]) {
            const { author_name, author_email, title, paper_id } = rows[0];
            const template = emailTemplates.statusUpdate(author_name, title, status, paper_id);
            sendEmail({
                to: author_email,
                subject: template.subject,
                html: template.html
            });
        }

        revalidatePath('/admin/submissions');
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Update Status Error:", error);
        return { error: "Failed to update status: " + error.message };
    }
}

export async function getSubmissionById(id: number) {
    try {
        const [rows]: any = await pool.execute(
            'SELECT * FROM submissions WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    } catch (error: any) {
        console.error("Get Submission Error:", error);
        return null;
    }
}

export async function updateSubmissionPdfUrl(id: number, pdfUrl: string) {
    try {
        await pool.execute(
            'UPDATE submissions SET pdf_url = ? WHERE id = ?',
            [pdfUrl, id]
        );

        revalidatePath('/admin/submissions');
        revalidatePath('/admin/submissions/[id]', 'page');
        revalidatePath('/reviewer/submissions/[id]', 'page');
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Update PDF URL Error:", error);
        return { error: "Failed to update PDF URL: " + error.message };
    }
}

export async function uploadManuscriptPdf(submissionId: number, formData: FormData) {
    let relativePath: string | null = null;
    try {
        const file = formData.get("pdfFile") as File;
        if (!file || file.size === 0) {
            return { error: "No PDF file selected for upload." };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `manuscript-${submissionId}-${Date.now()}.pdf`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "submissions");
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);

        // Ensure strictly relative path for DB
        // Ensure strictly relative path for DB
        relativePath = `/uploads/submissions/${fileName}`;

        await pool.execute(
            'UPDATE submissions SET pdf_url = ? WHERE id = ?',
            [relativePath, submissionId]
        );

        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${submissionId}`);
        return { success: true, url: relativePath };
    } catch (error: any) {
        console.error("Upload Manuscript PDF Error:", error);
        return { error: "Failed to upload manuscript: " + error.message };
    }
}

export async function deleteSubmissionPermanently(id: number) {
    try {
        // 1. Fetch to get file path
        const [rows]: any = await pool.execute('SELECT file_path FROM submissions WHERE id = ?', [id]);
        if (rows[0]?.file_path && rows[0].file_path.startsWith('/')) {
            try {
                const fullPath = path.join(process.cwd(), 'public', rows[0].file_path);
                await fs.access(fullPath);
                await fs.unlink(fullPath);
            } catch (e: any) {
                if (e.code !== 'ENOENT') {
                    console.error("File deletion error during permanent delete:", e);
                }
            }
        }

        // 2. Delete reviewer files
        const [reviews]: any = await pool.execute('SELECT feedback_file_path FROM reviews WHERE submission_id = ?', [id]);
        for (const r of reviews) {
            if (r.feedback_file_path && r.feedback_file_path.startsWith('/')) {
                try {
                    const fullPath = path.join(process.cwd(), 'public', r.feedback_file_path);
                    await fs.access(fullPath);
                    await fs.unlink(fullPath);
                } catch (e: any) {
                    if (e.code !== 'ENOENT') {
                        console.error("Reviewer file deletion error during permanent delete:", e);
                    }
                }
            }
        }

        // 3. Delete from DB (reviews will cascade if foreign keys are set, but let's be safe if not)
        await pool.execute('DELETE FROM reviews WHERE submission_id = ?', [id]);
        await pool.execute('DELETE FROM submissions WHERE id = ?', [id]);

        revalidatePath('/admin/submissions');
        revalidatePath('/editor/submissions');
        revalidatePath('/admin');
        revalidatePath('/editor');
        return { success: true };
    } catch (error: any) {
        console.error("Permanent Delete Error:", error);
        return { error: "Failed to delete submission: " + error.message };
    }
}
