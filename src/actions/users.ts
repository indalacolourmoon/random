"use server";

import { db } from "@/lib/db";
import { 
    users, 
    userProfiles, 
    userInvitations,
    reviewAssignments,
    submissionEditors,
    reviews,
} from "@/db/schema";
import { 
    UserWithProfile, 
    SafeUserWithProfile,
    ActionResponse,
} from "@/db/types";
import { eq, and, sql, inArray, isNotNull, not } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { safeDeleteFile } from "@/lib/fs-utils";

export async function getEditorialBoard(): Promise<ActionResponse<SafeUserWithProfile[]>> {
    try {
        const rows = await db.select({
            user: {
                id: users.id,
                email: users.email,
                role: users.role,
                isActive: users.isActive,
                isEmailVerified: users.isEmailVerified,
                emailVerifiedAt: users.emailVerifiedAt,
                hasSeenPromotion: users.hasSeenPromotion,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
                deletedAt: users.deletedAt,
            },
            profile: userProfiles,
        })
        .from(users)
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(
            and(
                inArray(users.role, ["admin", "editor", "reviewer"]),
                isNotNull(users.passwordHash),
                eq(users.isActive, true)
            )
        )
        .orderBy(users.role, userProfiles.fullName);

        const data: SafeUserWithProfile[] = rows.map(r => ({
            ...r.user,
            profile: r.profile
        }));
        return { success: true, data };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Get Editorial Board Error:", error);
        return { success: false, error: message };
    }
}

export async function getUsers(role?: "admin" | "editor" | "reviewer" | "author"): Promise<ActionResponse<SafeUserWithProfile[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return { success: false, error: "Unauthorized" };
        }

        const query = db.select({
            user: {
                id: users.id,
                email: users.email,
                role: users.role,
                isActive: users.isActive,
                isEmailVerified: users.isEmailVerified,
                emailVerifiedAt: users.emailVerifiedAt,
                hasSeenPromotion: users.hasSeenPromotion,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
                deletedAt: users.deletedAt,
            },
            profile: userProfiles,
        })
        .from(users)
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId));

        if (role) {
            query.where(eq(users.role, role));
        } else {
            query.where(not(eq(users.role, 'author')));
        }

        const rows = await query;
        const data: SafeUserWithProfile[] = rows.map(r => ({
            ...r.user,
            profile: r.profile
        }));
        return { success: true, data };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Get Users Error:", error);
        return { success: false, error: message };
    }
}

import crypto from 'crypto';
import { sendEmail } from '@/lib/mail';

export async function createUser(formData: FormData): Promise<ActionResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
        return { success: false, error: "Unauthorized" };
    }

    const email = formData.get('email') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as "admin" | "editor" | "reviewer" | "author";

    try {
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);

        const userId = crypto.randomUUID();

        await db.transaction(async (tx) => {
            await tx.insert(users).values({
                id: userId,
                email,
                role,
            });

            await tx.insert(userProfiles).values({
                userId,
                fullName,
            });

            // Only editor/reviewer roles can receive invitations
            if (role === 'editor' || role === 'reviewer') {
                await tx.insert(userInvitations).values({
                    email,
                    role: role,
                    token: invitationToken,
                    expiresAt: expires,
                });
            }
        });

        // Send invitation email
        const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/setup-password?token=${invitationToken}`;

        sendEmail({
            to: email,
            subject: 'Account Verification | IJITEST Hub',
            html: `
                <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6d0202; margin-bottom: 10px;">IJITEST</h1>
                        <p style="color: #666; font-size: 14px; text-transform: ; letter-spacing: 0.2em;">Editorial Management Hub</p>
                    </div>
                    <p>Dear ${fullName},</p>
                    <p>You have been invited to join the <strong>IJITEST</strong> editorial team as <strong>${role}</strong>.</p>
                    <p>To finalize your account setup, please click the button below to secure your account:</p>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${setupUrl}" style="background: #6d0202; color: white; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 10px 20px -5px rgba(109,2,2,0.3);">Secure My Account</a>
                    </div>
                    <p style="color: #666; font-size: 12px; font-style: ;">This invitation link will expire in 24 hours.</p>
                    <div style="margin-top: 40px; border-top: 1px solid #eee; pt: 30px; text-align: center;">
                        <p style="color: #999; font-size: 11px;">International Journal of Innovative Trends in Engineering Science and Technology</p>
                    </div>
                </div>
            `
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Create User Error:", error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
            return { success: false, error: "Email already exists" };
        }
        return { success: false, error: "Failed to create user: " + message };
    }
}

export async function getPasswordSetupInfo(token: string): Promise<ActionResponse<{ email: string, role: string, fullName: string }>> {
    try {
        const invitation = await db.select({
            email: userInvitations.email,
            role: userInvitations.role,
            fullName: userProfiles.fullName,
        })
        .from(userInvitations)
        .innerJoin(users, eq(userInvitations.email, users.email))
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(
            and(
                eq(userInvitations.token, token),
                sql`${userInvitations.expiresAt} > NOW()`
            )
        )
        .limit(1);

        if (!invitation[0]) return { success: false, error: "Link expired or invalid" };
        return { success: true, data: invitation[0] };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Get Setup Info Error:", error);
        return { success: false, error: message };
    }
}

export async function setupPassword(formData: FormData): Promise<ActionResponse> {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        return await db.transaction(async (tx) => {
            const invitation = await tx.select()
                .from(userInvitations)
                .where(
                    and(
                        eq(userInvitations.token, token),
                        sql`${userInvitations.expiresAt} > NOW()`
                    )
                )
                .limit(1);

            if (!invitation[0]) {
                return { success: false, error: "Link expired or invalid" };
            }

            await tx.update(users)
                .set({ passwordHash, isEmailVerified: true, emailVerifiedAt: new Date() })
                .where(eq(users.email, invitation[0].email));

            await tx.delete(userInvitations)
                .where(eq(userInvitations.token, token));

            return { success: true };
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Setup Password Error:", error);
        return { success: false, error: "Failed to setup password: " + message };
    }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function requestPasswordReset(formData: FormData): Promise<ActionResponse> {
    const email = formData.get('email') as string;

    try {
        const userResult = await db.select({
            id: users.id,
            role: users.role,
            fullName: userProfiles.fullName,
        })
        .from(users)
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(eq(users.email, email))
        .limit(1);

        const user = userResult[0];
        if (!user) {
            return { success: true }; // Security: don't reveal if user exists
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);

        // Delete any existing reset tokens for this email first
        await db.delete(userInvitations).where(eq(userInvitations.email, email));

        await db.insert(userInvitations).values({
            email,
            role: (user.role === 'editor' || user.role === 'reviewer') ? user.role : 'reviewer',
            token: resetToken,
            expiresAt: expires,
        });

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/setup-password?token=${resetToken}&ctx=reset`;

        sendEmail({
            to: email,
            subject: 'Reset Your Password | IJITEST',
            html: `
                <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6d0202; margin-bottom: 10px;">IJITEST</h1>
                        <p style="color: #666; font-size: 14px; text-transform: ; letter-spacing: 0.2em;">Password Recovery</p>
                    </div>
                    <p>Dear ${user.fullName},</p>
                    <p>We received a request to reset your password for the <strong>IJITEST</strong> editorial portal.</p>
                    <p>To set a new password, please click the button below:</p>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetUrl}" style="background: #6d0202; color: white; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 10px 20px -5px rgba(109,2,2,0.3);">Create New Password</a>
                    </div>
                    <p style="color: #666; font-size: 12px; font-style: ;">This recovery link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
                    <div style="margin-top: 40px; border-top: 1px solid #eee; pt: 30px; text-align: center;">
                        <p style="color: #999; font-size: 11px;">International Journal of Innovative Trends in Engineering Science and Technology</p>
                    </div>
                </div>
            `
        });

        return { success: true };
    } catch (error) {
        console.error("Reset Request Error:", error);
        return { success: false, error: "Failed to process reset request" };
    }
}

export async function updateUserRole(userId: string, role: "admin" | "editor" | "reviewer" | "author"): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return { success: false, error: "Unauthorized: Admin access required." };
        }

        // Prevent self-demotion or role change to protect administrative access
        if (session.user.id === userId) {
            return { success: false, error: "You cannot change your own role while active." };
        }

        await db.update(users)
            .set({ role })
            .where(eq(users.id, userId));

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Update User Role Error:", error);
        return { success: false, error: "Failed to update role" };
    }
}

export async function deleteUser(id: string): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        if (session.user.id === id) {
            return { success: false, error: "You cannot delete your own account while logged in." };
        }

        if (!['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Only admins and editors can remove staff." };
        }

        return await db.transaction(async (tx) => {
            const profile = await tx.select({ photoUrl: userProfiles.photoUrl })
                .from(userProfiles)
                .where(eq(userProfiles.userId, id))
                .limit(1);

            // 1. Remove reviewer assignments (reviews cascade from assignments)
            //    Get assignment IDs first so we can delete reviews that reference them
            const assignmentIds = await tx
                .select({ id: reviewAssignments.id })
                .from(reviewAssignments)
                .where(eq(reviewAssignments.reviewerId, id));

            if (assignmentIds.length > 0) {
                const ids = assignmentIds.map(a => a.id);
                await tx.delete(reviews).where(inArray(reviews.assignmentId, ids));
                await tx.delete(reviewAssignments).where(eq(reviewAssignments.reviewerId, id));
            }

            // Also clean up any assignments where this user was the assigner
            await tx.delete(reviewAssignments).where(eq(reviewAssignments.assignedBy, id));

            // 2. Remove editor assignments to submissions
            await tx.delete(submissionEditors).where(eq(submissionEditors.editorId, id));

            // 3. Delete user profile + user (cascade handles userProfiles, notifications, activityLogs)
            await tx.delete(users).where(eq(users.id, id));

            if (profile[0]?.photoUrl) {
                await safeDeleteFile(profile[0].photoUrl);
            }

            revalidatePath('/admin/users');
            return { success: true };
        });
    } catch (error) {
        console.error("Delete User Error:", error);
        return { success: false, error: "Failed to delete user" };
    }
}

import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function getUserProfile(): Promise<ActionResponse<UserWithProfile>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };

        const result = await db.select({
            user: users,
            profile: userProfiles,
        })
        .from(users)
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(eq(users.id, session.user.id))
        .limit(1);

        if (!result[0]) return { success: false, error: "User not found" };

        const data: UserWithProfile = {
            ...result[0].user,
            profile: result[0].profile
        };
        return { success: true, data };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Get User Profile Error:", error);
        return { success: false, error: message };
    }
}

export async function updateUserProfile(formData: FormData): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const fullName = formData.get('fullName') as string;
        const designation = formData.get('designation') as string;
        const institute = formData.get('institute') as string;
        const phone = formData.get('phone') as string;
        const bio = formData.get('bio') as string;
        const nationality = formData.get('nationality') as string;
        const photo = formData.get('photo') as File;

        let photoUrl = formData.get('existingPhotoUrl') as string;
        let oldPhotoUrl: string | null = null;

        if (photo && photo.size > 0) {
            const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles");
            await mkdir(uploadsDir, { recursive: true });

            const fileName = `${session.user.id}-${Date.now()}-${photo.name.replace(/\s/g, '-')}`;
            await writeFile(path.join(uploadsDir, fileName), Buffer.from(await photo.arrayBuffer()));

            if (photoUrl) {
                oldPhotoUrl = photoUrl;
            }
            photoUrl = `/uploads/profiles/${fileName}`;
        }

        await db.update(userProfiles)
            .set({
                fullName,
                designation,
                institute,
                phone,
                bio,
                photoUrl,
                nationality,
            })
            .where(eq(userProfiles.userId, session.user.id));

        if (oldPhotoUrl) {
            await safeDeleteFile(oldPhotoUrl);
        }

        revalidatePath(`/${session.user.role}/profile`);
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Update User Profile Error:", error);
        return { success: false, error: "Failed to update profile: " + message };
    }
}

export async function checkUserEmail(email: string): Promise<{ exists: boolean; error?: string }> {
    try {
        const result = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return { exists: result.length > 0 };
    } catch (error) {
        console.error("Check User Email Error:", error);
        return { error: "Check failed", exists: false };
    }
}
