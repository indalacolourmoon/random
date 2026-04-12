"use server";

import { db } from "@/lib/db";
import { sql, eq, and, desc, inArray, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { sendEmail, emailTemplates } from "@/lib/mail";
import {
    reviewAssignments,
    reviews,
    submissions,
    submissionVersions,
    submissionFiles,
    submissionAuthors,
    users,
    userProfiles,
} from "@/db/schema";

import { convertDocxToPdf } from "@/lib/ilovepdf";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { ActionResponse } from "@/db/types";

/**
 * Assign a reviewer to a submission.
 * Enforces a strict limit of 6 reviewers per submission.
 */
export async function assignReviewer(formData: FormData): Promise<ActionResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
        return { success: false, error: "Unauthorized: Admin or Editor access required." };
    }
    
    const submissionId = parseInt(formData.get('submissionId') as string);
    const reviewerId = formData.get('reviewerId') as string;
    const deadline = formData.get('deadline') as string;
    const assignedBy = (session.user as any).id;
    const pdfFile = formData.get('pdfFile') as File;

    try {
        const txResult = await db.transaction(async (tx) => {
            // 1. Max 6 reviewers check (Total assignments for this submission)
            const [totalAssignments] = await tx.select({ value: count() })
                .from(reviewAssignments)
                .where(eq(reviewAssignments.submissionId, submissionId));
            
            if ((totalAssignments?.value || 0) >= 6) {
                return { success: false, error: "Maximum of 6 reviewers have already been assigned to this submission." };
            }

            // 2. Duplicate check
            const existing = await tx.select()
                .from(reviewAssignments)
                .where(and(
                    eq(reviewAssignments.submissionId, submissionId), 
                    eq(reviewAssignments.reviewerId, reviewerId)
                ));
            
            if (existing.length > 0) {
                return { success: false, error: "This reviewer is already assigned to this submission." };
            }

            // 3. Conflict of interest check (Same institution)
            const [reviewerProfile] = await tx.select({ institute: userProfiles.institute })
                .from(userProfiles)
                .where(eq(userProfiles.userId, reviewerId))
                .limit(1);
            
            const [leadAuthor] = await tx.select({ institution: submissionAuthors.institution })
                .from(submissionAuthors)
                .where(and(
                    eq(submissionAuthors.submissionId, submissionId), 
                    eq(submissionAuthors.isCorresponding, true)
                ))
                .limit(1);

            if (reviewerProfile?.institute && leadAuthor?.institution && 
                reviewerProfile.institute.toLowerCase() === leadAuthor.institution.toLowerCase()) {
                return { success: false, error: "Conflict of interest: Reviewer and Author belong to the same institution." };
            }

            // 4. Version Check
            const latestVersions = await tx.select()
                .from(submissionVersions)
                .where(eq(submissionVersions.submissionId, submissionId))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1);
            
            if (!latestVersions.length) return { success: false, error: "Submission version not found." };
            const version = latestVersions[0];

            // 5. PDF copy for reviewer
            let pdfUrl: string | null = null;
            const existingPdfs = await tx.select()
                .from(submissionFiles)
                .where(and(
                    eq(submissionFiles.versionId, version.id), 
                    eq(submissionFiles.fileType, 'pdf_version')
                ))
                .limit(1);

            if (pdfFile && pdfFile.size > 0) {
                const bytes = await pdfFile.arrayBuffer();
                const fileName = `reviewer_copy_${submissionId}_${Date.now()}.pdf`;
                const uploadPath = path.join(process.cwd(), "public/uploads/submissions", fileName);
                await fs.writeFile(uploadPath, Buffer.from(bytes));
                pdfUrl = `/uploads/submissions/${fileName}`;

                await tx.insert(submissionFiles).values({
                    versionId: version.id,
                    fileType: 'pdf_version',
                    fileUrl: pdfUrl,
                    originalName: 'reviewer_manuscript.pdf'
                });
            } else if (existingPdfs.length > 0) {
                pdfUrl = existingPdfs[0].fileUrl;
            } else {
                // Try to find the manuscript and ensure it's a PDF
                const manuscripts = await tx.select()
                    .from(submissionFiles)
                    .where(and(
                        eq(submissionFiles.versionId, version.id), 
                        eq(submissionFiles.fileType, 'main_manuscript')
                    ))
                    .limit(1);
                
                if (!manuscripts.length) return { success: false, error: "No manuscript file available." };
                const manuscript = manuscripts[0];

                if (manuscript.fileUrl.toLowerCase().endsWith('.pdf')) {
                    pdfUrl = manuscript.fileUrl;
                } else {
                    // Convert DOCX to PDF using iLovePDF
                    try {
                        const mPath = path.join(process.cwd(), "public", manuscript.fileUrl);
                        const mBuffer = await fs.readFile(mPath);
                        const pdfBuffer = await convertDocxToPdf(mBuffer, manuscript.originalName || "paper.docx");
                        
                        const fileName = `converted_${submissionId}_${Date.now()}.pdf`;
                        const uploadPath = path.join(process.cwd(), "public/uploads/submissions", fileName);
                        await fs.writeFile(uploadPath, pdfBuffer);
                        pdfUrl = `/uploads/submissions/${fileName}`;

                        await tx.insert(submissionFiles).values({
                            versionId: version.id,
                            fileType: 'pdf_version',
                            fileUrl: pdfUrl,
                            originalName: 'system_converted_pdf.pdf'
                        });
                    } catch (convErr: any) {
                        return { success: false, error: "PDF Conversion failed. Please upload a PDF manually." };
                    }
                }
            }

            // 6. Record Assignment — all reviewers in same batch share the same round
            const [roundRes] = await tx.select({ max: sql<number>`MAX(review_round)` })
                .from(reviewAssignments)
                .where(eq(reviewAssignments.submissionId, submissionId));
            const reviewRound = roundRes?.max || 1;

            const [newAssignment] = await tx.insert(reviewAssignments).values({
                submissionId,
                reviewerId,
                versionId: version.id,
                assignedBy,
                reviewRound,
                status: 'assigned',
                deadline: new Date(deadline),
                assignedAt: new Date(),
            }).$returningId();

            // 7. Update Submission Status
            await tx.update(submissions)
                .set({ status: 'under_review', updatedAt: new Date() })
                .where(eq(submissions.id, submissionId));

            // 8. Fetch notification data (no email inside transaction)
            const [staff] = await tx.select({ email: users.email, name: userProfiles.fullName })
                .from(users)
                .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
                .where(eq(users.id, reviewerId))
                .limit(1);

            const [paper] = await tx.select({ paperId: submissions.paperId, title: submissionVersions.title })
                .from(submissions)
                .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
                .where(eq(submissions.id, submissionId))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1);

            return { success: true, staff, paper };
        });

        // 9. Send email AFTER transaction commits (fire-and-forget)
        if (txResult.success && txResult.staff?.email && txResult.paper) {
            const template = emailTemplates.reviewAssignment(
                txResult.staff.name || "Reviewer",
                txResult.paper.title,
                deadline,
                txResult.paper.paperId
            );
            sendEmail({ to: txResult.staff.email, subject: template.subject, html: template.html })
                .catch(e => console.error("Reviewer assignment email failed:", e));
        }

        revalidatePath('/admin/reviews');
        return { success: true };
    } catch (error) {
        console.error("Assign Reviewer Error:", error);
        return { success: false, error: "Failed to assign reviewer: " + (error instanceof Error ? error.message : String(error)) };
    }
}

/**
 * Reviewer submits a completed review decision and comments.
 */
export async function submitReview(assignmentId: number, formData: FormData): Promise<ActionResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'reviewer') {
        return { success: false, error: "Unauthorized: Reviewer access required." };
    }

    const decision = formData.get('decision') as "accept" | "reject" | "minor_revision" | "major_revision";
    const commentsToAuthor = formData.get('commentsToAuthor') as string;
    const commentsToEditor = formData.get('commentsToEditor') as string;
    const score = formData.get('score') ? parseInt(formData.get('score') as string) : null;
    const confidence = formData.get('confidence') ? parseInt(formData.get('confidence') as string) : null;
    const feedbackFile = formData.get('feedbackFile') as File | null;

    try {
        let fileUrl: string | null = null;
        if (feedbackFile && feedbackFile.size > 0) {
            const bytes = await feedbackFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `feedback_${Date.now()}_${feedbackFile.name.replaceAll(' ', '_')}`;
            const uploadDir = path.join(process.cwd(), "public", "uploads", "submissions");
            await fs.mkdir(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, fileName);
            await fs.writeFile(filePath, buffer);
            fileUrl = `/uploads/submissions/${fileName}`;
        }

        const result = await db.transaction(async (tx) => {
            // 1. Get Assignment Details
            const rows = await tx.select({
                submissionId: reviewAssignments.submissionId,
                versionId: reviewAssignments.versionId,
                paperId: submissions.paperId,
                title: submissionVersions.title,
                authorEmail: users.email,
                authorName: userProfiles.fullName,
                reviewerId: reviewAssignments.reviewerId
            })
            .from(reviewAssignments)
            .innerJoin(submissions, eq(reviewAssignments.submissionId, submissions.id))
            .innerJoin(submissionVersions, eq(reviewAssignments.versionId, submissionVersions.id))
            .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .where(eq(reviewAssignments.id, assignmentId))
            .limit(1);

            if (!rows.length) throw new Error("Review assignment not found.");
            const info = rows[0];

            // Verify this reviewer owns the assignment
            if (info.reviewerId !== session.user.id) {
                throw new Error("Unauthorized: This assignment does not belong to you.");
            }

            // 2. Insert/Update Review
            await tx.insert(reviews).values({
                assignmentId,
                decision,
                score,
                confidence,
                commentsToAuthor,
                commentsToEditor,
                submittedAt: new Date()
            }).onDuplicateKeyUpdate({
                set: {
                    decision,
                    score,
                    confidence,
                    commentsToAuthor,
                    commentsToEditor,
                    submittedAt: new Date()
                }
            });

            // 3. Update Assignment Status
            await tx.update(reviewAssignments)
                .set({ status: 'completed', respondedAt: new Date() })
                .where(eq(reviewAssignments.id, assignmentId));

            // 4. Handle Feedback File if exists
            if (fileUrl) {
                await tx.insert(submissionFiles).values({
                    versionId: info.versionId,
                    fileType: 'feedback',
                    fileUrl,
                    originalName: feedbackFile?.name || 'feedback.pdf',
                    fileSize: feedbackFile?.size || 0
                });
            }

            // 5. Submission Status Update (Optional: specific to project workflow)
            const statusMap: Record<string, "revision_requested" | "rejected"> = {
                minor_revision: 'revision_requested',
                major_revision: 'revision_requested',
                reject: 'rejected'
            };
            const newStatus = statusMap[decision as string];
            if (newStatus) {
                await tx.update(submissions).set({ status: newStatus as any }).where(eq(submissions.id, info.submissionId));
            }

            return { success: true, info };
        });

        // 6. Asynchronous Notifications (Outside Transaction)
        if (result.success && result.info) {
            const { info } = result;
            if (decision === 'accept') {
                const admins = await db.select({ email: users.email }).from(users).where(inArray(users.role, ['admin', 'editor']));
                Promise.allSettled(admins.map(a => sendEmail({
                    to: a.email,
                    subject: `Review Decision (Accept): ${info.paperId}`,
                    html: `<p>A reviewer has recommended 'Accept' for paper ${info.paperId}.</p>`
                })));
            } else {
                const statusMap: Record<string, "revision_requested" | "rejected"> = {
                    minor_revision: 'revision_requested',
                    major_revision: 'revision_requested',
                    reject: 'rejected'
                };
                const newStatus = statusMap[decision as string];
                if (newStatus) {
                    const template = newStatus === 'rejected' 
                        ? emailTemplates.manuscriptRejection(info.authorName || "Author", info.title || "Untitled Manuscript", info.paperId, commentsToAuthor || "")
                        : emailTemplates.resubmissionRequest(info.authorName || "Author", info.title || "Untitled Manuscript", info.paperId, commentsToAuthor || "");
                    
                    sendEmail({ to: info.authorEmail, subject: template.subject, html: template.html }).catch(err => console.error("Email Error:", err));
                }
            }
        }

        revalidatePath('/admin/reviews');
        revalidatePath('/reviewer/reviews');
        return { success: true };

    } catch (error) {
        console.error("Submit Review Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Fetch all review assignments with joined submission data.
 */
export async function getActiveReviews(reviewerId?: string): Promise<ActionResponse<any[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Authentication required." };

        // If a specific reviewer is requested, ensure requester is admin/editor OR the reviewer themselves
        if (reviewerId && session.user.role !== 'admin' && session.user.role !== 'editor' && session.user.id !== reviewerId) {
            return { success: false, error: "Unauthorized" };
        }
        const query = db.select({
            id: reviewAssignments.id,
            status: reviewAssignments.status,
            assignedAt: reviewAssignments.assignedAt,
            deadline: reviewAssignments.deadline,
            reviewRound: reviewAssignments.reviewRound,
            submissionId: reviewAssignments.submissionId,
            paperId: submissions.paperId,
            submissionStatus: submissions.status,
            title: submissionVersions.title,
            reviewerName: userProfiles.fullName,
            decision: reviews.decision,
            commentsToAuthor: reviews.commentsToAuthor,
            submittedAt: reviews.submittedAt,
            manuscriptPath: sql<string>`(SELECT f.file_url FROM submission_files f WHERE f.version_id = ${reviewAssignments.versionId} AND f.file_type = 'pdf_version' LIMIT 1)`,
            feedbackFilePath: sql<string>`(SELECT f.file_url FROM submission_files f WHERE f.version_id = ${reviewAssignments.versionId} AND f.file_type = 'feedback' LIMIT 1)`
        })
        .from(reviewAssignments)
        .innerJoin(submissions, eq(reviewAssignments.submissionId, submissions.id))
        .innerJoin(submissionVersions, eq(reviewAssignments.versionId, submissionVersions.id))
        .leftJoin(userProfiles, eq(reviewAssignments.reviewerId, userProfiles.userId))
        .leftJoin(reviews, eq(reviewAssignments.id, reviews.assignmentId))
        .orderBy(desc(reviewAssignments.assignedAt));

        const rows = reviewerId ? await query.where(eq(reviewAssignments.reviewerId, reviewerId)) : await query;
        return { success: true, data: rows };
    } catch (error) {
        console.error("Get Reviews Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Get papers that are ready to be assigned to reviewers.
 */
export async function getUnassignedAcceptedPapers(): Promise<ActionResponse<any[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

       // Papers that are in stages that require review
       const rows = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            title: submissionVersions.title,
            pdfUrl: sql<string>`(SELECT f.file_url FROM submission_files f WHERE f.version_id = ${submissionVersions.id} AND f.file_type = 'pdf_version' LIMIT 1)`
       })
       .from(submissions)
       .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
       .where(and(
           inArray(submissions.status, ['submitted', 'editor_assigned', 'under_review', 'revision_requested']),
           sql`${submissionVersions.versionNumber} = (SELECT MAX(v2.version_number) FROM submission_versions v2 WHERE v2.submission_id = ${submissions.id})`
       ));

        return { success: true, data: rows };
    } catch (error) {
        console.error("Get Unassigned Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
