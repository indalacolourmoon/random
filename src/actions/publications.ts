"use server";

import { db } from "@/lib/db";
import { 
    submissions, 
    volumesIssues,
    publications,
    submissionVersions
} from "@/db/schema";
import {
    ActionResponse, 
    Issue,
    Publication
} from "@/db/types";
import { eq, and, sql, desc, count } from "drizzle-orm";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getSettingsData } from "./settings";
import { sendEmail, emailTemplates } from "@/lib/mail";
import path from "path";
import fs from "fs/promises";
import { brandPdf } from "@/lib/pdf-branding";
import { getSubmissionById } from "./submissions";


/**
 * Create a new volume/issue
 */
export async function createVolumeIssue(formData: FormData): Promise<ActionResponse> {
    const volume = parseInt(formData.get('volume') as string);
    const issue = parseInt(formData.get('issue') as string);
    const year = parseInt(formData.get('year') as string);
    const monthRange = formData.get('monthRange') as string;

    try {
        // 1. Check for duplicates
        const existing = await db.select().from(volumesIssues).where(and(
            eq(volumesIssues.volumeNumber, volume),
            eq(volumesIssues.issueNumber, issue),
            eq(volumesIssues.year, year)
        )).limit(1);

        if (existing.length > 0) {
            return { success: false, error: "Volume/Issue already exists for this year." };
        }

        await db.insert(volumesIssues).values({
            volumeNumber: volume,
            issueNumber: issue,
            year: year,
            monthRange: monthRange,
            status: 'open'
        });
        revalidatePath('/admin/publications');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Create Publication Error:", error);
        return { success: false, error: "Failed to create publication: " + ((error as any)?.message || String(error)) };
    }
}

/**
 * Fetch all volumes and issues with paper counts
 */
export async function getVolumesIssues(): Promise<ActionResponse<(Issue & { paperCount: number })[]>> {
    return unstable_cache(
        async () => {
            try {
                const rows = await db.select({
                    vi: volumesIssues,
                    paperCount: count(submissions.id)
                })
                .from(volumesIssues)
                .leftJoin(submissions, eq(submissions.issueId, volumesIssues.id))
                .groupBy(volumesIssues.id)
                .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber));

                const data = rows.map(r => ({
                    ...r.vi,
                    paperCount: r.paperCount
                }));
                return { success: true, data };
            } catch (error) {
                console.error("Get Publications Error:", error);
                return { success: false, error: error instanceof Error ? error.message : String(error) };
            }
        },
        ['volumes-issues-list'],
        { tags: ['publications', 'public-data'], revalidate: 3600 }
    )();
}

/**
 * Get the latest published issue
 */
export async function getLatestPublishedIssue(): Promise<ActionResponse<Issue>> {
    return unstable_cache(
        async () => {
            try {
                const rows = await db.select()
                    .from(volumesIssues)
                    .where(eq(volumesIssues.status, 'published'))
                    .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber))
                    .limit(1);
                if (!rows[0]) return { success: false, error: "No published issues found" };
                return { success: true, data: rows[0] };
            } catch (error) {
                console.error("Get Latest Published Issue Error:", error);
                return { success: false, error: error instanceof Error ? error.message : String(error) };
            }
        },
        ['latest-published-issue'],
        { tags: ['publications', 'latest-issue', 'public-data'], revalidate: 3600 }
    )();
}

/**
 * Assign a paper to an issue, brand its PDF, and update its status to 'published'
 */
export async function assignPaperToIssue(submissionId: number, issueId: number, startPage?: number, endPage?: number): Promise<ActionResponse> {
    try {
        // 1. Fetch Composite Submission Details OUTSIDE transaction
        const subRes = await getSubmissionById(submissionId);
        if (!subRes.success || !subRes.data) {
            return { success: false, error: subRes.error || "Submission not found" };
        }
        const submission = subRes.data;

        // 2. Enforce status gate — only accepted/published papers can be assigned
        const allowedStatuses = ['accepted', 'published'];
        if (!allowedStatuses.includes(submission.status)) {
            return { success: false, error: `Paper status is '${submission.status}'. Only accepted papers can be published.` };
        }

        const latestPdf = submission.allFiles.find(f => f.fileType === 'pdf_version');
        if (!latestPdf) {
            return { success: false, error: "Final styled PDF must be uploaded before publication." };
        }

        // 3. Fetch Issue Details
        const issueRows = await db.select().from(volumesIssues).where(eq(volumesIssues.id, issueId)).limit(1);
        const issue = issueRows[0];
        if (!issue) return { success: false, error: "Issue not found" };

        const settings = await getSettingsData();

        // 4. Auto-Page Numbering Logic (outside transaction)
        let finalStartPage = startPage;
        let finalEndPage = endPage;

        if (finalStartPage === undefined || finalEndPage === undefined) {
            const [maxPageRow] = await db.select({
                lastPage: sql<number>`MAX(${publications.endPage})`
            }).from(publications).where(eq(publications.issueId, issueId));

            const lastPage = maxPageRow?.lastPage || 0;
            if (finalStartPage === undefined) finalStartPage = lastPage + 1;
            const startNum = finalStartPage as number;
            if (finalEndPage === undefined) {
                try {
                    const cleanPath = latestPdf.fileUrl.replace(/^\/+/, '');
                    const pdfPath = path.join(process.cwd(), 'public', cleanPath);
                    const pdfBytes = await fs.readFile(pdfPath);
                    const { PDFDocument } = await import('pdf-lib');
                    const pdfDoc = await PDFDocument.load(pdfBytes);
                    finalEndPage = startNum + pdfDoc.getPageCount() - 1;
                } catch (pdfErr) {
                    console.error("Failed to read PDF for page count:", pdfErr);
                    finalEndPage = startNum;
                }
            }
        }
        const confirmedStartPage = finalStartPage as number;
        const confirmedEndPage = finalEndPage as number;

        // 5. Generate Branded PDF OUTSIDE transaction (IO operation)
        const brandedFileName = `${submission.paperId}-published.pdf`;
        const brandedRelativePath = `/uploads/published/${brandedFileName}`;
        const cleanInput = latestPdf.fileUrl.replace(/^\/+/, '');

        await brandPdf(cleanInput, brandedRelativePath, {
            journalName: settings.journal_name || "IJITEST",
            journalShortName: "IJITEST",
            volume: issue.volumeNumber,
            issue: issue.issueNumber,
            year: issue.year,
            monthRange: issue.monthRange || "",
            issn: settings.issn_number || "XXXX-XXXX",
            website: settings.journal_website || "https://ijitest.org",
            paperId: submission.paperId,
            startPage: confirmedStartPage,
            endPage: confirmedEndPage
        });

        // 6. Database transaction — only pure DB ops
        await db.transaction(async (tx) => {
            await tx.insert(publications).values({
                submissionId,
                issueId,
                finalPdfUrl: brandedRelativePath,
                startPage: confirmedStartPage,
                endPage: confirmedEndPage,
                publishedAt: new Date()
            }).onDuplicateKeyUpdate({
                set: {
                    issueId,
                    finalPdfUrl: brandedRelativePath,
                    startPage: confirmedStartPage,
                    endPage: confirmedEndPage,
                    publishedAt: new Date()
                }
            });

            await tx.update(submissions)
                .set({ status: 'published', issueId })
                .where(eq(submissions.id, submissionId));
        });

        // 7. Email notification AFTER transaction (fire-and-forget)
        const template = emailTemplates.manuscriptPublished(
            submission.author_name,
            submission.title,
            submission.paperId,
            issue.volumeNumber,
            issue.issueNumber,
            issue.year
        );
        sendEmail({ to: submission.author_email, subject: template.subject, html: template.html })
            .catch(e => console.error("Publication email failed:", e));

        revalidatePath('/admin/submissions');
        revalidatePath('/admin/publications');
        revalidatePath('/archives');
        revalidatePath('/admin/submissions');
        revalidatePath('/admin/publications');
        revalidatePath('/archives', 'page');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Assign Paper Error:", error);
        return { success: false, error: "Failed to assign paper: " + ((error as any)?.message || String(error)) };
    }
}

export interface PaperWithPublication {
    id: number;
    paperId: string;
    title: string;
    status: string;
    publication: Publication | null;
}

/**
 * Publish an entire issue
 */
export async function publishIssue(id: number): Promise<ActionResponse> {
    try {
        await db.update(volumesIssues)
            .set({ status: 'published' })
            .where(eq(volumesIssues.id, id));

        revalidatePath('/admin/publications');
        revalidatePath('/archives');
        revalidatePath('/admin/publications');
        revalidatePath('/admin/submissions');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Publish Issue Error:", error);
        return { success: false, error: "Failed to publish issue: " + (error instanceof Error ? error.message : String(error)) };
    }
}

/**
 * Get papers assigned to a specific issue
 */
export async function getPapersByIssueId(issueId: number): Promise<ActionResponse<PaperWithPublication[]>> {
    try {
        // Return structured data for the issue listing
        const rows = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            publication: publications,
            latestVersion: submissionVersions
        })
        .from(submissions)
        .where(eq(submissions.issueId, issueId))
        .leftJoin(publications, eq(submissions.id, publications.submissionId))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            sql`${submissionVersions.versionNumber} = (SELECT MAX(v2.version_number) FROM submission_versions v2 WHERE v2.submission_id = ${submissions.id})`
        ));

        const data = rows.map(r => ({
            id: r.id,
            paperId: r.paperId,
            title: r.latestVersion?.title || "Untitled",
            status: r.status,
            publication: r.publication
        }));
        
        return { success: true, data };
    } catch (error) {
        console.error("Get Papers By Issue Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Unassign a paper from an issue
 */
export async function unassignPaperFromIssue(submissionId: number): Promise<ActionResponse> {
    try {
        await db.transaction(async (tx) => {
            await tx.delete(publications).where(eq(publications.submissionId, submissionId));
            await tx.update(submissions)
                .set({ issueId: null, status: 'accepted' })
                .where(eq(submissions.id, submissionId));
        });

        revalidatePath('/admin/publications');
        revalidatePath('/admin/submissions');
        revalidatePath('/admin/publications');
        revalidatePath('/admin/submissions');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to unassign paper: " + (error instanceof Error ? error.message : String(error)) };
    }
}

/**
 * Update an existing volume/issue
 */
export async function updateVolumeIssue(id: number, formData: FormData): Promise<ActionResponse> {
    const volume = parseInt(formData.get('volume') as string);
    const issue = parseInt(formData.get('issue') as string);
    const year = parseInt(formData.get('year') as string);
    const monthRange = formData.get('monthRange') as string;

    try {
        await db.update(volumesIssues)
            .set({
                volumeNumber: volume,
                issueNumber: issue,
                year: year,
                monthRange: monthRange
            })
            .where(eq(volumesIssues.id, id));
            
        revalidatePath('/admin/publications');
        return { success: true };
    } catch (error) {
        console.error("Update Publication Error:", error);
        return { success: false, error: "Failed to update: " + (error instanceof Error ? error.message : String(error)) };
    }
}

/**
 * Delete a volume/issue (unassigns papers first)
 */
export async function deleteVolumeIssue(id: number): Promise<ActionResponse> {
    try {
        return await db.transaction(async (tx) => {
            // 1. Unassign all papers
            await tx.delete(publications).where(eq(publications.issueId, id));
            await tx.update(submissions)
                .set({ issueId: null, status: 'accepted' })
                .where(eq(submissions.issueId, id));

            // 2. Delete issue
            await tx.delete(volumesIssues).where(eq(volumesIssues.id, id));

            return { success: true };
        });
    } catch (error) {
        return { success: false, error: "Failed to delete: " + (error instanceof Error ? error.message : String(error)) };
    } finally {
        revalidatePath('/admin/publications');
    }
}
