"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSettings } from "./settings";
import { sendEmail, emailTemplates } from "@/lib/mail";
import path from "path";
import fs from "fs/promises";
import { brandPdf } from "@/lib/pdf-branding";

async function syncPublicationModes(targetPool: any = pool) {
    try {
        // 1. Find the latest published issue
        const [latest]: any = await targetPool.execute(`
            SELECT id FROM volumes_issues 
            WHERE status = 'published' 
            ORDER BY year DESC, volume_number DESC, issue_number DESC 
            LIMIT 1
        `);

        if (latest[0]) {
            const latestId = latest[0].id;

            // 2. Set papers in latest issue to 'current'
            await targetPool.execute(
                "UPDATE submissions SET submission_mode = 'current' WHERE issue_id = ? AND status = 'published'",
                [latestId]
            );

            // 3. Set all other published papers to 'archive'
            await targetPool.execute(
                "UPDATE submissions SET submission_mode = 'archive' WHERE (issue_id != ? OR issue_id IS NULL) AND status = 'published'",
                [latestId]
            );
        } else {
            // No published issues, all should be archive (default)
            await targetPool.execute("UPDATE submissions SET submission_mode = 'archive' WHERE status = 'published'");
        }
    } catch (error) {
        console.error("Critical Sync Error:", error);
        throw error; // Rethrow to allow transaction rollbacks to catch it
    }
}

export async function createVolumeIssue(formData: FormData) {
    const volume = parseInt(formData.get('volume') as string);
    const issue = parseInt(formData.get('issue') as string);
    const year = parseInt(formData.get('year') as string);
    const monthRange = formData.get('monthRange') as string;

    try {
        await pool.execute(
            'INSERT INTO volumes_issues (volume_number, issue_number, year, month_range) VALUES (?, ?, ?, ?)',
            [volume, issue, year, monthRange]
        );
        revalidatePath('/admin/publications');
        return { success: true };
    } catch (error: any) {
        console.error("Create Publication Error:", error);
        return { error: "Failed to create publication: " + error.message };
    }
}

export async function getVolumesIssues() {
    try {
        const [rows]: any = await pool.execute(`
            SELECT vi.*, 
            (SELECT COUNT(*) FROM submissions s WHERE s.issue_id = vi.id) as paper_count 
            FROM volumes_issues vi 
            ORDER BY vi.year DESC, vi.volume_number DESC, vi.issue_number DESC
        `);
        return rows;
    } catch (error: any) {
        console.error("Get Publications Error:", error);
        return [];
    }
}

export async function getLatestPublishedIssue() {
    try {
        const [rows]: any = await pool.execute(
            "SELECT * FROM volumes_issues WHERE status = 'published' ORDER BY year DESC, volume_number DESC, issue_number DESC LIMIT 1"
        );
        return rows[0] || null;
    } catch (error: any) {
        console.error("Get Latest Published Issue Error:", error);
        return null;
    }
}

export async function assignPaperToIssue(submissionId: number, issueId: number, startPage?: number, endPage?: number) {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // 1. Fetch Submission Details
        const [subRows]: any = await conn.execute('SELECT * FROM submissions WHERE id = ?', [submissionId]);
        const submission = subRows[0];
        if (!submission) throw new Error("Submission not found");

        // 2. Fetch Issue Details
        const [issueRows]: any = await conn.execute('SELECT * FROM volumes_issues WHERE id = ?', [issueId]);
        const issue = issueRows[0];
        if (!issue) throw new Error("Issue not found");

        // 3. Fetch Settings
        const settings = await getSettings();

        // 4. Ensure PDF is present for publication
        if (!submission.pdf_url) {
            throw new Error("Final styled PDF must be uploaded before publication.");
        }

        // 4.5 Auto-Page Numbering Logic
        let computedStartPage = startPage;
        let computedEndPage = endPage;

        if (!computedStartPage || !computedEndPage) {
            const [maxPageRows]: any = await conn.execute(
                'SELECT MAX(end_page) as last_page FROM submissions WHERE issue_id = ? AND status = "published"',
                [issueId]
            );
            const lastPage: number = maxPageRows[0]?.last_page || 0;
            // Ensure computedStartPage is always a number after this block
            computedStartPage = computedStartPage ?? (lastPage + 1);

            if (!computedEndPage) {
                try {
                    const pdfPath = path.join(process.cwd(), 'public', submission.pdf_url);
                    const pdfBytes = await fs.readFile(pdfPath);
                    const { PDFDocument } = await import('pdf-lib');
                    const pdfDoc = await PDFDocument.load(pdfBytes);
                    const pageCount = pdfDoc.getPageCount();
                    computedEndPage = (computedStartPage as number) + pageCount - 1;
                } catch (pdfErr) {
                    console.error("Failed to read PDF for page count:", pdfErr);
                    computedEndPage = computedStartPage as number; // Fallback gracefully
                }
            }
        }
        // At this point both are guaranteed to be numbers
        const finalStartPage = computedStartPage as number;
        const finalEndPage = computedEndPage as number;

        // 5. Generate Branded PDF
        const brandedFileName = `${submission.paper_id}-published.pdf`;
        const brandedRelativePath = `/uploads/published/${brandedFileName}`;

        await brandPdf(submission.pdf_url, brandedRelativePath, {
            journalName: settings.journal_name || "International Journal of Innovative Trends in Engineering Science and Technology",
            journalShortName: settings.journal_short_name || "IJITEST",
            volume: issue.volume_number,
            issue: issue.issue_number,
            year: issue.year,
            monthRange: issue.month_range,
            issn: settings.issn_number || "XXXX-XXXX",
            website: settings.journal_website || "https://ijitest.org",
            paperId: submission.paper_id,
            startPage: finalStartPage,
            endPage: finalEndPage
        });

        // 6. Update Database using connection
        await conn.execute(
            "UPDATE submissions SET issue_id = ?, status = 'published', file_path = ?, published_at = NOW(), start_page = ?, end_page = ? WHERE id = ?",
            [issueId, brandedRelativePath, finalStartPage, finalEndPage, submissionId]
        );

        // 7. Sync Modes inside transaction
        await syncPublicationModes(conn);

        // Commit transaction
        await conn.commit();

        // Notify Author asynchronously
        try {
            const template = emailTemplates.manuscriptPublished(
                submission.author_name,
                submission.title,
                submission.paper_id,
                issue.volume_number,
                issue.issue_number,
                issue.year
            );
            sendEmail({
                to: submission.author_email,
                subject: template.subject,
                html: template.html
            });
        } catch (emailErr) {
            console.error("Failed to send publication email:", emailErr);
        }

        revalidatePath('/admin/submissions');
        revalidatePath('/admin/publications');
        revalidatePath('/archives');
        revalidatePath('/current-issue');
        return { success: true };
    } catch (error: any) {
        await conn.rollback();
        console.error("Assign Paper Error:", error);
        return { error: "Failed to assign paper: " + error.message };
    } finally {
        conn.release();
    }
}

export async function publishIssue(id: number) {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        await conn.execute(
            "UPDATE volumes_issues SET status = 'published' WHERE id = ?",
            [id]
        );

        // Also update papers in this issue to 'published' status
        await conn.execute(
            "UPDATE submissions SET status = 'published', published_at = NOW() WHERE issue_id = ?",
            [id]
        );

        // Sync Modes inside transaction
        await syncPublicationModes(conn);

        await conn.commit();

        revalidatePath('/admin/publications');
        revalidatePath('/archives');
        revalidatePath('/current-issue');
        return { success: true };
    } catch (error: any) {
        await conn.rollback();
        console.error("Publish Issue Error:", error);
        return { error: "Failed to publish issue: " + error.message };
    } finally {
        conn.release();
    }
}

export async function getPapersByIssueId(issueId: number) {
    try {
        const [rows]: any = await pool.execute(
            'SELECT id, paper_id, title, author_name, status FROM submissions WHERE issue_id = ? ORDER BY title ASC',
            [issueId]
        );
        return rows;
    } catch (error: any) {
        console.error("Get Papers By Issue Error:", error);
        return [];
    }
}

export async function unassignPaperFromIssue(submissionId: number) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute(
            "UPDATE submissions SET issue_id = NULL, status = 'paid', submission_mode = 'archive' WHERE id = ?",
            [submissionId]
        );

        // Sync Modes inside transaction
        await syncPublicationModes(connection);

        await connection.commit();

        revalidatePath('/admin/publications');
        revalidatePath('/admin/submissions');
        revalidatePath('/archives');
        revalidatePath('/current-issue');
        return { success: true };
    } catch (error: any) {
        await connection.rollback();
        console.error("Unassign Paper Error:", error);
        return { error: "Failed to unassign paper: " + error.message };
    } finally {
        connection.release();
    }
}

export async function updateVolumeIssue(id: number, formData: FormData) {
    const volume = parseInt(formData.get('volume') as string);
    const issue = parseInt(formData.get('issue') as string);
    const year = parseInt(formData.get('year') as string);
    const monthRange = formData.get('monthRange') as string;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute(
            'UPDATE volumes_issues SET volume_number = ?, issue_number = ?, year = ?, month_range = ? WHERE id = ?',
            [volume, issue, year, monthRange, id]
        );

        // Sync Modes
        await syncPublicationModes(connection);

        await connection.commit();

        revalidatePath('/admin/publications');
        revalidatePath('/archives');
        revalidatePath('/current-issue');
        return { success: true };
    } catch (error: any) {
        await connection.rollback();
        console.error("Update Publication Error:", error);
        return { error: "Failed to update publication: " + error.message };
    } finally {
        connection.release();
    }
}

export async function deleteVolumeIssue(id: number) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Unassign all papers first
        await connection.execute(
            "UPDATE submissions SET issue_id = NULL, status = 'paid' WHERE issue_id = ?",
            [id]
        );

        // 2. Delete the issue
        await connection.execute("DELETE FROM volumes_issues WHERE id = ?", [id]);

        // Sync Modes
        await syncPublicationModes(connection);

        await connection.commit();

        revalidatePath('/admin/publications');
        revalidatePath('/archives');
        revalidatePath('/current-issue');
        return { success: true };
    } catch (error: any) {
        await connection.rollback();
        console.error("Delete Publication Error:", error);
        return { error: "Failed to delete publication: " + error.message };
    } finally {
        connection.release();
    }
}
export async function retractPaper(submissionId: number, retractionNoticeUrl: string) {
    try {
        await pool.execute(
            "UPDATE submissions SET status = 'retracted', retraction_notice_url = ? WHERE id = ?",
            [retractionNoticeUrl, submissionId]
        );

        revalidatePath('/admin/submissions');
        revalidatePath(`/archives/${submissionId}`);
        revalidatePath('/archives');
        revalidatePath('/current-issue');
        revalidatePath('/');
        
        return { success: true };
    } catch (error: any) {
        console.error("Retract Paper Error:", error);
        return { error: "Failed to retract paper: " + error.message };
    }
}
