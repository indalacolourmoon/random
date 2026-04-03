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
} from "@/db/schema";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";
import fs from 'fs/promises';
import path from 'path';
import { eq, desc, and, inArray } from "drizzle-orm";

// ─── Helper: get APC from settings ────────────────────────────────────────────
async function getApcAmount(): Promise<{ amount: string; currency: string }> {
    try {
        const rows = await db.select().from(settings)
            .where(eq(settings.settingKey, 'apc_inr'));
        const amount = rows[0]?.settingValue || '0';
        return { amount, currency: 'INR' };
    } catch {
        return { amount: '0', currency: 'INR' };
    }
}

// ─── Get full submission detail ────────────────────────────────────────────────
export async function getSubmissionById(id: number) {
    try {
        const result = await db.query.submissions.findFirst({
            where: eq(submissions.id, id),
            with: {
                correspondingAuthor: { with: { profile: true } },
                versions: {
                    orderBy: [desc(submissionVersions.versionNumber)],
                    limit: 1,
                    with: { files: true }
                },
                authors: true,
                payment: true,
                reviewAssignments: {
                    with: {
                        reviewer: { with: { profile: true } },
                        review: true,
                    }
                },
                issue: true,
                publication: true
            }
        });

        if (!result) return null;

        const latestVersion = result.versions?.[0];
        const files = latestVersion?.files || [];
        const mainManuscript = files.find((f: any) => f.fileType === 'main_manuscript');
        const pdfVersion = files.find((f: any) => f.fileType === 'pdf_version');

        return {
            ...result,
            paper_id: result.paperId,
            submitted_at: result.submittedAt,
            updated_at: result.updatedAt,
            title: latestVersion?.title || "Untitled",
            abstract: latestVersion?.abstract || "",
            keywords: latestVersion?.keywords || "",
            file_path: mainManuscript?.fileUrl || "",
            pdf_url: pdfVersion?.fileUrl || "",
            author_name: result.correspondingAuthor?.profile?.fullName || "Unknown Author",
            author_email: result.correspondingAuthor?.email || "",
            co_authors: JSON.stringify(result.authors.map((a: any) => ({
                name: a.name, email: a.email, phone: a.phone,
                designation: a.designation, institution: a.institution
            }))),
            volume_number: result.issue?.volumeNumber,
            issue_number: result.issue?.issueNumber,
            start_page: result.publication?.startPage,
            end_page: result.publication?.endPage,
            issue_id: result.issueId,
            latestVersion,
            allFiles: files,
            allReviews: result.reviewAssignments || [],
        };
    } catch (error: any) {
        console.error("Get Submission Detail Error:", error);
        return null;
    }
}

// ─── Update PDF URL ────────────────────────────────────────────────────────────
export async function updateSubmissionPdfUrl(submissionId: number, pdfUrl: string) {
    try {
        const latestVersion = await db.query.submissionVersions.findFirst({
            where: eq(submissionVersions.submissionId, submissionId),
            orderBy: [desc(submissionVersions.versionNumber)]
        });
        if (!latestVersion) throw new Error("No version context found.");

        const existingPdf = await db.query.submissionFiles.findFirst({
            where: and(
                eq(submissionFiles.versionId, latestVersion.id),
                eq(submissionFiles.fileType, 'pdf_version')
            )
        });

        if (existingPdf) {
            await db.update(submissionFiles).set({ fileUrl: pdfUrl }).where(eq(submissionFiles.id, existingPdf.id));
        } else {
            await db.insert(submissionFiles).values({
                versionId: latestVersion.id,
                fileType: 'pdf_version',
                fileUrl: pdfUrl,
                originalName: 'final-manuscript.pdf'
            });
        }

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath(`/editor/submissions/${submissionId}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

// ─── Admin/Editor: Final accept/reject decision ─────────────────────────────
export async function decideSubmission(id: number, decision: 'accepted' | 'rejected') {
    try {
        const submission = await getSubmissionById(id);
        if (!submission) return { error: "Submission not found" };

        const { amount: apcAmount, currency: apcCurrency } = await getApcAmount();
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com';

        await db.transaction(async (tx: any) => {
            if (decision === 'accepted') {
                await tx.update(submissions).set({ status: 'accepted' }).where(eq(submissions.id, id));

                // Only create payment record if APC > 0
                if (parseFloat(apcAmount) > 0) {
                    await tx.insert(payments).values({
                        submissionId: id,
                        amount: apcAmount,
                        currency: apcCurrency,
                        status: 'pending'
                    }).onDuplicateKeyUpdate({ set: { status: 'pending' } });
                }

                const template = emailTemplates.manuscriptAcceptance(
                    submission.author_name,
                    submission.title,
                    submission.paperId
                );
                await sendEmail({ to: submission.author_email, subject: template.subject, html: template.html });
            } else {
                await tx.update(submissions).set({ status: 'rejected' }).where(eq(submissions.id, id));

                const template = emailTemplates.manuscriptRejection(
                    submission.author_name,
                    submission.title,
                    submission.paperId,
                    "Editorial Board Decision: Does not meet current session criteria."
                );
                await sendEmail({ to: submission.author_email, subject: template.subject, html: template.html });
            }
        });

        revalidatePath('/editor/submissions');
        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${id}`);
        return { success: true };
    } catch (error: any) {
        return { error: "Failed to finalize decision: " + error.message };
    }
}

// ─── Update status + email ─────────────────────────────────────────────────────
export async function updateSubmissionStatus(id: number, status: any) {
    try {
        await db.update(submissions).set({ status }).where(eq(submissions.id, id));

        const submission = await getSubmissionById(id);
        if (submission) {
            const template = emailTemplates.statusUpdate(submission.author_name, submission.title, status, submission.paperId);
            await sendEmail({ to: submission.author_email, subject: template.subject, html: template.html });
        }

        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${id}`);
        return { success: true };
    } catch (error: any) {
        return { error: "Failed to update status: " + error.message };
    }
}

// ─── Upload manuscript PDF ─────────────────────────────────────────────────────
export async function uploadManuscriptPdf(submissionId: number, formData: FormData) {
    try {
        const file = formData.get("pdfFile") as File;
        if (!file || file.size === 0) return { error: "No PDF file selected." };

        const submission = await db.query.submissions.findFirst({
            where: eq(submissions.id, submissionId),
            with: { versions: { orderBy: [desc(submissionVersions.versionNumber)], limit: 1 } }
        });

        if (!submission || !submission.versions?.[0]) return { error: "Version context not found." };

        const versionId = submission.versions[0].id;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `final-manuscript-${submissionId}-${Date.now()}.pdf`;
        const uploadDir = path.join(process.cwd(), "public/uploads/submissions");
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, fileName), buffer);
        const relativePath = `/uploads/submissions/${fileName}`;

        await db.insert(submissionFiles).values({
            versionId, fileType: 'pdf_version', fileUrl: relativePath,
            originalName: file.name, fileSize: file.size
        });

        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${submissionId}`);
        return { success: true, url: relativePath };
    } catch (error: any) {
        return { error: "Failed to upload: " + error.message };
    }
}

// ─── Admin/Editor: Request resubmission WITH comments ─────────────────────────
export async function requestResubmissionWithComments(
    submissionId: number,
    comments: string,
    requestedBy: string
) {
    try {
        const submission = await getSubmissionById(submissionId);
        if (!submission) return { error: 'Submission not found' };

        await db.update(submissions)
            .set({ status: 'revision_requested', decisionBy: requestedBy })
            .where(eq(submissions.id, submissionId));

        const emailData = emailTemplates.resubmissionRequest(
            submission.author_name,
            submission.title,
            submission.paperId,
            comments
        );
        await sendEmail({ to: submission.author_email, subject: emailData.subject, html: emailData.html });

        // Notify all staff
        const staffUsers = await db.select({ email: users.email })
            .from(users)
            .where(inArray(users.role, ['admin', 'editor']));

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com';
        await Promise.allSettled(staffUsers.map((s: { email: string }) => sendEmail({
            to: s.email,
            subject: `Resubmission Requested: ${submission.paperId}`,
            html: `<p>Resubmission was requested for <strong>${submission.paperId}</strong> by ${requestedBy}.<br>
                   Comments: ${comments}<br>
                   <a href="${baseUrl}/admin/submissions/${submissionId}">View Submission</a></p>`
        })));

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath(`/editor/submissions/${submissionId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Request Resubmission Error:', error);
        return { error: error.message };
    }
}

// ─── Delete submission (full cleanup) ─────────────────────────────────────────
export async function deleteSubmission(id: number) {
    try {
        const submission = await db.query.submissions.findFirst({
            where: eq(submissions.id, id),
            with: { versions: { limit: 1, with: { files: true } } }
        });

        if (!submission) return { error: "Submission not found" };

        const versionId = submission.versions?.[0]?.id;

        // 1. Physical file cleanup
        if (versionId) {
            const allFiles = await db.select().from(submissionFiles)
                .where(eq(submissionFiles.versionId, versionId));
            for (const file of allFiles) {
                try {
                    await fs.unlink(path.join(process.cwd(), 'public', file.fileUrl));
                } catch { /* ignore missing files */ }
            }
        }

        // 2. Database cleanup (children first, then parent)
        await db.transaction(async (tx: any) => {
            await tx.delete(submissionAuthors).where(eq(submissionAuthors.submissionId, id));
            await tx.delete(payments).where(eq(payments.submissionId, id));
            await tx.delete(reviewAssignments).where(eq(reviewAssignments.submissionId, id));
            await tx.delete(submissions).where(eq(submissions.id, id));
        });

        revalidatePath('/admin/submissions');
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Permanent Delete Error:", error);
        return { error: "Failed to delete: " + error.message };
    }
}
