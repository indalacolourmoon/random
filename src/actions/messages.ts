"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getMessages(filters?: { status?: string, search?: string }) {
    try {
        let query = `
            SELECT 
                m.id, 
                m.name, 
                m.email, 
                m.subject, 
                m.message, 
                m.status, 
                m.created_at as createdAt, 
                m.resolved_at as resolvedAt, 
                m.resolved_by as resolvedBy,
                u.full_name as resolvedByName 
            FROM contact_messages m 
            LEFT JOIN users u ON m.resolved_by = u.id
        `;
        const params: any[] = [];
        const whereClauses: string[] = [];

        if (filters?.status && filters.status !== 'all') {
            whereClauses.push("m.status = ?");
            params.push(filters.status);
        }

        if (filters?.search) {
            whereClauses.push("(m.name LIKE ? OR m.email LIKE ? OR m.subject LIKE ?)");
            const searchPattern = `%${filters.search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        if (whereClauses.length > 0) {
            query += " WHERE " + whereClauses.join(" AND ");
        }

        query += " ORDER BY m.created_at DESC";

        const [rows]: any = await pool.execute(query, params);
        return rows;
    } catch (error: any) {
        console.error("Get Messages Error:", error);
        return [];
    }
}

export async function updateMessageStatus(id: number, status: 'resolved' | 'archived' | 'read') {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error("Unauthorized: Admin session required.");
    }
    const adminId = (session.user as any).id;

    try {
        if (status === 'resolved') {
            await pool.execute(
                'UPDATE contact_messages SET status = ?, resolved_at = NOW(), resolved_by = ? WHERE id = ?',
                [status, adminId, id]
            );
        } else {
            // Archived or Read - don't overwrite resolved info if it exists
            await pool.execute(
                'UPDATE contact_messages SET status = ? WHERE id = ?',
                [status, id]
            );
        }
        revalidatePath('/admin/messages');
        return { success: true };
    } catch (error: any) {
        console.error("Update Message Status Error:", error);
        return { error: "Failed to update message" };
    }
}

export async function bulkUpdateMessageStatus(ids: number[], status: 'resolved' | 'archived' | 'read') {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error("Unauthorized: Admin session required.");
    }
    const adminId = (session.user as any).id;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        for (const id of ids) {
            if (status === 'resolved') {
                await connection.execute(
                    'UPDATE contact_messages SET status = ?, resolved_at = NOW(), resolved_by = ? WHERE id = ?',
                    [status, adminId, id]
                );
            } else {
                await connection.execute(
                    'UPDATE contact_messages SET status = ? WHERE id = ?',
                    [status, id]
                );
            }
        }

        await connection.commit();
        revalidatePath('/admin/messages');
        return { success: true, count: ids.length };
    } catch (error: any) {
        await connection.rollback();
        console.error("Bulk Update Message Error:", error);
        return { error: "Bulk operation failed" };
    } finally {
        connection.release();
    }
}

export async function revertMessageStatus(id: number) {
    try {
        await pool.execute(
            'UPDATE contact_messages SET status = "pending", resolved_at = NULL, resolved_by = NULL WHERE id = ?',
            [id]
        );
        revalidatePath('/admin/messages');
        return { success: true };
    } catch (error: any) {
        console.error("Revert Message Error:", error);
        return { error: "Failed to revert message" };
    }
}

export async function deleteMessage(id: number) {
    try {
        await pool.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
        revalidatePath('/admin/messages');
        return { success: true };
    } catch (error: any) {
        console.error("Delete Message Error:", error);
        return { error: "Failed to delete message: " + error.message };
    }
}

export async function submitContactMessage(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    try {
        await pool.execute(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );

        // 1. Auto-reply to visitor
        sendEmail({
            to: email,
            subject: `Receipt Confirmation: ${subject}`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6d0202;">Message Received</h2>
                    <p>Dear ${name},</p>
                    <p>Thank you for reaching out to IJITEST. We have received your inquiry regarding "<strong>${subject}</strong>".</p>
                    <p>Our editorial team will review your message and get back to you shortly.</p>
                    <p>Best regards,<br>IJITEST Support Team</p>
                </div>
            `
        });

        // 2. Notify Admin
        sendEmail({
            to: process.env.SMTP_USER as string,
            subject: `New Contact Inquiry: ${subject}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; background: #f9f9f9;">
                    <h3>New inquiry from ${name} (${email})</h3>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong></p>
                    <blockquote style="border-left: 4px solid #6d0202; padding-left: 15px; color: #555;">${message}</blockquote>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/messages">View in Admin Panel</a></p>
                </div>
            `
        });

        revalidatePath('/admin/messages');
        return { success: true };
    } catch (error: any) {
        console.error("Submit Message Error:", error);
        return { error: "Failed to send message: " + error.message };
    }
}
