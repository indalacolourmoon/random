"use server";

import { razorpay } from "@/lib/razorpay";
import crypto from "crypto";
import { db } from "@/lib/db";
import { payments, submissions, settings, userProfiles, users, submissionVersions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type CreateOrderResponse =
    | { success: true; order: { id: string; amount: number; currency: string; key: string | undefined } }
    | { success: false; error: string };

export async function createRazorpayOrder(submissionId: number, paperId: string): Promise<CreateOrderResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Authentication required" };

        // 1. Fetch APC amount from settings
        const settingsRows = await db.select()
            .from(settings)
            .where(eq(settings.settingKey, "apc_inr"))
            .limit(1);
        
        const amountInINR = settingsRows[0]?.settingValue || '2500';
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
        const existingPayments = await db.select()
            .from(payments)
            .where(eq(payments.submissionId, submissionId))
            .limit(1);
 
        if (existingPayments.length > 0) {
            await db.update(payments)
                .set({ 
                    transactionId: order.id, 
                    currency: 'INR', 
                    amount: amountInINR 
                })
                .where(eq(payments.submissionId, submissionId));
        } else {
            await db.insert(payments).values({
                submissionId: submissionId,
                amount: amountInINR,
                currency: 'INR',
                status: 'pending',
                transactionId: order.id
            });
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
    } catch (error) {
        console.error("Create Razorpay Order Error:", error);
        return { success: false, error: "Failed to create payment order: " + (error instanceof Error ? error.message : String(error)) };
    }
}

export async function verifyRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    submissionId: number;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Authentication required" };

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, submissionId } = data;

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error("RAZORPAY_KEY_SECRET is not set");
            return { success: false, error: "Payment configuration error. Please contact support." };
        }

        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return { success: false, error: "Invalid payment signature" };
        }

        // 1.5 Verify that this order actually belongs to this submission
        const existingPayment = await db.select()
            .from(payments)
            .where(and(
                eq(payments.transactionId, razorpay_order_id),
                eq(payments.submissionId, submissionId)
            ))
            .limit(1);

        if (existingPayment.length === 0) {
            return { success: false, error: "Payment record mismatch. Verification failed." };
        }

        // 2. Update Payment Status in DB
        await db.update(payments)
            .set({ 
                status: 'paid', 
                transactionId: razorpay_payment_id, 
                paidAt: new Date() 
            })
            .where(eq(payments.submissionId, submissionId));
 
        // 3. Keep submission at 'accepted' — payment is confirmed, admin will assign to issue
        // (no status change needed here — 'accepted' is already the correct state post-payment)

        // 4. Notify Author
        try {
            const subData = await db.select({
                authorName: userProfiles.fullName,
                authorEmail: users.email,
                title: submissionVersions.title,
                paperId: submissions.paperId
            })
            .from(submissions)
            .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
            .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
            .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
            .where(eq(submissions.id, submissionId))
            .orderBy(desc(submissionVersions.versionNumber))
            .limit(1);

            const sub = subData[0];
            if (sub) {
                const template = emailTemplates.paymentVerified(sub.authorName, sub.title, sub.paperId);
                // Fire-and-forget — payment is already recorded, email failure is non-critical
                sendEmail({ to: sub.authorEmail, subject: template.subject, html: template.html })
                    .catch(e => console.error("Payment confirmation email failed:", e));
            }
        } catch (emailErr) {
            console.error("Failed to send payment verification email:", emailErr);
        }

        revalidatePath('/track');
        revalidatePath('/admin');
        revalidatePath('/reviewer');
        revalidatePath('/editor');

        return { success: true };
    } catch (error) {
        console.error("Verify Razorpay Payment Error:", error);
        return { success: false, error: "Failed to verify payment: " + ((error as any)?.message || String(error)) };
    }
}
