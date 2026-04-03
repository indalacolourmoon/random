"use server";

import { db } from "@/lib/db";
import { sql, eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { sendEmail, emailTemplates } from "@/lib/mail";
import { safeDeleteFile } from "@/lib/fs-utils";
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

// ─── Assign Reviewer ──────────────────────────────────────────────────────────
export async function assignReviewer(formData: FormData) {
    const submissionId = parseInt(formData.get('submissionId') as string);
    const reviewerId = formData.get('reviewerId') as string;
    const deadline = formData.get('deadline') as string;
    const assignedBy = formData.get('assignedBy') as string;
    const pdfFile = formData.get('pdfFile') as File;

    try {
        return await db.transaction(async (tx) => {
            // 1. Max 6 reviewers check
            const assignments = await tx.select()
                .from(reviewAssignments)
                .where(and(eq(reviewAssignments.submissionId, submissionId), eq(reviewAssignments.status, 'assigned')));
            
            if (assignments.length >= 6) {
                return { error: "Maximum of 6 active reviewers already assigned." };
            }

            // 2. Duplicate check
            const existing = await tx.select()
                .from(reviewAssignments)
                .where(and(eq(reviewAssignments.submissionId, submissionId), eq(reviewAssignments.reviewerId, reviewerId)));
            
            if (existing.length > 0) {
                return { error: "This reviewer is already assigned to this submission." };
            }

            // 3. Conflict of interest
            const [reviewerProfile] = await tx.select({ institute: userProfiles.institute })
                .from(userProfiles)
                .where(eq(userProfiles.userId, reviewerId))
                .limit(1);
            
            const [leadAuthor] = await tx.select({ institution: submissionAuthors.institution })
                .from(submissionAuthors)
                .where(and(eq(submissionAuthors.submissionId, submissionId), eq(submissionAuthors.isCorresponding, true)))
                .limit(1);

            if (reviewerProfile?.institute && leadAuthor?.institution && reviewerProfile.institute === leadAuthor.institution) {
                return { error: "Conflict of interest detected: Reviewer and Author are from the same institution." };
            }

            // 4. Get latest version
            const latestVersions = await tx.select()
                .from(submissionVersions)
                .where(eq(submissionVersions.submissionId, submissionId))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1);
            
            if (!latestVersions.length) return { error: "Submission version not found." };
            const version = latestVersions[0];

            // 5. PDF Check/Conversion
            let pdfUrl: string | null = null;
            const existingPdfs = await tx.select()
                .from(submissionFiles)
                .where(and(eq(submissionFiles.versionId, version.id), eq(submissionFiles.fileType, 'pdf_version')))
                .limit(1);

            if (pdfFile && pdfFile.size > 0) {
                // Manual PDF upload
                const bytes = await pdfFile.arrayBuffer();
                const fileName = `secure-reviewer-${submissionId}-v${version.versionNumber}-${Date.now()}.pdf`;
                const uploadPath = path.join(process.cwd(), "public/uploads/submissions", fileName);
                await fs.writeFile(uploadPath, Buffer.from(bytes));
                pdfUrl = `/uploads/submissions/${fileName}`;

                await tx.insert(submissionFiles).values({
                    versionId: version.id,
                    fileType: 'pdf_version',
                    fileUrl: pdfUrl,
                    originalName: 'secure-reviewer-copy.pdf'
                });
            } else if (existingPdfs.length > 0) {
                pdfUrl = existingPdfs[0].fileUrl;
            } else {
                // AUTO-CONVERT Main Manuscript if it's DOCX
                const manuscripts = await tx.select()
                    .from(submissionFiles)
                    .where(and(eq(submissionFiles.versionId, version.id), eq(submissionFiles.fileType, 'main_manuscript')))
                    .limit(1);
                
                if (!manuscripts.length) return { error: "No manuscript found to convert." };
                const manuscript = manuscripts[0];

                if (manuscript.fileUrl.toLowerCase().endsWith('.pdf')) {
                    // Just copy the URL if it's already a PDF
                    pdfUrl = manuscript.fileUrl;
                    await tx.insert(submissionFiles).values({
                        versionId: version.id,
                        fileType: 'pdf_version',
                        fileUrl: pdfUrl,
                        originalName: 'reviewer-copy.pdf'
                    });
                } else {
                    // CONVERT DOCX -> PDF
                    try {
                        const mBuffer = await fs.readFile(path.join(process.cwd(), "public", manuscript.fileUrl));
                        const pdfBuffer = await convertDocxToPdf(mBuffer, manuscript.originalName || "manuscript.docx");
                        const fileName = `converted-${submissionId}-v${version.versionNumber}-${Date.now()}.pdf`;
                        const uploadPath = path.join(process.cwd(), "public/uploads/submissions", fileName);
                        await fs.writeFile(uploadPath, pdfBuffer);
                        pdfUrl = `/uploads/submissions/${fileName}`;

                        await tx.insert(submissionFiles).values({
                            versionId: version.id,
                            fileType: 'pdf_version',
                            fileUrl: pdfUrl,
                            originalName: 'converted-reviewer-copy.pdf'
                        });
                    } catch (convErr: any) {
                        return { error: "PDF Conversion failed. Please upload a PDF version manually. Details: " + convErr.message };
                    }
                }
            }

            // 6. Assignment
            const roundRes = await tx.select({ max: sql<number>`MAX(review_round)` })
                .from(reviewAssignments)
                .where(eq(reviewAssignments.submissionId, submissionId));
            const reviewRound = (roundRes[0]?.max || 0) + 1;

            await tx.insert(reviewAssignments).values({
                submissionId,
                reviewerId,
                versionId: version.id,
                assignedBy,
                reviewRound,
                status: 'assigned',
                deadline: new Date(deadline),
                assignedAt: new Date(),
            });

            // 7. Status update
            await tx.update(submissions)
                .set({ status: 'under_review', updatedAt: new Date() })
                .where(eq(submissions.id, submissionId));

            // 8. Notifications
            const [reviewerData] = await tx.select({ email: users.email, name: userProfiles.fullName })
                .from(users)
                .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
                .where(eq(users.id, reviewerId))
                .limit(1);

            const [paperData] = await tx.select({ paperId: submissions.paperId, title: submissionVersions.title })
                .from(submissions)
                .join(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
                .where(eq(submissions.id, submissionId))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1);

            if (reviewerData?.email) {
                const template = emailTemplates.reviewAssignment(
                    reviewerData.name || "Reviewer",
                    paperData.title,
                    deadline,
                    paperData.paperId
                );
                await sendEmail({ to: reviewerData.email, subject: template.subject, html: template.html });
            }

            // 9. Author Portal Invite
            const [authorData] = await tx.select({ id: users.id, email: users.email, name: userProfiles.fullName, pass: users.passwordHash })
                .from(submissions)
                .join(users, eq(submissions.correspondingAuthorId, users.id))
                .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
                .where(eq(submissions.id, submissionId))
                .limit(1);

            if (authorData && !authorData.pass) {
                const token = crypto.randomBytes(32).toString('hex');
                const expires = new Date();
                expires.setHours(expires.getHours() + 72);

                await tx.update(users)
                    .set({ invitationToken: token, invitationExpires: expires })
                    .where(eq(users.id, authorData.id));

                const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com'}/auth/setup-password?token=${token}&role=author`;
                const template = emailTemplates.authorInvitation(
                    authorData.name || "Author",
                    paperData.title,
                    paperData.paperId,
                    setupUrl
                );
                await sendEmail({ to: authorData.email, subject: template.subject, html: template.html });
            }

            revalidatePath('/admin/reviews');
            return { success: true };
        });
    } catch (error: any) {
        console.error("Assign Reviewer Error:", error);
        return { error: "Failed to assign reviewer: " + error.message };
    }
}

// ─── Reviewer submits their review ────────────────────────────────────────────
export async function submitReview(assignmentId: number, formData: FormData) {
    const decision = formData.get('decision') as string;
    const commentsToAuthor = formData.get('commentsToAuthor') as string;
    const commentsToEditor = formData.get('commentsToEditor') as string;
    const score = formData.get('score') ? parseInt(formData.get('score') as string) : null;
    const confidence = formData.get('confidence') ? parseInt(formData.get('confidence') as string) : null;

    try {
        // 1. Get assignment + submission details
        const assignmentRows: any = await db.execute(
            sql`SELECT ra.submission_id, ra.reviewer_id, s.paper_id, sv.title,
                       u.email as author_email, up.full_name as author_name
                FROM review_assignments ra
                JOIN submissions s ON ra.submission_id = s.id
                JOIN submission_versions sv ON ra.version_id = sv.id
                JOIN users u ON s.corresponding_author_id = u.id
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE ra.id = ${assignmentId}`
        );
        if (!assignmentRows[0].length) return { error: "Assignment not found." };
        const assignment = assignmentRows[0][0];
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com';

        // 2. Upsert review record
        await db.execute(
            sql`INSERT INTO reviews (assignment_id, decision, score, confidence, comments_to_author, comments_to_editor, submitted_at)
                VALUES (${assignmentId}, ${decision}, ${score}, ${confidence}, ${commentsToAuthor}, ${commentsToEditor}, NOW())
                ON DUPLICATE KEY UPDATE
                  decision = ${decision}, score = ${score}, confidence = ${confidence},
                  comments_to_author = ${commentsToAuthor}, comments_to_editor = ${commentsToEditor},
                  submitted_at = NOW()`
        );

        // 3. Update assignment status to completed
        await db.execute(
            sql`UPDATE review_assignments SET status = 'completed', responded_at = NOW() WHERE id = ${assignmentId}`
        );

        // 4. Based on decision, notify author and/or admin
        if (decision === 'accept') {
            // Notify admin/editor for final evaluation
            const adminRows: any = await db.execute(
                sql`SELECT email FROM users WHERE role IN ('admin', 'editor')`
            );
            await Promise.allSettled(adminRows[0].map((a: any) => sendEmail({
                to: a.email,
                subject: `Review Completed (Accept): ${assignment.paper_id}`,
                html: emailTemplates.reviewCompleted("Reviewer", assignment.title, assignment.paper_id).html
            })));
        } else {
            // minor_revision, major_revision, reject → notify author
            const statusMap: Record<string, string> = {
                minor_revision: 'revision_requested',
                major_revision: 'revision_requested',
                reject: 'rejected',
            };
            const newStatus = statusMap[decision];

            if (newStatus) {
                await db.execute(
                    sql`UPDATE submissions SET status = ${newStatus}, updated_at = NOW() WHERE id = ${assignment.submission_id}`
                );

                if (newStatus === 'revision_requested') {
                    const emailData = emailTemplates.resubmissionRequest(
                        assignment.author_name,
                        assignment.title,
                        assignment.paper_id,
                        commentsToAuthor
                    );
                    await sendEmail({ to: assignment.author_email, subject: emailData.subject, html: emailData.html });
                } else {
                    const emailData = emailTemplates.manuscriptRejection(
                        assignment.author_name,
                        assignment.title,
                        assignment.paper_id,
                        commentsToAuthor
                    );
                    await sendEmail({ to: assignment.author_email, subject: emailData.subject, html: emailData.html });
                }
            }
        }

        revalidatePath('/admin/reviews');
        revalidatePath('/reviewer/reviews');
        return { success: true };
    } catch (error: any) {
        console.error("Submit Review Error:", error);
        return { error: "Failed to submit review: " + error.message };
    }
}

// ─── Get all review assignments (optionally for a specific reviewer) ──────────
export async function getActiveReviews(reviewerId?: string) {
    try {
        let query;
        if (reviewerId) {
            query = sql`
                SELECT ra.id, ra.status, ra.assigned_at, ra.deadline, ra.review_round,
                       s.id as submission_id, s.paper_id, s.status as submission_status,
                       sv.title,
                       up.full_name as reviewer_name,
                       r.decision, r.comments_to_author, r.submitted_at as review_submitted_at,
                       (SELECT file_url FROM submission_files WHERE version_id = sv.id AND file_type = 'pdf_version' LIMIT 1) as manuscript_path,
                       (SELECT file_url FROM submission_files WHERE version_id = sv.id AND file_type = 'feedback' LIMIT 1) as feedback_file_path
                FROM review_assignments ra
                JOIN submissions s ON ra.submission_id = s.id
                JOIN submission_versions sv ON ra.version_id = sv.id
                LEFT JOIN user_profiles up ON ra.reviewer_id = up.user_id
                LEFT JOIN reviews r ON ra.id = r.assignment_id
                WHERE ra.reviewer_id = ${reviewerId}
                ORDER BY ra.assigned_at DESC
            `;
        } else {
            query = sql`
                SELECT ra.id, ra.status, ra.assigned_at, ra.deadline, ra.review_round,
                       s.id as submission_id, s.paper_id, s.status as submission_status,
                       sv.title,
                       up.full_name as reviewer_name,
                       r.decision, r.comments_to_author, r.submitted_at as review_submitted_at,
                       (SELECT file_url FROM submission_files WHERE version_id = sv.id AND file_type = 'pdf_version' LIMIT 1) as manuscript_path,
                       (SELECT file_url FROM submission_files WHERE version_id = sv.id AND file_type = 'feedback' LIMIT 1) as feedback_file_path
                FROM review_assignments ra
                JOIN submissions s ON ra.submission_id = s.id
                JOIN submission_versions sv ON ra.version_id = sv.id
                LEFT JOIN user_profiles up ON ra.reviewer_id = up.user_id
                LEFT JOIN reviews r ON ra.id = r.assignment_id
                ORDER BY ra.assigned_at DESC
            `;
        }
        const rows: any = await db.execute(query);
        return rows[0] || [];
    } catch (error: any) {
        console.error("Get Reviews Error:", error);
        return [];
    }
}

// ─── Get unassigned / ready-for-review submissions ────────────────────────────
export async function getUnassignedAcceptedPapers() {
    try {
        const rows: any = await db.execute(sql`
            SELECT s.id, s.paper_id, sv.title,
                   f.file_url as pdf_url
            FROM submissions s
            JOIN submission_versions sv ON sv.submission_id = s.id
                AND sv.version_number = (SELECT MAX(version_number) FROM submission_versions WHERE submission_id = s.id)
            LEFT JOIN submission_files f ON f.version_id = sv.id AND f.file_type = 'pdf_version'
            WHERE s.status IN ('submitted', 'editor_assigned', 'under_review', 'accepted')
        `);
        return rows[0] || [];
    } catch (error: any) {
        console.error("Get Unassigned Error:", error);
        return [];
    }
}
