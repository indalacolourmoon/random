"use server";

import pool from "@/lib/db";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";
import { safeDeleteFile } from "@/lib/fs-utils";

const submissionSchema = z.object({
    author_name: z.string().min(2),
    author_email: z.string().email(),
    affiliation: z.string().min(2),
    title: z.string().min(10),
    abstract: z.string().min(50),
    keywords: z.string().min(5),
    co_authors: z.string().optional(),
});

export async function submitPaper(formData: FormData) {
    let relativePath: string | null = null;
    try {
        // 1. Extract and validate form data
        const data = {
            author_name: formData.get("author_name") as string,
            author_email: formData.get("author_email") as string,
            affiliation: formData.get("affiliation") as string,
            title: formData.get("title") as string,
            abstract: formData.get("abstract") as string,
            keywords: formData.get("keywords") as string,
            co_authors: formData.get("co_authors") as string,
        };

        const result = submissionSchema.safeParse(data);
        if (!result.success) {
            return { error: "Invalid form data" };
        }

        const file = formData.get("manuscript") as File;
        if (!file) {
            return { error: "No manuscript file uploaded" };
        }

        // 2. Handle File Upload (Local Storage)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads/submissions");
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);

        relativePath = `/uploads/submissions/${fileName}`;

        // 3. Generate Paper ID
        const year = new Date().getFullYear();
        const [rows]: any = await pool.execute('SELECT COUNT(*) as count FROM submissions');
        const count = rows[0].count;
        const paperId = `IJITEST-${year}-${String(count + 1).padStart(3, '0')}`;

        // 4. Insert into MySQL
        await pool.execute(
            'INSERT INTO submissions (paper_id, title, abstract, keywords, affiliation, author_name, author_email, file_path, status, co_authors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [paperId, data.title, data.abstract, data.keywords, data.affiliation, data.author_name, data.author_email, relativePath, 'submitted', data.co_authors || null]
        );

        // 5. Send Confirmation Emails
        const template = emailTemplates.submissionReceived(data.author_name, data.title, paperId);

        // Notify Author
        sendEmail({
            to: data.author_email,
            subject: template.subject,
            html: template.html
        });

        // Notify Admin
        sendEmail({
            to: process.env.SMTP_USER as string,
            subject: `NEW SUBMISSION: ${paperId}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; background: #f9f9f9; border-radius: 10px;">
                    <h2 style="color: #6d0202;">New Manuscript Submitted</h2>
                    <p><strong>Paper ID:</strong> ${paperId}</p>
                    <p><strong>Title:</strong> ${data.title}</p>
                    <p><strong>Author:</strong> ${data.author_name} (${data.author_email})</p>
                    <p><strong>Affiliation:</strong> ${data.affiliation}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/submissions" style="background: #6d0202; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review in Admin Panel</a></p>
                </div>
            `
        });

        revalidatePath('/admin');
        return { success: true, paperId };

    } catch (error: any) {
        console.error("Submission Error:", error);
        if (relativePath) {
            await safeDeleteFile(relativePath);
        }
        return { error: "Failed to process submission. " + error.message };
    }
}
