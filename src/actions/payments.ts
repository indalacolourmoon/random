"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPayments() {
    try {
        const [rows]: any = await pool.execute(`
            SELECT p.*, s.title, s.paper_id, s.author_name, s.author_email 
            FROM payments p
            JOIN submissions s ON p.submission_id = s.id
            ORDER BY p.created_at DESC
        `);
        return rows;
    } catch (error: any) {
        console.error("Get Payments Error:", error);
        return [];
    }
}

export async function updatePaymentStatus(paymentId: number, status: string, transactionId?: string) {
    try {
        await pool.execute(
            "UPDATE payments SET status = ?, transaction_id = ?, paid_at = IF(? = 'paid', CURRENT_TIMESTAMP, paid_at) WHERE id = ?",
            [status, transactionId || null, status, paymentId]
        );

        if (status === 'paid') {
            // Get submission ID
            const [rows]: any = await pool.execute('SELECT submission_id FROM payments WHERE id = ?', [paymentId]);
            if (rows[0]) {
                await pool.execute("UPDATE submissions SET status = 'paid' WHERE id = ?", [rows[0].submission_id]);
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
        await pool.execute(
            'INSERT INTO payments (submission_id, amount, currency, status) VALUES (?, ?, ?, ?)',
            [submissionId, amount, currency, 'unpaid']
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
        const [rows]: any = await pool.execute(`
            SELECT id, paper_id, title, author_name 
            FROM submissions 
            WHERE status = 'accepted' 
            AND id NOT IN (SELECT submission_id FROM payments)
        `);
        return rows;
    } catch (error: any) {
        console.error("Get Accepted Unpaid Error:", error);
        return [];
    }
}

export async function waivePayment(submissionId: number) {
    try {
        await pool.execute(
            "UPDATE payments SET status = 'waived', paid_at = CURRENT_TIMESTAMP WHERE submission_id = ?",
            [submissionId]
        );
        await pool.execute(
            "UPDATE submissions SET status = 'paid' WHERE id = ?",
            [submissionId]
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
