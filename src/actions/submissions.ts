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
    reviewAssignments
} from "@/db/schema";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";
import fs from 'fs/promises';
import path from 'path';
import { eq, desc, and } from "drizzle-orm";

export async function getSubmissionById(id: number) {
    try {
        const result = await db.query.submissions.findFirst({
            where: eq(submissions.id, id),
            with: {
                correspondingAuthor: {
                    with: {
                        profile: true
                    }
                },
                versions: {
                    orderBy: [desc(submissionVersions.versionNumber)],
                    limit: 1,
                    with: {
                        files: true
                    }
                },
                authors: true,
                payment: true,
                reviewAssignments: {
                    with: {
                        reviewer: {
                            with: {
                                profile: true
                            }
                        }
                    }
                },
                issue: true,
                publication: true
            }
        });

        if (!result) return null;

        const latestVersion = result.versions?.[0];
        const files = latestVersion?.files || [];

        const mainManuscript = files.find(f => f.fileType === 'main_manuscript');
        const pdfVersion = files.find(f => f.fileType === 'pdf_version');

        return {
            ...result,
            // Mapping for UI compatibility (Snake Case)
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

            // Relational Flattening for UI
            co_authors: JSON.stringify(result.authors.map(a => ({
                name: a.name,
                email: a.email,
                phone: a.phone,
                designation: a.designation,
                institution: a.institution
            }))),
            volume_number: result.issue?.volumeNumber,
            issue_number: result.issue?.issueNumber,
            start_page: result.publication?.startPage,
            end_page: result.publication?.endPage,
            issue_id: result.issueId,

            // Additional structure
            latestVersion,
            allFiles: files,
            allReviews: result.reviewAssignments || []
        };
    } catch (error: any) {
        console.error("Get Submission Detail Error:", error);
        return null;
    }
}

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
            await db.update(submissionFiles)
                .set({ fileUrl: pdfUrl })
                .where(eq(submissionFiles.id, existingPdf.id));
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
        console.error("Update PDF Error:", error);
        return { error: error.message };
    }
}

export async function decideSubmission(id: number, decision: 'accepted' | 'rejected') {
    try {
        const submission = await getSubmissionById(id);
        if (!submission) return { error: "Submission not found" };

        await db.transaction(async (tx) => {
            if (decision === 'accepted') {
                await tx.update(submissions)
                    .set({ status: 'accepted' })
                    .where(eq(submissions.id, id));

                await tx.insert(payments).values({
                    submissionId: id,
                    amount: "2500.00",
                    currency: 'INR',
                    status: 'pending'
                }).onDuplicateKeyUpdate({
                    set: { status: 'pending' }
                });

                const template = emailTemplates.manuscriptAcceptance(
                    submission.author_name,
                    submission.title,
                    submission.paperId
                );

                await sendEmail({
                    to: submission.author_email,
                    subject: template.subject,
                    html: template.html
                });
            } else {
                await tx.update(submissions)
                    .set({ status: 'rejected' })
                    .where(eq(submissions.id, id));

                const template = emailTemplates.manuscriptRejection(
                    submission.author_name,
                    submission.title,
                    submission.paperId,
                    "Editorial Board Decision: Does not meet current session criteria."
                );

                await sendEmail({
                    to: submission.author_email,
                    subject: template.subject,
                    html: template.html
                });
            }
        });

        revalidatePath('/editor/submissions');
        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Decision Workflow Error:", error);
        return { error: "Failed to finalize decision: " + error.message };
    }
}

export async function updateSubmissionStatus(id: number, status: any) {
    try {
        await db.update(submissions)
            .set({ status })
            .where(eq(submissions.id, id));

        const submission = await getSubmissionById(id);
        if (submission) {
            const template = emailTemplates.statusUpdate(
                submission.author_name,
                submission.title,
                status,
                submission.paperId
            );
            await sendEmail({
                to: submission.author_email,
                subject: template.subject,
                html: template.html
            });
        }

        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Update Status Error:", error);
        return { error: "Failed to update status: " + error.message };
    }
}

export async function uploadManuscriptPdf(submissionId: number, formData: FormData) {
    try {
        const file = formData.get("pdfFile") as File;
        if (!file || file.size === 0) return { error: "No PDF file selected." };

        const submission = await db.query.submissions.findFirst({
            where: eq(submissions.id, submissionId),
            with: {
                versions: {
                    orderBy: [desc(submissionVersions.versionNumber)],
                    limit: 1
                }
            }
        });

        if (!submission || !submission.versions?.[0]) return { error: "Version context not found." };

        const versionId = submission.versions[0].id;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `final-manuscript-${submissionId}-${Date.now()}.pdf`;
        const uploadDir = path.join(process.cwd(), "public/uploads/submissions");
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);
        const relativePath = `/uploads/submissions/${fileName}`;

        await db.insert(submissionFiles).values({
            versionId,
            fileType: 'pdf_version',
            fileUrl: relativePath,
            originalName: file.name,
            fileSize: file.size
        });

        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${submissionId}`);
        return { success: true, url: relativePath };
    } catch (error: any) {
        console.error("Upload PDF Error:", error);
        return { error: "Failed to upload: " + error.message };
    }
}

export async function deleteSubmissionPermanently(id: number) {
    try {
        const submission = await db.query.submissions.findFirst({
            where: eq(submissions.id, id),
            with: {
                versions: {
                    limit: 1,
                    with: {
                        files: true
                    }
                }
            }
        });

        if (!submission) return { error: "Submission not found" };

        const versionId = submission.versions?.[0]?.id;

        // 1. Physical File Cleanup
        if (versionId) {
            const allFiles = await db.select().from(submissionFiles).where(
                eq(submissionFiles.versionId, versionId)
            );

            for (const file of allFiles) {
                try {
                    const fullPath = path.join(process.cwd(), 'public', file.fileUrl);
                    await fs.unlink(fullPath);
                } catch (e) { /* Ignore file not found */ }
            }
        }

        // 2. Database Cleanup (Cascading if DB supports, or manual)
        await db.transaction(async (tx) => {
            // Delete co-authors
            await tx.delete(submissionAuthors).where(eq(submissionAuthors.submissionId, id));
            // Delete payments
            await tx.delete(payments).where(eq(payments.submissionId, id));
            // Delete reviews & assignments
            await tx.delete(reviewAssignments).where(eq(reviewAssignments.submissionId, id));
            // Versions and Files will cascade delete if schema is configured with references
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
