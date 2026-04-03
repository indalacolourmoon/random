"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSettings } from "./settings";
import { sendEmail, emailTemplates } from "@/lib/mail";
import path from "path";
import fs from "fs/promises";
import { brandPdf } from "@/lib/pdf-branding";

async function syncPublicationModes(tx?: any) {
    const executor = tx || db;
    try {
        // 1. Find the latest published issue
        const latest: any = await executor.execute(sql`
            SELECT id FROM volumes_issues 
            WHERE status = 'published' 
            ORDER BY year DESC, volume_number DESC, issue_number DESC 
            LIMIT 1
        `);

        if (latest[0].length > 0) {
            const latestId = latest[0][0].id;

            // 2. Set papers in latest issue to 'current'
            await executor.execute(
                sql`UPDATE submissions SET submission_mode = 'current' WHERE issue_id = ${latestId} AND status = 'published'`
            );

            // 3. Set all other published papers to 'archive'
            await executor.execute(
                sql`UPDATE submissions SET submission_mode = 'archive' WHERE (issue_id != ${latestId} OR issue_id IS NULL) AND status = 'published'`
            );
        } else {
            // No published issues, all should be archive (default)
            await executor.execute(sql`UPDATE submissions SET submission_mode = 'archive' WHERE status = 'published'`);
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
        await db.execute(
            sql`INSERT INTO volumes_issues (volume_number, issue_number, year, month_range) VALUES (${volume}, ${issue}, ${year}, ${monthRange})`
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
        const rows: any = await db.execute(sql`
            SELECT vi.*, 
            (SELECT COUNT(*) FROM submissions s WHERE s.issue_id = vi.id) as paper_count 
            FROM volumes_issues vi 
            ORDER BY vi.year DESC, vi.volume_number DESC, vi.issue_number DESC
        `);
        return rows[0] || [];
    } catch (error: any) {
        console.error("Get Publications Error:", error);
        return [];
    }
}

export async function getLatestPublishedIssue() {
    try {
        const rows: any = await db.execute(
            sql`SELECT * FROM volumes_issues WHERE status = 'published' ORDER BY year DESC, volume_number DESC, issue_number DESC LIMIT 1`
        );
        return rows[0]?.[0] || null;
    } catch (error: any) {
        console.error("Get Latest Published Issue Error:", error);
        return null;
    }
}

export async function assignPaperToIssue(submissionId: number, issueId: number, startPage?: number, endPage?: number) {
    try {
        return await db.transaction(async (tx) => {
            // 1. Fetch Submission Details
            const subRows: any = await tx.execute(sql`SELECT * FROM submissions WHERE id = ${submissionId}`);
            const submission = subRows[0][0];
            if (!submission) throw new Error("Submission not found");

            // 2. Fetch Issue Details
            const issueRows: any = await tx.execute(sql`SELECT * FROM volumes_issues WHERE id = ${issueId}`);
            const issue = issueRows[0][0];
            if (!issue) throw new Error("Issue not found");

            // 3. Fetch Settings
            const settings = await getSettings();

            // 4. Verification Checks
            if (submission.status !== 'paid') {
                return { error: "Manuscript must be marked as 'Paid' (APC received) before it can be assigned to an issue." };
            }

            if (!submission.pdf_url) {
                return { error: "Final styled PDF must be uploaded before publication." };
            }

            // 4.5 Auto-Page Numbering Logic
            let computedStartPage = startPage;
            let computedEndPage = endPage;

            if (!computedStartPage || !computedEndPage) {
                const maxPageRows: any = await tx.execute(
                    sql`SELECT MAX(end_page) as last_page FROM submissions WHERE issue_id = ${issueId} AND status = "published"`
                );
                const lastPage: number = maxPageRows[0][0]?.last_page || 0;
                
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
            await tx.execute(
                sql`UPDATE submissions SET issue_id = ${issueId}, status = 'published', file_path = ${brandedRelativePath}, published_at = NOW(), start_page = ${finalStartPage}, end_page = ${finalEndPage} WHERE id = ${submissionId}`
            );

            // 7. Sync Modes inside transaction
            await syncPublicationModes(tx);

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
        });
    } catch (error: any) {
        console.error("Assign Paper Error:", error);
        return { error: "Failed to assign paper: " + error.message };
    }
}

export async function publishIssue(id: number) {
    try {
        return await db.transaction(async (tx) => {
            await tx.execute(
                sql`UPDATE volumes_issues SET status = 'published' WHERE id = ${id}`
            );

            // Also update papers in this issue to 'published' status
            await tx.execute(
                sql`UPDATE submissions SET status = 'published', published_at = NOW() WHERE issue_id = ${id}`
            );

            // Sync Modes inside transaction
            await syncPublicationModes(tx);

            revalidatePath('/admin/publications');
            revalidatePath('/archives');
            revalidatePath('/current-issue');
            return { success: true };
        });
    } catch (error: any) {
        console.error("Publish Issue Error:", error);
        return { error: "Failed to publish issue: " + error.message };
    }
}

export async function getPapersByIssueId(issueId: number) {
    try {
        const rows: any = await db.execute(
            sql`SELECT id, paper_id, title, author_name, status FROM submissions WHERE issue_id = ${issueId} ORDER BY title ASC`
        );
        return rows[0] || [];
    } catch (error: any) {
        console.error("Get Papers By Issue Error:", error);
        return [];
    }
}

export async function unassignPaperFromIssue(submissionId: number) {
    try {
        return await db.transaction(async (tx) => {
            await tx.execute(
                sql`UPDATE submissions SET issue_id = NULL, status = 'paid', submission_mode = 'archive' WHERE id = ${submissionId}`
            );

            // Sync Modes inside transaction
            await syncPublicationModes(tx);

            revalidatePath('/admin/publications');
            revalidatePath('/admin/submissions');
            revalidatePath('/archives');
            revalidatePath('/current-issue');
            return { success: true };
        });
    } catch (error: any) {
        console.error("Unassign Paper Error:", error);
        return { error: "Failed to unassign paper: " + error.message };
    }
}

export async function updateVolumeIssue(id: number, formData: FormData) {
    const volume = parseInt(formData.get('volume') as string);
    const issue = parseInt(formData.get('issue') as string);
    const year = parseInt(formData.get('year') as string);
    const monthRange = formData.get('monthRange') as string;

    try {
        return await db.transaction(async (tx) => {
            await tx.execute(
                sql`UPDATE volumes_issues SET volume_number = ${volume}, issue_number = ${issue}, year = ${year}, month_range = ${monthRange} WHERE id = ${id}`
            );

            // Sync Modes
            await syncPublicationModes(tx);

            revalidatePath('/admin/publications');
            revalidatePath('/archives');
            revalidatePath('/current-issue');
            return { success: true };
        });
    } catch (error: any) {
        console.error("Update Publication Error:", error);
        return { error: "Failed to update publication: " + error.message };
    }
}

export async function deleteVolumeIssue(id: number) {
    try {
        return await db.transaction(async (tx) => {
            // 1. Unassign all papers first
            await tx.execute(
                sql`UPDATE submissions SET issue_id = NULL, status = 'paid' WHERE issue_id = ${id}`
            );

            // 2. Delete the issue
            await tx.execute(sql`DELETE FROM volumes_issues WHERE id = ${id}`);

            // Sync Modes
            await syncPublicationModes(tx);

            revalidatePath('/admin/publications');
            revalidatePath('/archives');
            revalidatePath('/current-issue');
            return { success: true };
        });
    } catch (error: any) {
        console.error("Delete Publication Error:", error);
        return { error: "Failed to delete publication: " + error.message };
    }
}
export async function retractPaper(submissionId: number, retractionNoticeUrl: string) {
    try {
        await db.execute(
            sql`UPDATE submissions SET status = 'retracted', retraction_notice_url = ${retractionNoticeUrl} WHERE id = ${submissionId}`
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
