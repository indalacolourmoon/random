"use server";

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { eq, desc, and } from "drizzle-orm";
import {
    submissions,
    submissionVersions,
    submissionFiles,
    submissionAuthors,
    users,
    userProfiles,
} from "@/db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import { inArray } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

// ─── Get session user (author) ─────────────────────────────────────────────────
async function getAuthorSession() {
    const session: any = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    if (session.user.role !== 'author') return null;
    return session.user;
}

// ─── Author's dashboard data ────────────────────────────────────────────────────
export async function getAuthorDashboard() {
    try {
        const author = await getAuthorSession();
        if (!author) return { error: "Unauthorized", submissions: [] };

        const rows: any = await db.execute(sql`
            SELECT
                s.id, s.paper_id, s.status, s.submitted_at, s.updated_at,
                sv.title, sv.abstract, sv.keywords,
                p.amount as apc_amount, p.currency as apc_currency, p.status as payment_status,
                pub.final_pdf_url, pub.doi,
                vi.volume_number, vi.issue_number, vi.year as issue_year
            FROM submissions s
            JOIN submission_versions sv ON sv.submission_id = s.id
                AND sv.version_number = (SELECT MAX(version_number) FROM submission_versions WHERE submission_id = s.id)
            LEFT JOIN payments p ON p.submission_id = s.id
            LEFT JOIN publications pub ON pub.submission_id = s.id
            LEFT JOIN volumes_issues vi ON vi.id = s.issue_id
            WHERE s.corresponding_author_id = ${author.id}
            ORDER BY s.submitted_at DESC
        `);

        return { submissions: rows[0] || [] };
    } catch (error: any) {
        console.error("Author Dashboard Error:", error);
        return { submissions: [] };
    }
}

// ─── Single submission detail for author ────────────────────────────────────────
export async function getAuthorSubmission(submissionId: number) {
    try {
        const author = await getAuthorSession();
        if (!author) return null;

        const rows: any = await db.execute(sql`
            SELECT
                s.id, s.paper_id, s.status, s.submitted_at, s.updated_at,
                sv.id as version_id, sv.version_number, sv.title, sv.abstract,
                sv.keywords, sv.subject_area, sv.changelog
            FROM submissions s
            JOIN submission_versions sv ON sv.submission_id = s.id
                AND sv.version_number = (SELECT MAX(version_number) FROM submission_versions WHERE submission_id = s.id)
            WHERE s.id = ${submissionId} AND s.corresponding_author_id = ${author.id}
            LIMIT 1
        `);
        if (!rows[0].length) return null;
        const sub = rows[0][0];

        // Files (manuscript + copyright, NOT pdf_version — that's reviewer-restricted)
        const files: any = await db.execute(sql`
            SELECT id, file_type, file_url, original_name, file_size, created_at
            FROM submission_files
            WHERE version_id = ${sub.version_id}
              AND file_type IN ('main_manuscript', 'copyright_form')
        `);

        // Authors
        const authors: any = await db.execute(sql`
            SELECT name, email, designation, institution, is_corresponding, order_index
            FROM submission_authors
            WHERE submission_id = ${submissionId}
            ORDER BY order_index ASC
        `);

        // Reviewer comments visible to author
        const reviewComments: any = await db.execute(sql`
            SELECT r.comments_to_author, r.decision, r.submitted_at,
                   ra.review_round, ra.deadline
            FROM review_assignments ra
            LEFT JOIN reviews r ON ra.id = r.assignment_id
            WHERE ra.submission_id = ${submissionId}
              AND r.comments_to_author IS NOT NULL
            ORDER BY ra.review_round ASC
        `);

        // Payment
        const payment: any = await db.execute(sql`
            SELECT amount, currency, status, transaction_id, paid_at
            FROM payments WHERE submission_id = ${submissionId} LIMIT 1
        `);

        // Publication
        const pub: any = await db.execute(sql`
            SELECT pub.final_pdf_url, pub.doi, pub.start_page, pub.end_page, pub.published_at,
                   vi.volume_number, vi.issue_number, vi.year
            FROM publications pub
            JOIN volumes_issues vi ON vi.id = pub.issue_id
            WHERE pub.submission_id = ${submissionId} LIMIT 1
        `);

        return {
            ...sub,
            files: files[0] || [],
            authors: authors[0] || [],
            reviewComments: reviewComments[0] || [],
            payment: payment[0]?.[0] || null,
            publication: pub[0]?.[0] || null,
        };
    } catch (error: any) {
        console.error("Get Author Submission Error:", error);
        return null;
    }
}

// ─── Check if author can resubmit ───────────────────────────────────────────────
export async function checkResubmissionEligibility(submissionId: number) {
    try {
        const author = await getAuthorSession();
        if (!author) return { eligible: false, reason: "Unauthorized" };

        const rows: any = await db.execute(sql`
            SELECT id, status, updated_at, corresponding_author_id
            FROM submissions WHERE id = ${submissionId} LIMIT 1
        `);
        if (!rows[0].length) return { eligible: false, reason: "Submission not found" };

        const sub = rows[0][0];
        if (sub.corresponding_author_id !== author.id) {
            return { eligible: false, reason: "Not your submission" };
        }

        const eligible_statuses = ['revision_requested', 'rejected'];
        if (!eligible_statuses.includes(sub.status)) {
            return { eligible: false, reason: `Cannot resubmit when status is '${sub.status}'` };
        }

        const updatedAt = new Date(sub.updated_at);
        const now = new Date();
        const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = 15 - daysSinceUpdate;

        if (daysRemaining <= 0) {
            return { eligible: false, reason: "Resubmission window (15 days) has expired", daysRemaining: 0 };
        }

        return { eligible: true, daysRemaining, reason: "Eligible for resubmission" };
    } catch (error: any) {
        return { eligible: false, reason: error.message };
    }
}

// ─── Author resubmits paper ─────────────────────────────────────────────────────
export async function resubmitPaper(submissionId: number, formData: FormData) {
    const createdFiles: string[] = [];
    try {
        const author = await getAuthorSession();
        if (!author) return { error: "Unauthorized" };

        // Eligibility check
        const eligibility = await checkResubmissionEligibility(submissionId);
        if (!eligibility.eligible) return { error: eligibility.reason };

        const manuscriptFile = formData.get("manuscript") as File;
        const copyrightFile = formData.get("copyright_form") as File;
        const changelog = formData.get("changelog") as string;

        if (!manuscriptFile || manuscriptFile.size === 0) return { error: "Manuscript file is required" };
        if (!copyrightFile || copyrightFile.size === 0) return { error: "Copyright form is required" };

        const result = await db.transaction(async (tx) => {
            // 1. Get latest version to increment
            const latestVersions = await tx.select()
                .from(submissionVersions)
                .where(eq(submissionVersions.submissionId, submissionId))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1);

            if (!latestVersions.length) throw new Error("Original submission version not found");
            const latest = latestVersions[0];
            const newVersionNumber = latest.versionNumber + 1;

            // 2. Create new version
            const [versionInsert] = await tx.insert(submissionVersions).values({
                submissionId,
                versionNumber: newVersionNumber,
                title: latest.title, // Keep original title/abstract if not provided, or update? 
                                     // (Author might want to update title/abstract too, but for simplicity we keep it)
                abstract: latest.abstract,
                keywords: latest.keywords,
                changelog: changelog || null,
            });
            const newVersionId = (versionInsert as any).insertId;

            // 3. Prepare file system
            const uploadDir = "public/uploads/submissions";
            await fs.mkdir(path.join(process.cwd(), uploadDir), { recursive: true });

            const mExt = manuscriptFile.name.split('.').pop() || 'docx';
            const cExt = copyrightFile.name.split('.').pop() || 'pdf';
            const mName = `main_manuscript-${submissionId}-v${newVersionNumber}-${Date.now()}.${mExt}`;
            const cName = `copyright_form-${submissionId}-v${newVersionNumber}-${Date.now()}.${cExt}`;

            const mUrl = `/uploads/submissions/${mName}`;
            const cUrl = `/uploads/submissions/${cName}`;

            // 4. Insert file records
            await tx.insert(submissionFiles).values([
                { versionId: newVersionId, fileType: 'main_manuscript', fileUrl: mUrl, originalName: manuscriptFile.name, fileSize: manuscriptFile.size },
                { versionId: newVersionId, fileType: 'copyright_form', fileUrl: cUrl, originalName: copyrightFile.name, fileSize: copyrightFile.size }
            ]);

            // 5. Update submission status back to submitted
            await tx.update(submissions)
                .set({ status: 'submitted', updatedAt: new Date() })
                .where(eq(submissions.id, submissionId));

            // 6. Write files to disk (inside TX to rollback DB if disk write fails)
            await fs.writeFile(path.join(process.cwd(), uploadDir, mName), Buffer.from(await manuscriptFile.arrayBuffer()));
            createdFiles.push(path.join(process.cwd(), uploadDir, mName));

            await fs.writeFile(path.join(process.cwd(), uploadDir, cName), Buffer.from(await copyrightFile.arrayBuffer()));
            createdFiles.push(path.join(process.cwd(), uploadDir, cName));

            return { newVersion: newVersionNumber };
        });

        // 7. Post-success Notifications
        const staffUsers = await db.select({ email: users.email }).from(users).where(inArray(users.role, ['admin', 'editor']));
        const [sub] = await db.select({ paperId: submissions.paperId }).from(submissions).where(eq(submissions.id, submissionId)).limit(1);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com';

        const adminHtml = `<div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
            <h2 style="color: #6d0202;">Revised Manuscript Received</h2>
            <p><strong>Paper ID:</strong> ${sub.paperId}</p>
            <p><strong>Version:</strong> ${result.newVersion}</p>
            ${changelog ? `<p><strong>Author Notes:</strong> ${changelog}</p>` : ''}
            <a href="${baseUrl}/admin/submissions/${submissionId}" style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Review Submission</a>
        </div>`;

        await Promise.allSettled(staffUsers.map(s => sendEmail({
            to: s.email,
            subject: `IJITEST: Revised Submission Received [${sub.paperId}]`,
            html: adminHtml
        })));

        revalidatePath(`/author/submissions/${submissionId}`);
        revalidatePath('/author/submissions');
        return { success: true, newVersion: result.newVersion };

    } catch (error: any) {
        // Cleanup files if any were written before error occurred
        for (const file of createdFiles) {
            try { await fs.unlink(file); } catch {}
        }
        console.error("Resubmit Error:", error);
        return { error: "Resubmission failed: " + error.message };
    }
}
