"use server";

import { and, eq, sql, desc, inArray, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { 
    submissions, 
    submissionVersions, 
    submissionFiles, 
    submissionAuthors, 
    publications, 
    volumesIssues, 
    payments, 
    users, 
    userProfiles 
} from "@/db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";
import fs from "fs/promises";
import path from "path";
import { ActionResponse } from "@/db/types";

/**
 * Utility to get the current authenticated author.
 */
async function getAuthorSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'author') return null;
    return session.user;
}

/**
 * Fetch all submissions belonging to the logged-in author.
 * Includes joined data for current title, publication info, and payment status.
 */
export async function getAuthorDashboard(): Promise<ActionResponse<{ submissions: unknown[] }>> {
    try {
        const author = await getAuthorSession();
        if (!author) return { success: false, error: "Unauthorized", data: { submissions: [] } };

        // Unified query using JOINS to avoid multiple calls and raw SQL issues
        const rows = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            submittedAt: submissions.submittedAt,
            updatedAt: submissions.updatedAt,
            title: submissionVersions.title,
            paymentStatus: payments.status,
            paymentAmount: payments.amount,
            finalPdfUrl: publications.finalPdfUrl,
            volumeNumber: volumesIssues.volumeNumber,
            issueNumber: volumesIssues.issueNumber,
            issueYear: volumesIssues.year
        })
        .from(submissions)
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            sql`${submissionVersions.versionNumber} = (SELECT MAX(v2.version_number) FROM submission_versions v2 WHERE v2.submission_id = ${submissions.id})`
        ))
        .leftJoin(payments, eq(submissions.id, payments.submissionId))
        .leftJoin(publications, eq(submissions.id, publications.submissionId))
        .leftJoin(volumesIssues, eq(submissions.issueId, volumesIssues.id))
        .where(eq(submissions.correspondingAuthorId, author.id))
        .orderBy(desc(submissions.submittedAt));

        return { success: true, data: { submissions: rows } };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Author Dashboard Error:", error);
        return { success: false, error: "Failed to load dashboard: " + message, data: { submissions: [] } };
    }
}

/**
 * Fetch detailed view of a single submission for the author.
 */
export async function getAuthorSubmission(submissionId: number): Promise<ActionResponse<any>> {
    try {
        const author = await getAuthorSession();
        if (!author) return { success: false, error: "Unauthorized" };

        // 1. Core Metadata
        const subData = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            submittedAt: submissions.submittedAt,
            updatedAt: submissions.updatedAt,
            versionId: submissionVersions.id,
            versionNumber: submissionVersions.versionNumber,
            title: submissionVersions.title,
            abstract: submissionVersions.abstract,
            keywords: submissionVersions.keywords,
            changelog: submissionVersions.changelog
        })
        .from(submissions)
        .innerJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            sql`${submissionVersions.versionNumber} = (SELECT MAX(v2.version_number) FROM submission_versions v2 WHERE v2.submission_id = ${submissions.id})`
        ))
        .where(and(
            eq(submissions.id, submissionId),
            eq(submissions.correspondingAuthorId, author.id)
        ))
        .limit(1);

        if (!subData.length) return { success: false, error: "Submission not found" };
        const sub = subData[0];

        // 2. Files (Restricted to Manuscript and Copyright for Author)
        const files = await db.select()
            .from(submissionFiles)
            .where(and(
                eq(submissionFiles.versionId, sub.versionId),
                inArray(submissionFiles.fileType, ['main_manuscript', 'copyright_form'])
            ));

        // 3. Authors
        const authorsList = await db.select()
            .from(submissionAuthors)
            .where(eq(submissionAuthors.submissionId, submissionId))
            .orderBy(submissionAuthors.orderIndex);

        // 4. Payment Info
        const paymentData = await db.select()
            .from(payments)
            .where(eq(payments.submissionId, submissionId))
            .limit(1);

        // 5. Publication Meta
        const publicationData = await db.select({
            finalPdfUrl: publications.finalPdfUrl,
            doi: publications.doi,
            publishedAt: publications.publishedAt,
            volume: volumesIssues.volumeNumber,
            issue: volumesIssues.issueNumber,
            year: volumesIssues.year
        })
        .from(publications)
        .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .where(eq(publications.submissionId, submissionId))
        .limit(1);

        return {
            success: true,
            data: {
                ...sub,
                files,
                authors: authorsList,
                payment: paymentData[0] || null,
                publication: publicationData[0] || null
            }
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Get Author Submission Error:", error);
        return { success: false, error: "Failed to fetch submission details: " + message };
    }
}

/**
 * Check if the paper is eligible for resubmission (Window: 15 days).
 */
export async function checkResubmissionEligibility(submissionId: number): Promise<ActionResponse<{ eligible: boolean; daysRemaining: number }>> {
    try {
        const author = await getAuthorSession();
        if (!author) return { success: false, error: "Unauthorized", data: { eligible: false, daysRemaining: 0 } };

        const rows = await db.select({
            id: submissions.id,
            status: submissions.status,
            updatedAt: submissions.updatedAt,
            correspondingAuthorId: submissions.correspondingAuthorId
        })
        .from(submissions)
        .where(eq(submissions.id, submissionId))
        .limit(1);

        if (!rows.length) return { success: false, error: "Submission not found", data: { eligible: false, daysRemaining: 0 } };

        const sub = rows[0];
        if (sub.correspondingAuthorId !== author.id) return { success: false, error: "Unauthorized access", data: { eligible: false, daysRemaining: 0 } };

        if (!['revision_requested', 'rejected'].includes(sub.status)) {
            return { success: false, error: `Manuscript status '${sub.status}' does not allow resubmission.`, data: { eligible: false, daysRemaining: 0 } };
        }

        const updatedAt = new Date(sub.updatedAt!);
        const daysSinceUpdate = Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = 15 - daysSinceUpdate;

        if (daysRemaining <= 0) {
            return { success: true, data: { eligible: false, daysRemaining: 0 } };
        }

        return { success: true, data: { eligible: true, daysRemaining } };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message, data: { eligible: false, daysRemaining: 0 } };
    }
}

/**
 * Handle revised manuscript resubmission.
 * Transactional DB-first logic as per requirements.
 */
export async function resubmitPaper(submissionId: number, formData: FormData): Promise<ActionResponse> {
    const fileCleanup: string[] = [];
    try {
        const author = await getAuthorSession();
        if (!author) return { success: false, error: "Unauthorized" };

        const eligibility = await checkResubmissionEligibility(submissionId);
        if (!eligibility.success || !eligibility.data?.eligible) {
            return { success: false, error: eligibility.error || "Resubmission window expired or ineligible status." };
        }

        const manuscriptFile = formData.get("manuscript") as File;
        const copyrightFile = formData.get("copyright_form") as File;
        const changelog = formData.get("changelog") as string;

        if (!manuscriptFile || manuscriptFile.size === 0) return { success: false, error: "Revised manuscript is required." };
        if (!copyrightFile || copyrightFile.size === 0) return { success: false, error: "New copyright form is required." };

        // 1. DATABASE TRANSACTION (RECORD COMMIT)
        const result = await db.transaction(async (tx) => {
            // A. Get Latest Version to find current metadata
            const versionsArr = await tx.select()
                .from(submissionVersions)
                .where(eq(submissionVersions.submissionId, submissionId))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1);
            
            if (!versionsArr.length) throw new Error("Original version records not found.");
            const latest = versionsArr[0];
            const nextVersion = latest.versionNumber + 1;

            // B. Create New Version Record
            const [versionInsert] = await tx.insert(submissionVersions).values({
                submissionId,
                versionNumber: nextVersion,
                title: latest.title,
                abstract: latest.abstract,
                keywords: latest.keywords,
                changelog: changelog || "Revised version submission",
            }).$returningId();
            const verId = versionInsert.id;

            // C. Predictable URLs (DB First)
            const timestamp = Date.now();
            const mName = `revised_manuscript_${submissionId}_v${nextVersion}_${timestamp}.${manuscriptFile.name.split('.').pop()}`;
            const cName = `revised_copyright_${submissionId}_v${nextVersion}_${timestamp}.${copyrightFile.name.split('.').pop()}`;
            const mUrl = `/uploads/submissions/${mName}`;
            const cUrl = `/uploads/submissions/${cName}`;

            await tx.insert(submissionFiles).values([
                { versionId: verId, fileType: "main_manuscript", fileUrl: mUrl, originalName: manuscriptFile.name, fileSize: manuscriptFile.size },
                { versionId: verId, fileType: "copyright_form", fileUrl: cUrl, originalName: copyrightFile.name, fileSize: copyrightFile.size }
            ]);

            // D. Set status back to 'submitted'
            await tx.update(submissions)
                .set({ status: 'submitted', updatedAt: new Date() })
                .where(eq(submissions.id, submissionId));

            return { mName, cName, nextVersion, verId };
        });

        // 2. FILE SYSTEM OPERATIONS (POST-COMMIT)
        const uploadDir = path.join(process.cwd(), "public/uploads/submissions");
        try {
            await fs.writeFile(path.join(uploadDir, result.mName), Buffer.from(await manuscriptFile.arrayBuffer()));
            fileCleanup.push(path.join(uploadDir, result.mName));

            await fs.writeFile(path.join(uploadDir, result.cName), Buffer.from(await copyrightFile.arrayBuffer()));
            fileCleanup.push(path.join(uploadDir, result.cName));
        } catch (ioErr) {
            // IO failed — rollback: delete orphaned version + its file records, reset submission status
            await db.transaction(async (tx) => {
                await tx.delete(submissionFiles).where(eq(submissionFiles.versionId, result.verId));
                await tx.delete(submissionVersions).where(
                    and(eq(submissionVersions.submissionId, submissionId), eq(submissionVersions.versionNumber, result.nextVersion))
                );
                await tx.update(submissions)
                    .set({ status: 'revision_requested', updatedAt: new Date() })
                    .where(eq(submissions.id, submissionId));
            });
            throw new Error("Failed to save files on server. Please try again.");
        }

        // 3. Notifications to Staff
        try {
            const paperData = await db.select({ 
                paperId: submissions.paperId,
                title: submissionVersions.title,
                authorName: userProfiles.fullName
            })
            .from(submissions)
            .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
        .innerJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
            .where(and(eq(submissions.id, submissionId), eq(submissionVersions.versionNumber, result.nextVersion)))
            .limit(1);

            if (paperData.length > 0) {
                const { paperId, title, authorName } = paperData[0];
                const staff = await db.select({ email: users.email, role: users.role }).from(users).where(inArray(users.role, ['admin', 'editor']));
                
                await Promise.allSettled(staff.map(s => {
                    const template = emailTemplates.resubmissionReceived(authorName, title, paperId, submissionId, s.role as 'admin' | 'editor');
                    return sendEmail({ to: s.email, subject: template.subject, html: template.html });
                }));
            }
        } catch (mailErr) {
            console.error("Resubmission Notification Error:", mailErr);
            // Non-blocking for the user
        }

        revalidatePath('/author');
        return { success: true };

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Resubmission Failure:", error);
        return { success: false, error: message || "Failed to process revision." };
    }
}

/**
 * Simple fetch for a user's own submissions as author.
 * Used by different dashboards (Admin, Editor, Reviewer) to show "My Papers" tab.
 */
export async function getMySubmissions() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return [];

        const userId = session.user.id;

        const query = db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            submittedAt: submissions.submittedAt,
            title: submissionVersions.title,
        })
        .from(submissions)
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            sql`${submissionVersions.versionNumber} = (SELECT MAX(v.version_number) FROM submission_versions v WHERE v.submission_id = ${submissions.id})`
        ));

        // Authors only see their own. Admins/Editors see all? 
        // Actually this specific function is typically for the "My Papers" tab.
        const rows = await query.where(eq(submissions.correspondingAuthorId, userId))
            .orderBy(desc(submissions.submittedAt));

        return rows.map(r => ({
            id: r.id,
            paper_id: r.paperId,
            status: r.status,
            submitted_at: r.submittedAt ? r.submittedAt.toISOString() : "",
            title: r.title || "Untitled Manuscript"
        }));
    } catch (error) {
        console.error("Consolidated getMySubmissions Error:", error);
        return [];
    }
}

/**
 * System Cleanup: Delete authors and their submissions if they are inactive for 15+ days 
 * after rejection or revision request, and have no other active papers.
 */
export async function runCleanupInactiveAuthors(): Promise<ActionResponse<{ deletedCount: number }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return { success: false, error: "Unauthorized: Admin privileges required." };
        }

        const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

        // 1. Find submissions that are 'rejected' or 'revision_requested' and not updated for 15 days
        const targetSubmissions = await db.select({
            id: submissions.id,
            authorId: submissions.correspondingAuthorId
        })
        .from(submissions)
        .where(and(
            inArray(submissions.status, ['rejected', 'revision_requested']),
            sql`${submissions.updatedAt} < ${fifteenDaysAgo}`
        ));

        if (targetSubmissions.length === 0) {
            return { success: true, data: { deletedCount: 0 }, message: "No inactive submissions found." };
        }

        const authorIds = [...new Set(targetSubmissions.map(s => s.authorId))];
        let deletedCount = 0;
        
        for (const aId of authorIds) {
            if (!aId) continue;
            
            // Check if this author has ANY active/published papers (not rejected or in revision window)
            const activePapers = await db.select({ id: submissions.id })
                .from(submissions)
                .where(and(
                    sql`${submissions.correspondingAuthorId} = ${aId}`,
                    notInArray(submissions.status, ['rejected', 'revision_requested'])
                ))
                .limit(1);

            if (activePapers.length === 0) {
                // This author is purely inactive or rejected. Delete them.
                // We'll use a transaction for each user cleanup
                await db.transaction(async (tx) => {
                    // Get all submission IDs for this author to clean files
                    const authorSubs = await tx.select({ id: submissions.id }).from(submissions).where(sql`${submissions.correspondingAuthorId} = ${aId}`);
                    const subIds = authorSubs.map(s => s.id);

                    if (subIds.length > 0) {
                        // Clean files from disk
                        const files = await tx.select().from(submissionFiles).where(inArray(submissionFiles.versionId, 
                            tx.select({ id: submissionVersions.id }).from(submissionVersions).where(inArray(submissionVersions.submissionId, subIds))
                        ));
                        
                        for (const file of files) {
                            try {
                                await fs.unlink(path.join(process.cwd(), 'public', file.fileUrl));
                            } catch { /* ignore */ }
                        }

                        // Waterfall delete (Drizzle should handle cascade if configured, but we'll be explicit)
                        // In MySQL without cascade, this is necessary.
                        await tx.delete(submissionAuthors).where(inArray(submissionAuthors.submissionId, subIds));
                        await tx.delete(payments).where(inArray(payments.submissionId, subIds));
                        await tx.delete(submissions).where(inArray(submissions.id, subIds));
                    }

                    // Delete Profile and User
                    await tx.delete(userProfiles).where(sql`${userProfiles.userId} = ${aId}`);
                    await tx.delete(users).where(sql`${users.id} = ${aId}`);
                });
                deletedCount++;
            }
        }

        revalidatePath('/admin/users');
        return { success: true, data: { deletedCount }, message: `Cleanup complete. Deleted ${deletedCount} inactive authors.` };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Cleanup Error:", error);
        return { success: false, error: "Cleanup failed: " + message };
    }
}
