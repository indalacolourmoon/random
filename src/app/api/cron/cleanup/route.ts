import { NextResponse } from "next/server";
import { cleanupInactiveAuthors } from "@/lib/cleanup";

/**
 * Cron endpoint: DELETE stalled submissions + inactive author accounts.
 * Trigger via Vercel Cron Jobs (vercel.json) or any external scheduler.
 *
 * Schedule: Daily at 02:00 UTC
 * Security: Protected by CRON_SECRET env var header check.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await cleanupInactiveAuthors();
        return NextResponse.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Cron cleanup failed:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
