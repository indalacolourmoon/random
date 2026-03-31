"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { safeDeleteFile } from "@/lib/fs-utils";

export async function getEditorialBoard() {
    try {
        const [rows]: any = await pool.execute(
            'SELECT full_name, designation, institute, email, role, nationality FROM users WHERE role IN ("admin", "editor", "reviewer") AND password_hash IS NOT NULL AND invitation_token IS NULL ORDER BY role ASC, full_name ASC'
        );
        return rows;
    } catch (error: any) {
        if (error.code === 'ETIMEDOUT') {
            console.error("Build-time DB Connection Timeout (Editorial Board) - Skipping");
        } else {
            console.error("Get Editorial Board Error:", error);
        }
        return [];
    }
}

export async function getUsers(role?: string) {
    try {
        let query = 'SELECT id, email, full_name, role, created_at FROM users';
        const params = [];
        if (role) {
            query += ' WHERE role = ?';
            params.push(role);
        }
        const [rows]: any = await pool.execute(query, params);
        return rows;
    } catch (error: any) {
        console.error("Get Users Error:", error);
        return [];
    }
}

import crypto from 'crypto';
import { sendEmail } from '@/lib/mail';

export async function createUser(formData: FormData) {
    const email = formData.get('email') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as string;

    try {
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 24); // 24 hours invitation

        await pool.execute(
            'INSERT INTO users (email, full_name, role, invitation_token, invitation_expires) VALUES (?, ?, ?, ?, ?)',
            [email, fullName, role, invitationToken, expires]
        );

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
    } catch (error: any) {
        console.error("Create User Error:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return { error: "Email already exists" };
        }
        return { error: "Failed to create user: " + error.message };
    }
}

export async function getPasswordSetupInfo(token: string) {
    try {
        const [rows]: any = await pool.execute(
            'SELECT email, full_name, role FROM users WHERE invitation_token = ? AND invitation_expires > NOW()',
            [token]
        );
        return rows[0] || null;
    } catch (error) {
        console.error("Get Setup Info Error:", error);
        return null;
    }
}

export async function setupPassword(formData: FormData) {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        // Update user and clear token
        const [result]: any = await pool.execute(
            'UPDATE users SET password_hash = ?, invitation_token = NULL, invitation_expires = NULL WHERE invitation_token = ? AND invitation_expires > NOW()',
            [passwordHash, token]
        );

        if (result.affectedRows === 0) {
            return { error: "Link expired or invalid" };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Setup Password Error:", error);
        return { error: "Failed to setup password: " + error.message };
    }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function requestPasswordReset(formData: FormData) {
    const email = formData.get('email') as string;

    try {
        const [users]: any = await pool.execute(
            'SELECT id, full_name FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            // Success even if not found for security, but we can log internally
            return { success: true };
        }

        const user = users[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // 1 hour for reset

        await pool.execute(
            'UPDATE users SET invitation_token = ?, invitation_expires = ? WHERE id = ?',
            [resetToken, expires, user.id]
        );

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
                    <p>Dear ${user.full_name},</p>
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
    } catch (error: any) {
        console.error("Reset Request Error:", error);
        return { error: "Failed to process reset request" };
    }
}

export async function deleteUser(id: number) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const session: any = await getServerSession(authOptions);

        if (!session) {
            await connection.rollback();
            connection.release();
            return { error: "Unauthorized" };
        }

        // Prevent self-deletion
        if (Number(session.user.id) === Number(id)) {
            await connection.rollback();
            connection.release();
            return { error: "You cannot delete your own administrative account while logged in." };
        }

        // Optional: Check if the current user is an admin
        if (session.user.role !== 'admin') {
            await connection.rollback();
            connection.release();
            return { error: "Only administrators can revoke staff access." };
        }

        // 3. Delete Photo and User
        const [user]: any = await connection.execute('SELECT photo_url FROM users WHERE id = ?', [id]);
        
        await connection.execute('DELETE FROM users WHERE id = ?', [id]);
        
        await connection.commit();

        // Cleanup file after commit
        if (user.length > 0 && user[0].photo_url) {
            await safeDeleteFile(user[0].photo_url);
        }

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        await connection.rollback();
        console.error("Delete User Error:", error);
        return { error: "Failed to delete user" };
    } finally {
        connection.release();
    }
}

import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function getUserProfile() {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session?.user) return null;

        const [rows]: any = await pool.execute(
            'SELECT id, email, full_name, designation, institute, phone, bio, photo_url, role, nationality FROM users WHERE id = ?',
            [session.user.id]
        );

        return rows[0] || null;
    } catch (error) {
        console.error("Get User Profile Error:", error);
        return null;
    }
}

export async function updateUserProfile(formData: FormData) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const session: any = await getServerSession(authOptions);
        if (!session?.user) {
            await connection.rollback();
            connection.release();
            return { error: "Unauthorized" };
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

        await connection.execute(
            'UPDATE users SET full_name = ?, designation = ?, institute = ?, phone = ?, bio = ?, photo_url = ?, nationality = ? WHERE id = ?',
            [fullName, designation, institute, phone, bio, photoUrl, nationality, session.user.id]
        );

        await connection.commit();

        // Cleanup old photo after successful DB update
        if (oldPhotoUrl) {
            await safeDeleteFile(oldPhotoUrl);
        }

        revalidatePath(`/${session.user.role}/profile`);
        return { success: true };
    } catch (error: any) {
        await connection.rollback();
        console.error("Update User Profile Error:", error);
        return { error: "Failed to update profile: " + error.message };
    } finally {
        connection.release();
    }
}

export async function checkUserEmail(email: string) {
    try {
        const [rows]: any = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        return { exists: rows.length > 0 };
    } catch (error) {
        console.error("Check User Email Error:", error);
        return { error: "Check failed" };
    }
}
