"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";

export async function getMessages() {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
        return rows;
    } catch (error: any) {
        console.error("Get Messages Error:", error);
        return [];
    }
}

export async function updateMessageStatus(id: number, status: string) {
    try {
        await pool.execute(
            'UPDATE contact_messages SET status = ? WHERE id = ?',
            [status, id]
        );
        revalidatePath('/admin/messages');
        return { success: true };
    } catch (error: any) {
        console.error("Update Message Status Error:", error);
        return { error: "Failed to update message: " + error.message };
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
