"use server";

import { db } from "@/lib/db";
import {
    submissions,
    submissionVersions,
    submissionFiles,
    submissionAuthors,
    users,
    userProfiles,
    payments,
    reviews,
    reviewAssignments,
    settings,
    volumesIssues,
    publications,
} from "@/db/schema";
import { 
    SubmissionDetail, 
    SubmissionUI,
    ActionResponse, 
    UserWithProfile,
    SubmissionFile,
    ReviewWithReviewer,
} from "@/db/types";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";
import fs from 'fs/promises';
import path from 'path';
import { eq, desc, and, isNull } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Fetch a unified submission object with all related data joined.
 * Resolves the structural mismatches between the legacy "flat" schema and the new normalized schema.
 */
export async function getSubmissionById(id: number): Promise<ActionResponse<SubmissionUI>> {
    try {
        // 1. Fetch Core Submission + Profile + Latest Version + Publication + Issue
        const submissionRows = await db.select({
            submission: submissions,
            author: users,
            authorProfile: userProfiles,
            issue: volumesIssues,
            publication: publications,
            payment: payments
        })
        .from(submissions)
        .where(and(eq(submissions.id, id), isNull(submissions.deletedAt)))
        .leftJoin(users, eq(submissions.correspondingAuthorId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .leftJoin(volumesIssues, eq(submissions.issueId, volumesIssues.id))
        .leftJoin(publications, eq(submissions.id, publications.submissionId))
        .leftJoin(payments, eq(submissions.id, payments.submissionId))
        .limit(1);

        const row = submissionRows[0];
        if (!row) return { success: false, error: "Submission not found" };

        // 2. Fetch Latest Version
        const versionRows = await db.select()
            .from(submissionVersions)
            .where(eq(submissionVersions.submissionId, id))
            .orderBy(desc(submissionVersions.versionNumber))
            .limit(1);
        
        const latestVersion = versionRows[0];

        // 3. Fetch Authors (Co-authors)
        const authors = await db.select()
            .from(submissionAuthors)
            .where(eq(submissionAuthors.submissionId, id))
            .orderBy(submissionAuthors.orderIndex);

        // 4. Fetch Review Assignments with Reviewer Profiles and Decisions
        const assignments = await db.select({
            ra: reviewAssignments,
            reviewer: users,
            profile: userProfiles,
            review: reviews
        })
        .from(reviewAssignments)
        .where(eq(reviewAssignments.submissionId, id))
        .leftJoin(users, eq(reviewAssignments.reviewerId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .leftJoin(reviews, eq(reviewAssignments.id, reviews.assignmentId));

        // 5. Fetch Files for the Latest Version
        const files = latestVersion 
            ? await db.select().from(submissionFiles).where(eq(submissionFiles.versionId, latestVersion.id)) 
            : [];

        // 6. Map to Domain Types
        const typedAssignments: ReviewWithReviewer[] = assignments.map(a => ({
            ...a.ra,
            reviewer: { ...a.reviewer, profile: a.profile } as UserWithProfile,
            review: a.review
        }));

        const submissionData: SubmissionDetail = {
            ...row.submission,
            correspondingAuthor: { ...row.author, profile: row.authorProfile } as UserWithProfile,
            versions: latestVersion ? [{ ...latestVersion, files: files as SubmissionFile[] }] : [],
            authors,
            payment: row.payment,
            reviewAssignments: typedAssignments,
            issue: row.issue,
            publication: row.publication
        };

        // 7. Map to UI-Friendly Composite Object (Flat properties for historical compatibility)
        const mainManuscript = files.find(f => f.fileType === 'main_manuscript');
        const pdfVersion = files.find(f => f.fileType === 'pdf_version');
        const finalPdf = row.publication?.finalPdfUrl;

        const data: SubmissionUI = {
            ...submissionData,
            paper_id: submissionData.paperId,
            submitted_at: submissionData.submittedAt,
            updated_at: submissionData.updatedAt,
            title: latestVersion?.title || "Untitled Manuscript",
            abstract: latestVersion?.abstract || "",
            keywords: latestVersion?.keywords || "",
            file_path: mainManuscript?.fileUrl || "",
            pdf_url: finalPdf || pdfVersion?.fileUrl || "", // Priority: Published PDF > Review PDF
            author_name: submissionData.correspondingAuthor?.profile?.fullName || "Unknown Author",
            author_email: submissionData.correspondingAuthor?.email || "",
            co_authors: JSON.stringify(submissionData.authors.map(a => ({
                name: a.name, email: a.email, institution: a.institution
            }))),
            volume_number: submissionData.issue?.volumeNumber,
            issue_number: submissionData.issue?.issueNumber,
            start_page: submissionData.publication?.startPage,
            end_page: submissionData.publication?.endPage,
            issue_id: submissionData.issueId,
            latestVersion: latestVersion ? { ...latestVersion, files: files as SubmissionFile[] } : undefined,
            allFiles: files as SubmissionFile[],
            allReviews: typedAssignments,
        };

        return { success: true, data };
    } catch (error) {
        console.error("Get Submission Detail Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Fetch all submissions formatted for Admin/Editor listing
 */
export async function getAllSubmissions(filters?: { status?: string }): Promise<ActionResponse<SubmissionUI[]>> {
    try {
        let query = db.select({ id: submissions.id }).from(submissions).$dynamic();
        
        const conditions = [isNull(submissions.deletedAt)];
        if (filters?.status && filters.status !== 'all') {
            conditions.push(eq(submissions.status, filters.status as typeof submissions.$inferSelect.status));
        }
        
        query = query.where(and(...conditions)).orderBy(desc(submissions.submittedAt));

        const ids = await query;
        const results = await Promise.all(ids.map(async s => {
            const res = await getSubmissionById(s.id);
            return res.success ? res.data : null;
        }));
        
        const data = results.filter((s): s is SubmissionUI => s !== null);
        return { success: true, data };
    } catch (error) {
        console.error("Get All Submissions Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Admin/Editor: Final accept/reject decision
 */
export async function decideSubmission(id: number, decision: 'accepted' | 'rejected'): Promise<ActionResponse> {
    try {
        const subRes = await getSubmissionById(id);
        if (!subRes.success || !subRes.data) return { success: false, error: subRes.error || "Submission not found" };
        const submission = subRes.data;

        const apcRows = await db.select().from(settings).where(eq(settings.settingKey, 'apc_inr')).limit(1);
        const apcAmount = apcRows[0]?.settingValue || '0';
        const apcCurrency = 'INR';

        await db.transaction(async (tx) => {
            const status = decision === 'accepted' ? 'accepted' : 'rejected';
            await tx.update(submissions).set({ status }).where(eq(submissions.id, id));

            if (decision === 'accepted' && parseFloat(apcAmount) > 0) {
                // Prepare payment record if not zero charge
                await tx.insert(payments).values({
                    submissionId: id,
                    amount: Number(apcAmount).toFixed(2), // Fixed-point formatting for decimal column
                    currency: apcCurrency,
                    status: 'pending'
                }).onDuplicateKeyUpdate({ set: { status: 'pending' } });
            }

            const isFree = parseFloat(apcAmount) === 0;

            const template = decision === 'accepted' 
                ? emailTemplates.manuscriptAcceptance(submission.author_name, submission.title, submission.paperId, isFree)
                : emailTemplates.manuscriptRejection(submission.author_name, submission.title, submission.paperId, "Does not meet editorial criteria.");

            await sendEmail({ to: submission.author_email, subject: template.subject, html: template.html });
        });

        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${id}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to finalize decision: " + (error instanceof Error ? error.message : String(error)) };
    }
}

/**
 * Update submission status and notify author
 */
export async function updateSubmissionStatus(id: number, status: typeof submissions.$inferSelect.status): Promise<ActionResponse> {
    try {
        await db.update(submissions).set({ status }).where(eq(submissions.id, id));

        const subRes = await getSubmissionById(id);
        if (subRes.success && subRes.data) {
            const submission = subRes.data;
            const apcRows = await db.select().from(settings).where(eq(settings.settingKey, 'apc_inr')).limit(1);
            const isFree = (apcRows[0]?.settingValue || '0') === '0';

            const template = emailTemplates.statusUpdate(
                submission.author_name, 
                submission.title, 
                status, 
                submission.paperId,
                isFree
            );
            await sendEmail({ to: submission.author_email, subject: template.subject, html: template.html });
        }

        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${id}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update status: " + (error instanceof Error ? error.message : String(error)) };
    }
}

/**
 * Request resubmission WITH comments
 */
export async function requestResubmissionWithComments(
    submissionId: number,
    comments: string,
    requestedBy: string
): Promise<ActionResponse> {
    try {
        const subRes = await getSubmissionById(submissionId);
        if (!subRes.success || !subRes.data) return { success: false, error: subRes.error || 'Submission not found' };
        const submission = subRes.data;

        await db.update(submissions)
            .set({ status: 'revision_requested' })
            .where(eq(submissions.id, submissionId));

        const emailData = emailTemplates.resubmissionRequest(
            submission.author_name,
            submission.title,
            submission.paperId,
            comments
        );
        await sendEmail({ to: submission.author_email, subject: emailData.subject, html: emailData.html });

        revalidatePath(`/admin/submissions/${submissionId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Permanent Delete (Full Cleanup)
 */
export async function deleteSubmission(id: number): Promise<ActionResponse> {
    try {
        const subRes = await getSubmissionById(id);
        if (!subRes.success || !subRes.data) return { success: false, error: subRes.error || "Submission not found" };
        const submission = subRes.data;

        // 1. Database cleanup
        await db.transaction(async (tx) => {
            // Cascade should handle versions, files, and authors, but we do it manually for extra safety
            await tx.delete(submissionAuthors).where(eq(submissionAuthors.submissionId, id));
            await tx.delete(payments).where(eq(payments.submissionId, id));
            await tx.delete(reviewAssignments).where(eq(reviewAssignments.submissionId, id));
            await tx.delete(submissions).where(eq(submissions.id, id));
        });

        // 2. File system cleanup
        for (const file of submission.allFiles) {
            try {
                // Normalize file path to avoid double slashes
                const normalizedPath = file.fileUrl.replace(/^\/+/, '');
                await fs.unlink(path.join(process.cwd(), 'public', normalizedPath));
            } catch (err) { 
                console.error(`Failed to delete file ${file.fileUrl}:`, err);
            }
        }

        revalidatePath('/admin/submissions');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete: " + (error instanceof Error ? error.message : String(error)) };
    }
}

/**
 * Admin/Editor: Upload a finalized PDF version of the manuscript
 */
export async function uploadManuscriptPdf(submissionId: number, formData: FormData): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const pdfFile = formData.get("pdfFile") as File;
        if (!pdfFile || pdfFile.size === 0) return { success: false, error: "PDF file is required." };

        // MIME Validation
        if (pdfFile.type !== 'application/pdf' && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
            return { success: false, error: "Invalid file type. Only PDF files are allowed for the finalized manuscript." };
        }

        // 1. Get Latest Version
        const versionRows = await db.select()
            .from(submissionVersions)
            .where(eq(submissionVersions.submissionId, submissionId))
            .orderBy(desc(submissionVersions.versionNumber))
            .limit(1);
        
        if (!versionRows.length) return { success: false, error: "No version records found for this submission." };
        const latestVersion = versionRows[0];

        // 2. Prepare File Path
        const timestamp = Date.now();
        const fileName = `final_manuscript_${submissionId}_v${latestVersion.versionNumber}_${timestamp}.pdf`;
        const fileUrl = `/uploads/submissions/${fileName}`;
        const uploadDir = path.join(process.cwd(), "public/uploads/submissions");

        // 3. Database Update (Insert File Record)
        await db.transaction(async (tx) => {
            // Check if a PDF version already exists for this version
            const existing = await tx.select().from(submissionFiles).where(and(
                eq(submissionFiles.versionId, latestVersion.id),
                eq(submissionFiles.fileType, 'pdf_version')
            )).limit(1);

            if (existing.length > 0) {
                await tx.delete(submissionFiles).where(eq(submissionFiles.id, existing[0].id));
            }

            await tx.insert(submissionFiles).values({
                versionId: latestVersion.id,
                fileType: 'pdf_version',
                fileUrl: fileUrl,
                originalName: pdfFile.name,
                fileSize: pdfFile.size
            });

            await tx.update(submissions).set({ updatedAt: new Date() }).where(eq(submissions.id, submissionId));
        });

        // 4. File System Operation
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(await pdfFile.arrayBuffer()));

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath('/admin/submissions');
        
        return { success: true };
    } catch (error) {
        console.error("Upload PDF Error:", error);
        return { success: false, error: "Failed to upload PDF: " + (error instanceof Error ? error.message : String(error)) };
    }
}
