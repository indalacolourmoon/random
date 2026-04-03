"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPayments() {
    try {
        const rows: any = await db.execute(sql`
            SELECT p.*, s.title, s.paper_id, s.author_name, s.author_email 
            FROM payments p
            JOIN submissions s ON p.submission_id = s.id
            ORDER BY p.created_at DESC
        `);
        return rows[0] || [];
    } catch (error: any) {
        console.error("Get Payments Error:", error);
        return [];
    }
}

export async function updatePaymentStatus(paymentId: number, status: string, transactionId?: string) {
    try {
        await db.execute(
            sql`UPDATE payments SET status = ${status}, transaction_id = ${transactionId || null}, paid_at = IF(${status} = 'paid', CURRENT_TIMESTAMP, paid_at) WHERE id = ${paymentId}`
        );

        if (status === 'paid') {
            // Get submission ID
            const rows: any = await db.execute(sql`SELECT submission_id FROM payments WHERE id = ${paymentId}`);
            if (rows[0].length > 0) {
                await db.execute(sql`UPDATE submissions SET status = 'paid' WHERE id = ${rows[0][0].submission_id}`);
            }
        }
        revalidatePath('/admin/payments');
        return { success: true };
    } catch (error: any) {
        console.error("Update Payment Error:", error);
        return { error: "Failed to update payment: " + error.message };
    }
}

export async function initializePayment(submissionId: number, amount: number, currency: string = 'INR') {
    try {
        await db.execute(
            sql`INSERT INTO payments (submission_id, amount, currency, status) VALUES (${submissionId}, ${amount}, ${currency}, 'unpaid')`
        );
        revalidatePath('/admin/payments');
        return { success: true };
    } catch (error: any) {
        console.error("Initialize Payment Error:", error);
        return { error: "Failed to initialize payment: " + error.message };
    }
}

export async function getAcceptedUnpaidPapers() {
    try {
        const rows: any = await db.execute(sql`
            SELECT id, paper_id, title, author_name 
            FROM submissions 
            WHERE status = 'accepted' 
            AND id NOT IN (SELECT submission_id FROM payments)
        `);
        return rows[0] || [];
    } catch (error: any) {
        console.error("Get Accepted Unpaid Error:", error);
        return [];
    }
}

export async function waivePayment(submissionId: number) {
    try {
        await db.execute(
            sql`UPDATE payments SET status = 'waived', paid_at = CURRENT_TIMESTAMP WHERE submission_id = ${submissionId}`
        );
        await db.execute(
            sql`UPDATE submissions SET status = 'paid' WHERE id = ${submissionId}`
        );
        revalidatePath('/admin/submissions');
        revalidatePath('/admin/submissions/[id]');
        revalidatePath('/admin/payments');
        return { success: true };
    } catch (error: any) {
        console.error("Waive Payment Error:", error);
        return { error: "Failed to waive payment: " + error.message };
    }
}
