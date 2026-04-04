"use server";

import { db } from "@/lib/db";
import { 
    applications, 
    users, 
    userProfiles, 
    userInvitations,
    applicationInterests 
} from "@/db/schema";
import { 
    Application, 
    ActionResponse 
} from "@/db/types";
import { eq, and, desc, SQL, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import crypto from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Fetch all applications with optional filters
 */
export async function getApplications(filters?: { role?: string, status?: string, interest?: string }): Promise<ActionResponse<Application[]>> {
    try {
        const whereClauses: SQL[] = [];
        
        if (filters?.role && filters.role !== 'all') {
            whereClauses.push(eq(applications.type, filters.role as "editor" | "reviewer"));
        }
        if (filters?.status && filters.status !== 'all') {
            whereClauses.push(eq(applications.status, filters.status as "pending" | "approved" | "rejected"));
        }

        // 1. Fetch base applications
        const apps = await db.select()
            .from(applications)
            .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
            .orderBy(desc(applications.createdAt));

        // 2. Fetch all interests for these applications
        const appIds = apps.map(a => a.id);
        if (appIds.length === 0) return { success: true, data: [] };

        const allInterests = await db.query.applicationInterests.findMany({
            where: inArray(applicationInterests.applicationId, appIds),
            with: { interest: true }
        });

        // 3. Map interests back to applications
        const mappedData: Application[] = apps.map(app => {
            const appInterests = allInterests
                .filter(i => i.applicationId === app.id)
                .map(i => i.interest.name);
            
            return {
                ...app,
                research_interests: appInterests
            };
        });

        // 4. Client-side filter for interest if needed (since it's a join/relation filter)
        // Note: For large datasets, this should be done in SQL with an EXISTS clause.
        let finalData = mappedData;
        if (filters?.interest) {
            const search = filters.interest.toLowerCase();
            finalData = mappedData.filter(app => 
                app.research_interests?.some(interest => interest.toLowerCase().includes(search))
            );
        }

        return { success: true, data: finalData };
    } catch (error) {
        const message = error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error);
        console.error("Get Applications Error:", error);
        return { success: false, error: message };
    }
}

/**
 * Approve an application and create a user account
 */
export async function approveApplication(id: number): Promise<ActionResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        throw new Error("Unauthorized: Admin session required.");
    }
    const adminId = session.user.id;

    try {
        const result = await db.transaction(async (tx) => {
            const appRows = await tx.select().from(applications).where(eq(applications.id, id)).limit(1);
            const app = appRows[0];
            
            if (!app) return { success: false, error: "Application not found" };
            if (app.status !== 'pending') return { success: false, error: `Application is already ${app.status}` };

            const role = (app.type || 'reviewer') as 'editor' | 'reviewer';
            const invitationToken = crypto.randomBytes(32).toString('hex');
            const expires = new Date();
            expires.setHours(expires.getHours() + 24);

            const userId = crypto.randomUUID();

            // 1. Create User
            await tx.insert(users).values({
                id: userId,
                email: app.email,
                role: role,
            });

            // 2. Create Profile
            await tx.insert(userProfiles).values({
                userId: userId,
                fullName: app.fullName,
                designation: app.designation,
                institute: app.institute,
                nationality: 'India',
            });

            // 3. Create Invitation
            await tx.insert(userInvitations).values({
                email: app.email,
                role: role,
                token: invitationToken,
                expiresAt: expires,
                invitedBy: adminId,
            });

            // 4. Update Application Status
            await tx.update(applications)
                .set({ 
                    status: 'approved', 
                    reviewedAt: new Date(), 
                    reviewedBy: adminId 
                })
                .where(eq(applications.id, id));

            return { success: true, app, role, invitationToken };
        });

        if (!result.success) return result as ActionResponse;

        const { app, role, invitationToken } = result as { app: Application, role: string, invitationToken: string };

        // 5. Send Invitation Email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const setupUrl = `${baseUrl}/auth/setup-password?token=${invitationToken}&ctx=setup`;
        const portalUrl = `${baseUrl}/${role}`;

        await sendEmail({
            to: app.email,
            subject: `Welcome to IJITEST | ${role.charAt(0).toUpperCase() + role.slice(1)} Portal Invitation`,
            html: `
                <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6d0202; margin-bottom: 10px;">IJITEST</h1>
                        <p style="color: #666; font-size: 14px; letter-spacing: 0.2em;">Board Enrollment</p>
                    </div>
                    <p>Dear ${app.fullName},</p>
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

        revalidatePath("/admin/applications");
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error);
        console.error("Approve Application Error:", error);
        return { success: false, error: "Failed to approve application: " + message };
    }
}

/**
 * Reject an application
 */
export async function rejectApplication(id: number, reason: string): Promise<ActionResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        throw new Error("Unauthorized: Admin session required.");
    }
    const adminId = session.user.id;

    if (!reason || reason.trim().length < 20) {
        return { success: false, error: "Rejection reason must be at least 20 characters long." };
    }

    try {
        const appRows = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
        const app = appRows[0];
        if (!app) return { success: false, error: "Application not found" };

        if (app.status !== 'pending') {
            return { success: false, error: `Application is already ${app.status}` };
        }
        
        const role = app.type || 'reviewer';

        // 1. Send Rejection Email
        await sendEmail({
            to: app.email,
            subject: `Application Update | IJITEST ${role.charAt(0).toUpperCase() + role.slice(1)} Board`,
            html: `
                <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6d0202; margin-bottom: 10px;">IJITEST</h1>
                    </div>
                    <p>Dear ${app.fullName},</p>
                    <p>Thank you for your interest in joining the <strong>IJITEST ${role} board</strong>.</p>
                    <p>After careful review of your profile and academic background, we regret to inform you that we cannot proceed with your application at this time.</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p>While we appreciate your professional expertise, we suggest you continue to contribute to our journal through research submissions, and you may apply again in the future.</p>
                    <p style="color: #666; font-size: 12px;">We wish you the very best in your academic endeavors.</p>
                    <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 30px; text-align: center;">
                        <p style="color: #999; font-size: 11px;">International Journal of Innovative Trends in Engineering Science and Technology</p>
                    </div>
                </div>
            `
        });

        // 2. Update status to rejected
        await db.update(applications)
            .set({ 
                status: 'rejected', 
                reviewedAt: new Date(), 
                reviewedBy: adminId 
            })
            .where(eq(applications.id, id));

        revalidatePath("/admin/applications");
        return { success: true };
    } catch (error) {
        console.error("Reject Application Error:", error);
        return { success: false, error: "Failed to reject application" };
    }
}

/**
 * Bulk approve applications
 */
export async function bulkApproveApplications(ids: number[]): Promise<ActionResponse<{ successCount: number, failCount: number, errors: string[] }>> {
    const results = { successCount: 0, failCount: 0, errors: [] as string[] };

    for (const id of ids) {
        try {
            const res = await approveApplication(id);
            if (res.success) results.successCount++;
            else results.errors.push(`ID ${id}: ${res.error}`);
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            results.errors.push(`ID ${id}: ${message}`);
        }
    }

    revalidatePath("/admin/applications");
    revalidatePath("/admin/users");
    return { success: true, data: results };
}

/**
 * Bulk reject applications
 */
export async function bulkRejectApplications(ids: number[], reason: string): Promise<ActionResponse<{ successCount: number, failCount: number, errors: string[] }>> {
    if (!reason || reason.trim().length < 20) {
        return { success: false, error: "Rejection reason must be at least 20 characters long." };
    }

    const results = { successCount: 0, failCount: 0, errors: [] as string[] };

    for (const id of ids) {
        try {
            const res = await rejectApplication(id, reason);
            if (res.success) results.successCount++;
            else results.errors.push(`ID ${id}: ${res.error}`);
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            results.errors.push(`ID ${id}: ${message}`);
        }
    }

    revalidatePath("/admin/applications");
    return { success: true, data: results };
}
