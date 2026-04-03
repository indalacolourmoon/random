"use server";

import { razorpay } from "@/lib/razorpay";
import crypto from "crypto";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";

type CreateOrderResponse =
    | { success: true; order: { id: string; amount: number; currency: string; key: string | undefined } }
    | { success: false; error: string };

export async function createRazorpayOrder(submissionId: number, paperId: string): Promise<CreateOrderResponse> {
    try {
        // 1. Fetch APC amount from settings (or use default from existing logic)
        const settings: any = await db.execute(sql`SELECT setting_value FROM settings WHERE setting_key = "apc_inr"`);
        const amountInINR = settings[0][0]?.setting_value || '2500';
        const amount = parseInt(amountInINR) * 100; // Razorpay expects amount in paise

        // 2. Create Razorpay order
        const options = {
            amount: amount,
            currency: "INR",
            receipt: `receipt_${paperId}_${Date.now()}`,
            notes: {
                submission_id: submissionId,
                paper_id: paperId
            }
        };

        const order = await razorpay.orders.create(options);

        // 3. Create/Update payment record in DB with the Razorpay order ID
        // First check if a payment record exists for this submission
        const existing: any = await db.execute(sql`SELECT id FROM payments WHERE submission_id = ${submissionId}`);

        if (existing[0].length > 0) {
            await db.execute(
                sql`UPDATE payments SET transaction_id = ${order.id}, currency = 'INR', amount = ${amountInINR} WHERE submission_id = ${submissionId}`
            );
        } else {
            await db.execute(
                sql`INSERT INTO payments (submission_id, amount, currency, status, transaction_id) VALUES (${submissionId}, ${amountInINR}, 'INR', 'unpaid', ${order.id})`
            );
        }

        return {
            success: true,
            order: {
                id: order.id,
                amount: order.amount as number,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID
            }
        };
    } catch (error: any) {
        console.error("Create Razorpay Order Error:", error);
        return { success: false, error: "Failed to create payment order: " + error.message };
    }
}

export async function verifyRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    submissionId: number;
}) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, submissionId } = data;

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET || '';
        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return { success: false, error: "Invalid payment signature" };
        }

        // 2. Update Payment Status in DB
        await db.execute(
            sql`UPDATE payments SET status = 'paid', transaction_id = ${razorpay_payment_id}, paid_at = CURRENT_TIMESTAMP WHERE submission_id = ${submissionId}`
        );

        // 3. Update Submission Status
        await db.execute(sql`UPDATE submissions SET status = 'paid' WHERE id = ${submissionId}`);

        // 4. Notify Author
        try {
            const sub: any = await db.execute(sql`SELECT author_name, author_email, title, paper_id FROM submissions WHERE id = ${submissionId}`);
            if (sub[0].length > 0) {
                const template = emailTemplates.paymentVerified(sub[0][0].author_name, sub[0][0].title, sub[0][0].paper_id);
                sendEmail({
                    to: sub[0][0].author_email,
                    subject: template.subject,
                    html: template.html
                });
            }
        } catch (emailErr) {
            console.error("Failed to send payment verification email:", emailErr);
        }

        revalidatePath('/track');
        revalidatePath('/admin');
        revalidatePath('/reviewer');
        revalidatePath('/editor');

        return { success: true };
    } catch (error: any) {
        console.error("Verify Razorpay Payment Error:", error);
        return { success: false, error: "Failed to verify payment: " + error.message };
    }
}
