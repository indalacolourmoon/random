"use server";

import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";

export async function getSettings() {
    try {
        const rows = await db.select().from(settings);
        
        // Default values for robustness
        const result: Record<string, string> = {
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

        rows.forEach((row) => {
            if (row.settingValue) {
                result[row.settingKey] = row.settingValue;
            }
        });

        return result;
    } catch (error: any) {
        console.error("Get Settings Error:", error);
        return {};
    }
}

export async function updateSettings(formData: FormData) {
    try {
        const entries = Array.from(formData.entries());

        await db.transaction(async (tx) => {
            for (const [key, value] of entries) {
                if (key.startsWith('$')) continue; // Skip Next.js internal fields

                let finalValue: any = value;

                // Handle File Uploads (Template & Copyright Form)
                if (value instanceof File && value.size > 0) {
                    const bytes = await value.arrayBuffer();
                    const buffer = Buffer.from(bytes);

                    const fileExt = value.name.split('.').pop();
                    const fileName = `${key.replace(/_/g, '-')}.${fileExt}`;

                    const uploadDir = path.join(process.cwd(), "public/docs");
                    await fs.mkdir(uploadDir, { recursive: true });

                    const filePath = path.join(uploadDir, fileName);
                    await fs.writeFile(filePath, buffer);

                    finalValue = `/docs/${fileName}`;
                } else if (value instanceof File && value.size === 0) {
                    // Skip empty file uploads (preserving existing values)
                    continue;
                }

                // Standard checkbox handling or empty values
                if (finalValue === null || finalValue === undefined) {
                    finalValue = "";
                }

                await tx.insert(settings)
                    .values({
                        settingKey: key,
                        settingValue: String(finalValue),
                    })
                    .onDuplicateKeyUpdate({
                        set: { settingValue: String(finalValue) }
                    });
            }
        });

        revalidatePath('/admin/settings');
        revalidatePath('/', 'layout');
        revalidatePath('/guidelines');
        revalidatePath('/contact');
        revalidatePath('/about');
        
        return { success: true };
    } catch (error: any) {
        console.error("Update Settings Error:", error);
        return { error: "Failed to update settings: " + error.message };
    }
}
