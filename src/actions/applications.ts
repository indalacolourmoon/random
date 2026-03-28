"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import crypto from "crypto";
import { safeDeleteFile } from "@/lib/fs-utils";

export async function getApplications() {
    try {
        const [rows]: any = await pool.execute(
            "SELECT * FROM applications WHERE status = 'pending' ORDER BY created_at DESC"
        );
        return rows;
    } catch (error) {
        console.error("Get Applications Error:", error);
        return [];
    }
}

export async function approveApplication(id: number) {
    try {
        // 1. Get Application Details
        const [apps]: any = await pool.execute("SELECT * FROM applications WHERE id = ?", [id]);
        if (apps.length === 0) return { error: "Application not found" };

        const app = apps[0];
        const role = app.application_type || 'reviewer';

        // 2. Create User Profile details
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);

        // We transfer form details directly to users table
        await pool.execute(
            `INSERT INTO users (email, full_name, designation, institute, role, photo_url, nationality, invitation_token, invitation_expires) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [app.email, app.full_name, app.designation, app.institute, role, app.photo_url, app.nationality, invitationToken, expires]
        );

        // 3. Send Invitation Email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const setupUrl = `${baseUrl}/auth/setup-password?token=${invitationToken}`;
        const portalUrl = `${baseUrl}/${role}`;

        sendEmail({
            to: app.email,
            subject: `Welcome to IJITEST | ${role.charAt(0).toUpperCase() + role.slice(1)} Portal Invitation`,
            html: `
                <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6d0202; margin-bottom: 10px;">IJITEST</h1>
                        <p style="color: #666; font-size: 14px; letter-spacing: 0.2em;">Board Enrollment</p>
                    </div>
                    <p>Dear ${app.full_name},</p>
                    <p>We are pleased to inform you that your application to join the <strong>IJITEST ${role} board</strong> has been <strong>Accepted</strong>.</p>
                    <p>To finalize your enrollment and access your dashboard, please click the button below to secure your account and set your password:</p>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${setupUrl}" style="background: #0000FF; color: white; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">Set Up My Account</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">Once your password is set, you can access your dedicated dashboard at:<br><a href="${portalUrl}" style="color: #0000FF; text-decoration: none;"><strong>${portalUrl}</strong></a></p>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">This invitation link will expire in 24 hours.</p>
                    <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 30px; text-align: center;">
                        <p style="color: #999; font-size: 11px;">International Journal of Innovative Trends in Engineering Science and Technology</p>
                    </div>
                </div>
            `
        });

        // 4. Cleanup and Delete Application
        // Delete CV after successful enrollment (not needed anymore as data is in user profile)
        // Keep photo_url as it's transferred to the user profile
        await safeDeleteFile(app.cv_url);
        await pool.execute("DELETE FROM applications WHERE id = ?", [id]);

        revalidatePath("/admin/applications");
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Approve Application Error:", error);
        return { error: "Failed to approve application: " + error.message };
    }
}

export async function rejectApplication(id: number) {
    try {
        const [apps]: any = await pool.execute("SELECT * FROM applications WHERE id = ?", [id]);
        if (apps.length === 0) return { error: "Application not found" };

        const app = apps[0];
        const role = app.application_type || 'reviewer';

        // 1. Send Rejection Email
        sendEmail({
            to: app.email,
            subject: `Application Update | IJITEST ${role.charAt(0).toUpperCase() + role.slice(1)} Board`,
            html: `
                <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6d0202; margin-bottom: 10px;">IJITEST</h1>
                    </div>
                    <p>Dear ${app.full_name},</p>
                    <p>Thank you for your interest in joining the <strong>IJITEST ${role} board</strong>.</p>
                    <p>After careful review of your profile and academic background, we regret to inform you that we cannot proceed with your application at this time.</p>
                    <p>While we appreciate your professional expertise, we suggest you continue to contribute to our journal through research submissions, and you may apply again in the future.</p>
                    <p style="color: #666; font-size: 12px;">We wish you the very best in your academic endeavors.</p>
                    <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 30px; text-align: center;">
                        <p style="color: #999; font-size: 11px;">International Journal of Innovative Trends in Engineering Science and Technology</p>
                    </div>
                </div>
            `
        });

        // 2. Cleanup and Delete Application
        await safeDeleteFile(app.cv_url);
        await safeDeleteFile(app.photo_url);
        await pool.execute("DELETE FROM applications WHERE id = ?", [id]);

        revalidatePath("/admin/applications");
        return { success: true };
    } catch (error: any) {
        console.error("Reject Application Error:", error);
        return { error: "Failed to reject application" };
    }
}
