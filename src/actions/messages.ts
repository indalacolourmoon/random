"use server";

import { db } from "@/lib/db";
import { contactMessages } from "@/db/schema";
import { eq, and, like, or, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { ActionResponse } from "@/db/types";

export interface ContactMessageRow {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'pending' | 'resolved' | 'archived';
    createdAt: Date | null;
}

/**
 * Fetch contact messages for the admin panel with filtering and search.
 */
export async function getMessages(filters?: { status?: 'pending' | 'resolved' | 'archived', search?: string }): Promise<ActionResponse<ContactMessageRow[]>> {
    try {
        const whereConditions: import("drizzle-orm").SQL[] = [];

        if (filters?.status && filters.status !== ('all' as any)) {
            whereConditions.push(eq(contactMessages.status, filters.status));
        }

        if (filters?.search) {
            const pattern = `%${filters.search}%`;
            const searchClause = or(
                like(contactMessages.name, pattern),
                like(contactMessages.email, pattern),
                like(contactMessages.subject, pattern)
            );
            if (searchClause) {
                whereConditions.push(searchClause);
            }
        }

        const rows = await db.select({
            id: contactMessages.id,
            name: contactMessages.name,
            email: contactMessages.email,
            subject: contactMessages.subject,
            message: contactMessages.message,
            status: contactMessages.status,
            createdAt: contactMessages.createdAt,
        })
        .from(contactMessages)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(contactMessages.createdAt));

        return { success: true, data: rows as ContactMessageRow[] };
    } catch (error) {
        const message = error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error);
        console.error("Get Messages Error:", error);
        return { success: false, error: message };
    }
}

/**
 * Update the status of a contact message.
 */
export async function updateMessageStatus(id: number, status: 'resolved' | 'archived' | 'pending'): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return { success: false, error: "Unauthorized access." };
        }

        await db.update(contactMessages)
            .set({ status })
            .where(eq(contactMessages.id, id));

        revalidatePath('/admin/messages');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error);
        console.error("Update Message Status Error:", error);
        return { success: false, error: "Failed to update record: " + message };
    }
}

/**
 * Bulk update statuses for multiple messages.
 */
export async function bulkUpdateMessageStatus(ids: number[], status: 'resolved' | 'archived' | 'pending'): Promise<ActionResponse<{ count: number }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return { success: false, error: "Unauthorized access." };
        }

        await db.update(contactMessages)
            .set({ status })
            .where(inArray(contactMessages.id, ids));

        revalidatePath('/admin/messages');
        return { success: true, data: { count: ids.length } };
    } catch (error) {
        const message = error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error);
        console.error("Bulk Update Message Error:", error);
        return { success: false, error: message };
    }
}

/**
 * Delete a specific contact message.
 */
export async function deleteMessage(id: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return { success: false, error: "Unauthorized access." };
        }

        await db.delete(contactMessages).where(eq(contactMessages.id, id));
        revalidatePath('/admin/messages');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error);
        console.error("Delete Message Error:", error);
        return { success: false, error: message };
    }
}

/**
 * Revert a message back to pending status.
 */
export async function revertMessageStatus(id: number): Promise<ActionResponse> {
    return updateMessageStatus(id, 'pending');
}

/**
 * Public action: Submit a contact inquiry from the website.
 */
export async function submitContactMessage(formData: FormData): Promise<ActionResponse> {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
        return { success: false, error: "Name, email and message are required." };
    }

    try {
        await db.insert(contactMessages).values({
            name,
            email,
            subject,
            message,
            status: 'pending'
        });

        // 1. Auto-reply to visitor
        await sendEmail({
            to: email,
            subject: `Receipt Confirmation: ${subject || 'Contact Inquiry'}`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px;">
                    <h2 style="color: #6d0202;">Message Received</h2>
                    <p>Dear ${name},</p>
                    <p>Thank you for reaching out to IJITEST. We have received your inquiry regarding "<strong>${subject || 'General'}</strong>".</p>
                    <p>Our editorial team will review your message and get back to you shortly.</p>
                    <p>Best regards,<br>IJITEST Support Team</p>
                </div>
            `
        });

        // 2. Notify Admin
        const adminEmail = process.env.SMTP_USER;
        if (adminEmail) {
            await sendEmail({
                to: adminEmail,
                subject: `NEW INQUIRY: ${subject || 'Contact Form'}`,
                html: `
                    <div style="font-family: sans-serif; background: #f4f4f4; padding: 20px;">
                        <h3>New inquiry from ${name} (${email})</h3>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <p><strong>Message:</strong></p>
                        <blockquote style="border-left: 4px solid #6d0202; padding-left: 15px;">${message}</blockquote>
                    </div>
                `
            });
        }

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error);
        console.error("Submit Message Error:", error);
        return { success: false, error: message };
    }
}
