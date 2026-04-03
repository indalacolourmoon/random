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
import { count, eq } from "drizzle-orm";

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
    try {
        // 1. Zod Validation
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

        // 2. Transactional Database Orchestration
        const result = await db.transaction(async (tx:any) => {
            
            // A. User Handling: Find or Create corresponding author
            let [user] = await tx.select().from(users).where(eq(users.email, validated.data.author_email));
            let userId: string;

            if (!user) {
                userId = crypto.randomUUID();
                await tx.insert(users).values({
                    id: userId,
                    email: validated.data.author_email,
                    role: 'author',
                });
                await tx.insert(userProfiles).values({
                    userId: userId,
                    fullName: validated.data.author_name,
                    institute: validated.data.affiliation,
                    phone: validated.data.author_phone,
                    designation: validated.data.author_designation,
                });
            } else {
                userId = user.id;
            }

            // B. Generate Professional Paper ID
            const [countRes] = await tx.select({ value: count() }).from(submissions);
            const total = countRes?.value || 0;
            const year = new Date().getFullYear();
            const paperId = `IJITEST-${year}-${String(total + 1).padStart(3, '0')}`;

            // C. Create Base Submission Record
            const [submissionInsert] = await tx.insert(submissions).values({
                paperId: paperId,
                status: 'submitted',
                correspondingAuthorId: userId,
            });
            const submissionId = (submissionInsert as any).insertId;

            // D. Create Version 1 - Holds current title/abstract/metadata
            const [versionInsert] = await tx.insert(submissionVersions).values({
                submissionId,
                versionNumber: 1,
                title: validated.data.title,
                abstract: validated.data.abstract,
                keywords: validated.data.keywords,
            });
            const versionId = (versionInsert as any).insertId;

            // E. Process & Save Physical Files
            const manuscriptData = await saveFile(manuscriptFile, submissionId, 'main_manuscript');
            const copyrightData = await saveFile(copyrightFile, submissionId, 'copyright_form');

            // F. Store File Metadata
            await tx.insert(submissionFiles).values([
                { 
                    versionId, 
                    fileType: 'main_manuscript', 
                    fileUrl: manuscriptData.url, 
                    originalName: manuscriptData.originalName, 
                    fileSize: manuscriptData.size 
                },
                { 
                    versionId, 
                    fileType: 'copyright_form', 
                    fileUrl: copyrightData.url, 
                    originalName: copyrightData.originalName, 
                    fileSize: copyrightData.size 
                }
            ]);
            
            // F. Register Authors (Starting with Lead Author)
            const authorsToInsert = [
                {
                    submissionId,
                    name: validated.data.author_name,
                    email: validated.data.author_email,
                    phone: validated.data.author_phone,
                    designation: validated.data.author_designation,
                    institution: validated.data.affiliation,
                    isCorresponding: true,
                    orderIndex: 0
                }
            ];

            // G. Register Co-Authors
            if (validated.data.co_authors) {
                try {
                    const coAuthors = JSON.parse(validated.data.co_authors);
                    if (Array.isArray(coAuthors) && coAuthors.length > 0) {
                        coAuthors.forEach((ca: any, index: number) => {
                            authorsToInsert.push({
                                submissionId,
                                name: ca.name,
                                email: ca.email,
                                phone: ca.phone,
                                designation: ca.designation,
                                institution: ca.institution,
                                isCorresponding: false,
                                orderIndex: index + 1
                            });
                        });
                    }
                } catch (e) {
                    console.error("Co-author parsing error:", e);
                }
            }

            await tx.insert(submissionAuthors).values(authorsToInsert);

            return { paperId, submissionId };
        });

        // 3. Communications Dispatch
        const emailTemplate = emailTemplates.submissionReceived(
            validated.data.author_name, 
            validated.data.title, 
            result.paperId
        );

        await Promise.allSettled([
            sendEmail({
                to: validated.data.author_email,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            }),
            sendEmail({
                to: process.env.SMTP_USER as string,
                subject: `IJITEST ALERT: NEW DOCTRINE [${result.paperId}]`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
                        <h2 style="color: #6d0202;">New Manuscript Transmission Detected</h2>
                        <p><strong>Paper ID:</strong> ${result.paperId}</p>
                        <p><strong>Title:</strong> ${validated.data.title}</p>
                        <p><strong>Author:</strong> ${validated.data.author_name} (${validated.data.author_email})</p>
                        <p><strong>Affiliation:</strong> ${validated.data.affiliation}</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;" />
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/submissions/${result.submissionId}" 
                           style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                           ACCESS CORE CONSOLE
                        </a>
                    </div>
                `
            })
        ]);

        return { success: true, paperId: result.paperId };

    } catch (error: any) {
        console.error("CRITICAL MISSION FAILURE:", error);
        return { error: "Submission transmission failed: " + error.message };
    }
}
