"use server";

import { db } from "@/lib/db";
import {
    submissions,
    submissionFiles,
    submissionVersions,
    submissionAuthors,
    users,
    userProfiles
} from "@/db/schema";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";
import { count, eq, inArray } from "drizzle-orm";
import crypto from 'crypto';

const submissionSchema = z.object({
    author_name: z.string().min(2, "Author name is required"),
    author_email: z.string().email("Invalid email address"),
    author_phone: z.string().regex(/^[0-9]+$/, "Author phone must contain only numbers"),
    author_designation: z.string().min(2, "Author designation is required"),
    affiliation: z.string().min(2, "Affiliation is required"),
    title: z.string().min(10, "Title must be at least 10 characters"),
    abstract: z.string().min(50, "Abstract must be at least 50 characters"),
    keywords: z.string().min(5, "Keywords are required"),
    co_authors: z.string().optional(),
    terms_accepted: z.string().refine(val => val === "on", {
        message: "You must accept the terms and guidelines"
    }),
});

async function saveFile(file: File, submissionId: number, type: string) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `${type}-${submissionId}-${Date.now()}.${fileExt}`;
    const uploadDir = path.join(process.cwd(), "public/uploads/submissions");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    return {
        url: `/uploads/submissions/${fileName}`,
        size: file.size,
        originalName: file.name
    };
}

export async function submitPaper(formData: FormData) {
    const createdFiles: string[] = [];
    let invitationToken: string | null = null;

    try {
        // 1️⃣ Validate
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
        if (!validated.success) {
            return { error: validated.error.issues[0].message };
        }

        const manuscriptFile = formData.get("manuscript") as File;
        const copyrightFile = formData.get("copyright_form") as File;
        if (!manuscriptFile || manuscriptFile.size === 0) return { error: "Manuscript file is mandatory" };
        if (!copyrightFile || copyrightFile.size === 0) return { error: "Copyright form is mandatory" };

        // 2️⃣ CORE TRANSACTION
        const result = await db.transaction(async (tx: any) => {
            // A. Find or create user
            const [user] = await tx.select().from(users).where(eq(users.email, validated.data.author_email));
            let userId: string;
            
            if (!user) {
                userId = crypto.randomUUID();
                invitationToken = crypto.randomBytes(32).toString('hex');
                const expires = new Date();
                expires.setHours(expires.getHours() + 72); // 72-hour window

                await tx.insert(users).values({ 
                    id: userId, 
                    email: validated.data.author_email, 
                    role: "author",
                    invitationToken,
                    invitationExpires: expires
                });
                await tx.insert(userProfiles).values({
                    userId,
                    fullName: validated.data.author_name,
                    institute: validated.data.affiliation,
                    phone: validated.data.author_phone,
                    designation: validated.data.author_designation,
                });
            } else {
                userId = user.id;
                // If existing user has no password, generate invitation token
                if (!user.passwordHash && !user.invitationToken) {
                    invitationToken = crypto.randomBytes(32).toString('hex');
                    const expires = new Date();
                    expires.setHours(expires.getHours() + 72);
                    await tx.update(users)
                        .set({ invitationToken, invitationExpires: expires })
                        .where(eq(users.id, userId));
                }
                
                await tx.update(userProfiles)
                    .set({
                        fullName: validated.data.author_name,
                        institute: validated.data.affiliation,
                        phone: validated.data.author_phone,
                        designation: validated.data.author_designation,
                    })
                    .where(eq(userProfiles.userId, userId));
            }

            // B. Generate paper ID
            const [countRes] = await tx.select({ value: count() }).from(submissions);
            const total = countRes?.value || 0;
            const year = new Date().getFullYear();
            const paperId = `IJITEST-${year}-${String(total + 1).padStart(3, "0")}`;

            // C. Create submission & version
            const [submissionInsert] = await tx.insert(submissions).values({
                paperId,
                status: "submitted",
                correspondingAuthorId: userId,
            });
            const submissionId = (submissionInsert as any).insertId;

            const [versionInsert] = await tx.insert(submissionVersions).values({
                submissionId,
                versionNumber: 1,
                title: validated.data.title,
                abstract: validated.data.abstract,
                keywords: validated.data.keywords,
            });
            const versionId = (versionInsert as any).insertId;

            // D. Lead Author & Co-authors
            const authorsToInsert: any[] = [{
                submissionId,
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
                        coAuthors.forEach((ca: any, idx: number) => {
                            authorsToInsert.push({
                                submissionId,
                                name: ca.name,
                                email: ca.email,
                                phone: ca.phone,
                                designation: ca.designation,
                                institution: ca.institution,
                                isCorresponding: false,
                                orderIndex: idx + 1,
                            });
                        });
                    }
                } catch (e) {
                    console.error("Co-author parsing error:", e);
                }
            }
            await tx.insert(submissionAuthors).values(authorsToInsert);

            // E. PRE-GENERATE FILE URLS (Important: We don't save yet)
            const uploadDir = "public/uploads/submissions";
            await fs.mkdir(path.join(process.cwd(), uploadDir), { recursive: true });

            const mExt = manuscriptFile.name.split('.').pop() || 'docx';
            const cExt = copyrightFile.name.split('.').pop() || 'pdf';
            const mName = `main_manuscript-${submissionId}-${Date.now()}.${mExt}`;
            const cName = `copyright_form-${submissionId}-${Date.now()}.${cExt}`;

            const mUrl = `/uploads/submissions/${mName}`;
            const cUrl = `/uploads/submissions/${cName}`;

            // F. Insert file metadata
            await tx.insert(submissionFiles).values([
                { versionId, fileType: "main_manuscript", fileUrl: mUrl, originalName: manuscriptFile.name, fileSize: manuscriptFile.size },
                { versionId, fileType: "copyright_form", fileUrl: cUrl, originalName: copyrightFile.name, fileSize: copyrightFile.size }
            ]);

            // G. WRITE FILES TO DISK (Final step inside or just after transaction)
            // We do it INSIDE transaction block to ensure if file write fails, tx rolls back.
            await fs.writeFile(path.join(process.cwd(), uploadDir, mName), Buffer.from(await manuscriptFile.arrayBuffer()));
            createdFiles.push(path.join(process.cwd(), uploadDir, mName));

            await fs.writeFile(path.join(process.cwd(), uploadDir, cName), Buffer.from(await copyrightFile.arrayBuffer()));
            createdFiles.push(path.join(process.cwd(), uploadDir, cName));

            return { paperId, submissionId };
        });

        // 3️⃣ POST-SUBMISSION EMAILS
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com';
        let setupUrl = "";
        if (invitationToken) {
            setupUrl = `${baseUrl}/auth/setup-password?token=${invitationToken}&role=author`;
        }

        const authorTemplate = emailTemplates.submissionReceived(
            validated.data.author_name,
            validated.data.title,
            result.paperId,
            setupUrl
        );

        // Notify co-authors (filtered unique)
        if (validated.data.co_authors) {
            try {
                const coAuthors = JSON.parse(validated.data.co_authors);
                if (Array.isArray(coAuthors)) {
                    await Promise.allSettled(coAuthors.map((ca: any) => 
                        sendEmail({
                            to: ca.email,
                            subject: `Co-Author Notification: ${result.paperId}`,
                            html: `<div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                                <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                                <p>Dear <strong>${ca.name}</strong>,</p>
                                <p>You have been listed as a co-author on "<strong>${validated.data.title}</strong>" (Paper ID: ${result.paperId}), submitted to IJITEST.</p>
                                <p>Track its status via the public portal:</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${baseUrl}/track?id=${result.paperId}" style="background: #1a1a1a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Track Submission</a>
                                </div>
                                <p>Regards,<br>Editorial Office, IJITEST</p>
                            </div>`
                        })
                    ));
                }
            } catch {}
        }

        // Notify Admins/Editors
        const staffUsers = await db.select({ email: users.email }).from(users).where(inArray(users.role, ['admin', 'editor']));
        const adminHtml = `<div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
            <h2 style="color: #6d0202;">New Submission Received</h2>
            <p><strong>Paper ID:</strong> ${result.paperId}</p>
            <p><strong>Title:</strong> ${validated.data.title}</p>
            <p><strong>Author:</strong> ${validated.data.author_name}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <a href="${baseUrl}/admin/submissions/${result.submissionId}" style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Submission</a>
        </div>`;

        await Promise.allSettled([
            sendEmail({ to: validated.data.author_email, subject: authorTemplate.subject, html: authorTemplate.html }),
            ...staffUsers.map(s => sendEmail({ to: s.email, subject: `IJITEST New Submission [${result.paperId}]`, html: adminHtml }))
        ]);

        revalidatePath('/admin/submissions');
        return { success: true, paperId: result.paperId };

    } catch (error: any) {
        // CLEANUP FILES ON ERROR
        for (const file of createdFiles) {
            try { await fs.unlink(file); } catch {}
        }
        console.error("Submission Error:", error);
        return { error: "Submission failed: " + error.message };
    }
}

