"use server";

import { db } from "@/lib/db";
import {
    submissions,
    submissionFiles,
    submissionVersions,
    submissionAuthors,
    users,
    userProfiles,
    settings,
    userInvitations
} from "@/db/schema";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";
import { eq, inArray, sql } from "drizzle-orm";
import crypto from 'crypto';
import { ActionResponse } from "@/db/types";

const submissionSchema = z.object({
    author_name: z.string().min(2, "Author name is required").max(255, "Author name cannot exceed 255 characters"),
    author_email: z.string().email("Invalid email address").max(255, "Email address cannot exceed 255 characters"),
    author_phone: z.string()
        .regex(/^[0-9]+$/, "Author phone must contain only numbers")
        .max(20, "Phone number cannot exceed 20 characters"),
    author_designation: z.string().min(2, "Author designation is required").max(255, "Designation cannot exceed 255 characters"),
    affiliation: z.string().min(2, "Affiliation is required").max(500, "Institution name cannot exceed 500 characters"),
    title: z.string().min(10, "Title must be at least 10 characters").max(1000, "Title cannot exceed 1000 characters"),
    abstract: z.string().min(50, "Abstract must be at least 50 characters"),
    keywords: z.string().min(5, "Keywords are required").max(500, "Keywords cannot exceed 500 characters"),
    co_authors: z.string().optional(),
    terms_accepted: z.string().refine(val => val === "on", {
        message: "You must accept the terms and guidelines"
    }),
});

/**
 * Handles new manuscript submission with transactional DB-first logic.
 * Ensures data integrity by saving DB records before attempting file uploads.
 */
export async function submitPaper(formData: FormData): Promise<ActionResponse<{ paperId: string }>> {
    const fileCleanupList: string[] = [];
    let invitationToken: string | null = null;
    let submissionToCleanup: number | null = null;

    try {
        // 1. Validation
        const rawData = {
            author_name: formData.get("author_name") as string,
            author_email: formData.get("author_email") as string,
            author_phone: formData.get("author_phone") as string,
            author_designation: formData.get("author_designation") as string,
            affiliation: formData.get("affiliation") as string,
            title: formData.get("title") as string,
            abstract: formData.get("abstract") as string,
            keywords: formData.get("keywords") as string,
            co_authors: formData.get("co_authors") as string,
            terms_accepted: formData.get("terms_accepted") as string,
        };

        const validated = submissionSchema.safeParse(rawData);
        if (!validated.success) return { success: false, error: validated.error.issues[0].message };

        const manuscriptFile = formData.get("manuscript") as File;
        const copyrightFile = formData.get("copyright_form") as File;
        
        if (!manuscriptFile || manuscriptFile.size === 0) return { success: false, error: "Manuscript file is mandatory" };
        if (!copyrightFile || copyrightFile.size === 0) return { success: false, error: "Copyright form is mandatory" };

        // .docx ONLY Policy
        const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        const isDocx = (f: File) => 
            f.name.toLowerCase().endsWith(".docx") || 
            f.type === docxMime;

        if (!isDocx(manuscriptFile) || !isDocx(copyrightFile)) {
            return { success: false, error: "Strict Policy: Only .docx files are accepted for both Manuscript and Copyright Form." };
        }

        // 2. Transactional Database Operations (Save everything BUT don't upload files yet)
        const result = await db.transaction(async (tx) => {
            // A. User/Author Account Management
            const existingUsers = await tx.select().from(users).where(eq(users.email, validated.data.author_email)).limit(1);
            let userId: string;

            if (existingUsers.length === 0) {
                userId = crypto.randomUUID();
                invitationToken = crypto.randomBytes(32).toString('hex');
                const expires = new Date();
                expires.setHours(expires.getHours() + 168); // 7-day window for account setup

                await tx.insert(users).values({
                    id: userId,
                    email: validated.data.author_email,
                    role: "author",
                    passwordHash: null, // Force setup
                });

                await tx.insert(userProfiles).values({
                    userId,
                    fullName: validated.data.author_name,
                    institute: validated.data.affiliation,
                    phone: validated.data.author_phone,
                    designation: validated.data.author_designation,
                });

                await tx.insert(userInvitations).values({
                    email: validated.data.author_email,
                    role: "author",
                    token: invitationToken,
                    expiresAt: expires,
                });
            } else {
                userId = existingUsers[0].id;
                // Update profile with latest info
                await tx.update(userProfiles)
                    .set({
                        fullName: validated.data.author_name,
                        institute: validated.data.affiliation,
                        phone: validated.data.author_phone,
                        designation: validated.data.author_designation,
                    })
                    .where(eq(userProfiles.userId, userId));
            }

            // B. Paper Metadata Generation (Gapless Sequential Locking)
            const currentYear = new Date().getFullYear().toString();
            const seqKey = `submission_sequence_${currentYear}`;
            
            // Ensure sequence entry exists
            await tx.execute(sql`INSERT INTO settings (setting_key, setting_value) VALUES (${seqKey}, '0') ON DUPLICATE KEY UPDATE setting_key = setting_key`);
            
            // Lock and Fetch current sequence
            const [seqResult] = await tx.execute(sql`SELECT setting_value as value FROM settings WHERE setting_key = ${seqKey} FOR UPDATE`);
            const lastSeq = parseInt((seqResult as any).value || "0");
            const newSeq = lastSeq + 1;
            
            // Update sequence
            await tx.update(settings).set({ settingValue: newSeq.toString() }).where(eq(settings.settingKey, seqKey));
            
            const paperId = `IJITEST-${currentYear}-${String(newSeq).padStart(4, "0")}`;

            // C. Insert Core Submission
            const [submissionInsert] = await tx.insert(submissions).values({
                paperId,
                status: "submitted",
                correspondingAuthorId: userId,
            }).$returningId();
            const subId = submissionInsert.id;

            // D. Insert Version 1
            const [versionInsert] = await tx.insert(submissionVersions).values({
                submissionId: subId,
                versionNumber: 1,
                title: validated.data.title,
                abstract: validated.data.abstract,
                keywords: validated.data.keywords,
            }).$returningId();
            const verId = versionInsert.id;

            // E. Authors (Lead + Co-authors)
            const authorsList: any[] = [{
                submissionId: subId,
                name: validated.data.author_name,
                email: validated.data.author_email,
                phone: validated.data.author_phone,
                designation: validated.data.author_designation,
                institution: validated.data.affiliation,
                isCorresponding: true,
                orderIndex: 0,
            }];

            if (validated.data.co_authors) {
                try {
                    const coAuthors = JSON.parse(validated.data.co_authors);
                    if (Array.isArray(coAuthors)) {
                        coAuthors.forEach((ca, idx) => {
                            if (!ca.name || !ca.email) return; // Skip empty rows if any
                            authorsList.push({
                                submissionId: subId,
                                name: ca.name,
                                email: ca.email,
                                phone: ca.phone || null,
                                designation: ca.designation || null,
                                institution: ca.institution || null,
                                isCorresponding: false,
                                orderIndex: idx + 1,
                            });
                        });
                    }
                } catch (e) {
                    throw new Error("Invalid co-author data format. Please check your inputs.");
                }
            }
            await tx.insert(submissionAuthors).values(authorsList);

            // F. Predictable File URLs (Saved to DB first as requested)
            const timestamp = Date.now();
            const mName = `manuscript_${subId}_${timestamp}.${manuscriptFile.name.split('.').pop()}`;
            const cName = `copyright_${subId}_${timestamp}.${copyrightFile.name.split('.').pop()}`;
            const mUrl = `/uploads/submissions/${mName}`;
            const cUrl = `/uploads/submissions/${cName}`;

            await tx.insert(submissionFiles).values([
                { versionId: verId, fileType: "main_manuscript", fileUrl: mUrl, originalName: manuscriptFile.name, fileSize: manuscriptFile.size },
                { versionId: verId, fileType: "copyright_form", fileUrl: cUrl, originalName: copyrightFile.name, fileSize: copyrightFile.size }
            ]);

            return { paperId, subId, mName, cName };
        });

        // 3. File Uploads (Happens post-transaction to strictly follow "DB First" rule)
        // If this fails, the DB record exists but we'll mark it as failed or return an error.
        submissionToCleanup = result.subId;
        const uploadDir = path.join(process.cwd(), "public/uploads/submissions");
        await fs.mkdir(uploadDir, { recursive: true });

        try {
            await fs.writeFile(path.join(uploadDir, result.mName), Buffer.from(await manuscriptFile.arrayBuffer()));
            fileCleanupList.push(path.join(uploadDir, result.mName));

            await fs.writeFile(path.join(uploadDir, result.cName), Buffer.from(await copyrightFile.arrayBuffer()));
            fileCleanupList.push(path.join(uploadDir, result.cName));
        } catch (uploadErr) {
            // File-system cleanup for orphaned files
            for (const filePath of fileCleanupList) {
                try { await fs.unlink(filePath); } catch {}
            }
            
            // DB-cleanup for zombie submission
            await db.delete(submissions).where(eq(submissions.id, result.subId));

            // Orphaned Account Cleanup (if user was newly created during this failed session)
            if (invitationToken) {
                const userRes = await db.select().from(users).where(eq(users.email, rawData.author_email)).limit(1);
                if (userRes.length > 0 && !userRes[0].passwordHash) {
                    await db.delete(users).where(eq(users.id, userRes[0].id));
                    await db.delete(userInvitations).where(eq(userInvitations.email, rawData.author_email));
                }
            }
            throw new Error("File upload failed. Our servers might be busy. Please try again.");
        }

        // 4. Notifications
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.org';
        const loginUrl = `${baseUrl}/login`;

        // Author Notification
        const authorTemplate = emailTemplates.submissionReceived(
            validated.data.author_name,
            validated.data.title,
            result.paperId,
            invitationToken ? `${baseUrl}/auth/setup?token=${invitationToken}` : loginUrl
        );

        await sendEmail({
            to: validated.data.author_email,
            subject: authorTemplate.subject,
            html: authorTemplate.html
        });

        // Co-author Notifications
        if (validated.data.co_authors) {
            const coAuthors = JSON.parse(validated.data.co_authors);
            if (Array.isArray(coAuthors)) {
                await Promise.allSettled(coAuthors.map(ca => sendEmail({
                    to: ca.email,
                    subject: `Submission Notification: ${result.paperId}`,
                    html: `<p>Dear ${ca.name}, you have been added as a co-author for the paper <strong>${validated.data.title}</strong> at IJITEST.</p>`
                })));
            }
        }

        // Team Notification — role-specific links
        const staff = await db.select({ email: users.email, role: users.role }).from(users).where(inArray(users.role, ['admin', 'editor']));
        await Promise.allSettled(staff.map(s => {
            const dashboardLink = s.role === 'admin'
                ? `${baseUrl}/admin/submissions/${result.subId}`
                : `${baseUrl}/editor/submissions/${result.subId}`;
            return sendEmail({
                to: s.email,
                subject: `New submission [${result.paperId}]`,
                html: `<p>New submission from ${validated.data.author_name} (${result.paperId}).</p><p><a href="${dashboardLink}">View submission</a></p>`
            });
        }));

        revalidatePath('/admin/submissions');
        return { success: true, data: { paperId: result.paperId } };

    } catch (error) {
        console.error("Submission Failure:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) || "An unexpected error occurred during submission." };
    }
}
