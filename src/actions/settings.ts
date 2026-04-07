"use server";

import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { ActionResponse } from "@/db/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const ALLOWED_SETTING_KEYS = new Set([
    'journal_name', 'journal_short_name', 'issn_number', 'apc_inr', 'apc_usd',
    'support_email', 'support_phone', 'office_address', 'publisher_name',
    'journal_website', 'apc_description', 'template_url', 'copyright_url',
    'is_promotion_active'
]);

const DEFAULT_SETTINGS: Record<string, string> = {
    journal_name: 'International Journal of Innovative Trends in Engineering Science and Technology',
    journal_short_name: 'IJITEST',
    issn_number: 'XXXX-XXXX',
    apc_inr: '2500',
    apc_usd: '50',
    support_email: 'editor@ijitest.org',
    support_phone: '+91 8919643590',
    office_address: 'Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India',
    publisher_name: 'Felix Academic Publications',
    journal_website: 'https://ijitest.org',
    apc_description: 'APC covers SJIF impact evaluation, long-term hosting, indexing maintenance, and editorial handling. There are no submission or processing charges before acceptance.',
    template_url: '/docs/template.docx',
    copyright_url: '/docs/copyright-form.docx',
    is_promotion_active: 'true'
};

export async function getSettings(): Promise<ActionResponse<Record<string, string>>> {
    try {
        const rows = await db.select().from(settings);
        
        const result: Record<string, string> = { ...DEFAULT_SETTINGS };

        rows.forEach((row) => {
            if (row.settingValue) {
                result[row.settingKey] = row.settingValue;
            }
        });

        return { success: true, data: result };
    } catch (error) {
        console.error("Get Settings Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Utility for Server Components to get raw settings directly.
 */
export async function getSettingsData(): Promise<Record<string, string>> {
    const res = await getSettings();
    return res.data || DEFAULT_SETTINGS;
}

export async function updateSettings(formData: FormData): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return { success: false, error: "Unauthorized" };
        }

        const entries = Array.from(formData.entries());

        // Resolve file uploads outside the transaction first
        const resolvedEntries: Array<[string, string]> = [];
        for (const [key, value] of entries) {
            if (key.startsWith('$')) continue;
            if (!ALLOWED_SETTING_KEYS.has(key)) continue; // whitelist guard

            if (value instanceof File && value.size > 0) {
                const bytes = await value.arrayBuffer();
                const fileExt = value.name.split('.').pop();
                const fileName = `${key.replace(/_/g, '-')}.${fileExt}`;
                const uploadDir = path.join(process.cwd(), "public/docs");
                await fs.mkdir(uploadDir, { recursive: true });
                await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));
                resolvedEntries.push([key, `/docs/${fileName}`]);
            } else if (value instanceof File && value.size === 0) {
                continue; // skip empty file — preserve existing
            } else {
                resolvedEntries.push([key, String(value ?? "")]);
            }
        }

        await db.transaction(async (tx) => {
            for (const [key, value] of resolvedEntries) {
                await tx.insert(settings)
                    .values({ settingKey: key, settingValue: value })
                    .onDuplicateKeyUpdate({ set: { settingValue: value } });
            }
        });

        revalidatePath('/admin/settings');
        revalidatePath('/', 'layout');
        revalidatePath('/guidelines');
        revalidatePath('/contact');
        revalidatePath('/about');
        
        return { success: true };
    } catch (error) {
        console.error("Update Settings Error:", error);
        return { success: false, error: "Failed to update settings: " + (error instanceof Error ? error.message : String(error)) };
    }
}
