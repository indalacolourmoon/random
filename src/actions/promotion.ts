"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markPromotionAsSeen() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { error: "Unauthenticated" };

        const userId = (session.user as any).id;
        if (!userId) return { error: "User ID not found" };

        await db.execute(
            sql`UPDATE users SET has_seen_promotion = 1 WHERE id = ${userId}`
        );

        return { success: true };
    } catch (error: any) {
        console.error("Mark Promotion As Seen Error:", error);
        return { error: error.message };
    }
}
