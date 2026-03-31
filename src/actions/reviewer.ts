"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { sendEmail } from "@/lib/mail";
import { safeDeleteFile } from "@/lib/fs-utils";

const schema = z.object({
    fullName: z.string().min(2),
    designation: z.string().min(2),
    institute: z.string().min(2),
    email: z.email(),
    application_type: z.enum(['reviewer', 'editor']).default('reviewer'),
    nationality: z.string().min(2),
});

export async function submitReviewerApplication(formData: FormData) {
    const fullName = formData.get("fullName") as string;
    const designation = formData.get("designation") as string;
    const institute = formData.get("institute") as string;
    const email = formData.get("email") as string;
    const application_type = formData.get("application_type") as string;
    const nationality = formData.get("nationality") as string;
    const cv = formData.get("cv") as File;
    const photo = formData.get("photo") as File;
    const researchInterestsStr = formData.get("research_interests") as string;

    // Validate textual data
    const validation = schema.safeParse({ fullName, designation, institute, email, application_type, nationality });
    if (!validation.success) {
        return { error: "Please fill in all required fields correctly." };
    }

    // Validate files
    if (!cv || cv.size === 0) return { error: "Please upload your CV." };
    if (!photo || photo.size === 0) return { error: "Please upload your Photo." };

    let cvUrl: string | null = null;
    let photoUrl: string | null = null;

    try {
        // Save files to public/uploads
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "reviewer-apps");
        await mkdir(uploadsDir, { recursive: true });

        const cvName = `${Date.now()}-${cv.name.replace(/\s/g, '-')}`;
        const photoName = `${Date.now()}-${photo.name.replace(/\s/g, '-')}`;

        await writeFile(path.join(uploadsDir, cvName), Buffer.from(await cv.arrayBuffer()));
        await writeFile(path.join(uploadsDir, photoName), Buffer.from(await photo.arrayBuffer()));

        cvUrl = `/uploads/reviewer-apps/${cvName}`;
        photoUrl = `/uploads/reviewer-apps/${photoName}`;

        // Save to Database
        const [result] = await pool.execute(
            `INSERT INTO applications (full_name, designation, institute, email, cv_url, photo_url, application_type, nationality) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [fullName, designation, institute, email, cvUrl, photoUrl, application_type, nationality]
        );

        const applicationId = (result as any).insertId;

        // Persist Normalized Research Interests
        if (researchInterestsStr && applicationId) {
            try {
                const interests = JSON.parse(researchInterestsStr) as string[];
                if (Array.isArray(interests) && interests.length > 0) {
                    // Optimized batch insert for MySQL
                    const placeholders = interests.map(() => "(?, ?)").join(", ");
                    const values = interests.flatMap(interest => [applicationId, interest]);
                    await pool.execute(
                        `INSERT INTO application_interests (application_id, interest) VALUES ${placeholders}`,
                        values
                    );
                }
            } catch (pErr) {
                console.error("Error parsing/saving interests:", pErr);
                // Non-blocking for the main application
            }
        }

        // Notify Admin via Email
        const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reviewer-applications`;
        const roleName = application_type === 'editor' ? 'Editor' : 'Reviewer';

        sendEmail({
            to: process.env.EMAIL_FROM || 'admin@ijitest.org', // Send to admin
            subject: `New ${roleName} Application: ${fullName}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>New ${roleName} Application</h2>
                    <p><strong>Name:</strong> ${fullName}</p>
                    <p><strong>Role:</strong> ${roleName}</p>
                    <p><strong>Institute:</strong> ${institute}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p>Please review the application in the admin panel.</p>
                    <a href="${adminUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Application</a>
                </div>
            `
        });

        // Confirmation to Applicant
        sendEmail({
            to: email,
            subject: `Application Received | IJITEST ${roleName} Board`,
            html: `
                <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6d0202; margin-bottom: 10px;">IJITEST</h1>
                        <p style="color: #666; font-size: 14px; text-transform: ; letter-spacing: 0.2em;">${roleName} Board Application</p>
                    </div>
                    <p>Dear ${fullName},</p>
                    <p>Thank you for applying to join the ${application_type === 'editor' ? 'Editorial' : 'Review'} Board of <strong>IJITEST</strong>.</p>
                    <p>We have received your application and details. Our editorial team will review your profile and academic background.</p>
                    <p>You will receive a follow-up email regarding the status of your application within 24-48 hours.</p>
                    <div style="margin-top: 40px; border-top: 1px solid #eee; pt: 30px; text-align: center;">
                        <p style="color: #999; font-size: 11px;">International Journal of Innovative Trends in Engineering Science and Technology</p>
                    </div>
                </div>
            `
        });

        return { success: true };
    } catch (error: any) {
        console.error("Application Error:", error);

        // Rollback: Delete uploaded assets
        if (cvUrl) await safeDeleteFile(cvUrl);
        if (photoUrl) await safeDeleteFile(photoUrl);

        if (error.code === 'ER_DUP_ENTRY') {
            return { error: "An application with this email already exists." };
        }
        return { error: "Failed to submit application. Please try again." };
    }
}
