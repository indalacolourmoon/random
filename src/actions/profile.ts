"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { safeDeleteFile } from "@/lib/fs-utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export type ProfileData = {
    id: string;
    name: string;
    email: string;
    designation: string;
    photo_url: string | null;
    orcid_id: string | null;
    application?: {
        institute: string;
        country: string;
        status: string;
        rejection_reason: string | null;
        reviewed_at: string | null;
    };
    research_interests: string[];
    history: any[];
    completeness: {
        score: number;
        total: number;
        percentage: number;
        missing: string[];
    };
};

export async function getProfileData(userId: string, role: 'admin' | 'editor' | 'reviewer' | 'author') {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new Error("Unauthorized");

        // 1. Fetch User Base Info
        const userRows: any = await db.execute(
            sql`SELECT id, full_name as name, email, designation, photo_url, orcid_id FROM users WHERE id = ${userId}`
        );
        if (userRows[0].length === 0) throw new Error("User not found");
        const userData = userRows[0][0];

        const profileData: any = { ...userData };

        // 2. Fetch Application Data (if not admin)
        if (role !== 'admin') {
            const appRows: any = await db.execute(
                sql`SELECT institute, nationality as country, status, rejection_reason, reviewed_at FROM applications WHERE email = ${userData.email}`
            );
            if (appRows[0].length > 0) {
                profileData.application = appRows[0][0];
                
                // 3. Fetch Interests (if reviewer/editor)
                if (role === 'reviewer' || role === 'editor') {
                    const interestRows: any = await db.execute(
                        sql`SELECT interest FROM application_interests ai JOIN applications a ON ai.application_id = a.id WHERE a.email = ${userData.email}`
                    );
                    profileData.research_interests = (interestRows[0] || []).map((r: any) => r.interest);
                } else {
                    profileData.research_interests = [];
                }
            } else {
                profileData.research_interests = [];
            }
        } else {
            profileData.research_interests = [];
        }

        // 4. Role-specific History
        let history: any[] = [];
        const userEmail = session.user?.email;

        if (role === 'author' && userEmail) {
            const subRows: any = await db.execute(
                sql`SELECT title, status, submitted_at as created_at FROM submissions WHERE author_email = ${userEmail} ORDER BY submitted_at DESC LIMIT 10`
            );
            history = subRows[0] || [];
        } else if (role === 'reviewer') {
            const revRows: any = await db.execute(
                sql`SELECT s.title, r.status as decision, r.completed_at as updated_at 
                 FROM reviews r 
                 JOIN submissions s ON r.submission_id = s.id 
                 WHERE r.reviewer_id = ${userId} AND r.status = 'completed'
                 ORDER BY r.completed_at DESC LIMIT 10`
            );
            history = revRows[0] || [];
        }
        profileData.history = history;

        // 5. Calculate Completeness
        profileData.completeness = await getProfileCompleteness(profileData, role);

        return profileData as ProfileData;
    } catch (error) {
        console.error("getProfileData error:", error);
        throw error;
    }
}

export async function updateProfileField(userId: string, field: string, value: string) {
    const whitelist = ['name', 'designation', 'orcid_id'];
    if (!whitelist.includes(field)) {
        throw new Error('Field not permitted');
    }

    const trimmedValue = value.trim();
    if (!trimmedValue && field !== 'orcid_id') {
        throw new Error('Value cannot be empty');
    }

    const dbField = field === 'name' ? 'full_name' : field === 'orcid_id' ? 'orcid_id' : 'designation';

    try {
        const query = sql.raw(`UPDATE users SET ${dbField} = ${sql.placeholder('val')} WHERE id = ${sql.placeholder('id')}`);
        await db.execute(sql`UPDATE users SET ${sql.raw(dbField)} = ${trimmedValue} WHERE id = ${userId}`);
        revalidatePath("/(panel)", "layout");
        return trimmedValue;
    } catch (error) {
        console.error("updateProfileField error:", error);
        throw error;
    }
}

export async function updateResearchInterests(userId: string, interests: string[]) {
    if (!Array.isArray(interests)) throw new Error("Invalid interests format");
    const cleanInterests = interests.map(i => i.trim()).filter(Boolean).slice(0, 20);

    try {
        return await db.transaction(async (tx) => {
            // Get Application ID first
            const userRows: any = await tx.execute(sql`SELECT email FROM users WHERE id = ${userId}`);
            const email = userRows[0][0]?.email;
            if (!email) throw new Error("User not found");

            const appRows: any = await tx.execute(sql`SELECT id FROM applications WHERE email = ${email}`);
            const applicationId = appRows[0][0]?.id;

            if (applicationId) {
                await tx.execute(sql`DELETE FROM application_interests WHERE application_id = ${applicationId}`);
                if (cleanInterests.length > 0) {
                    const values = cleanInterests.map(i => sql`(${applicationId}, ${i})`);
                    await tx.execute(sql`INSERT INTO application_interests (application_id, interest) VALUES ${sql.join(values, sql`, `)}`);
                }
            }

            revalidatePath("/(panel)", "layout");
            return cleanInterests;
        });
    } catch (error) {
        console.error("updateResearchInterests error:", error);
        throw error;
    }
}

export async function updateProfilePhoto(userId: string, formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error("Invalid file type. Only JPG, PNG and WEBP allowed.");
    }

    if (file.size > 2 * 1024 * 1024) {
        throw new Error("File too large. Max 2MB allowed.");
    }

    try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles");
        await mkdir(uploadsDir, { recursive: true });

        const ext = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);
        const photoUrl = `/uploads/profiles/${fileName}`;

        // Get old photo to delete later
        const rows: any = await db.execute(sql`SELECT photo_url FROM users WHERE id = ${userId}`);
        const oldPhoto = rows[0][0]?.photo_url;

        await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
        
        await db.execute(sql`UPDATE users SET photo_url = ${photoUrl} WHERE id = ${userId}`);

        if (oldPhoto && oldPhoto.startsWith('/uploads/profiles/')) {
            const oldPath = path.join(process.cwd(), "public", oldPhoto);
            try { await unlink(oldPath); } catch (e) {}
        }

        revalidatePath("/(panel)", "layout");
        return photoUrl;
    } catch (error) {
        console.error("updateProfilePhoto error:", error);
        throw error;
    }
}

export async function getProfileCompleteness(profileData: any, role: string) {
    let score = 0;
    let total = 0;
    const missing: string[] = [];

    const check = (val: any, label: string) => {
        total++;
        if (val && (Array.isArray(val) ? val.length > 0 : val.toString().trim().length > 0)) {
            score++;
        } else {
            missing.push(label);
        }
    };

    check(profileData.name, 'Full Name');
    check(profileData.designation, 'Designation');
    check(profileData.email, 'Email Address');
    
    if (role !== 'admin' && role !== 'author') {
        check(profileData.application?.institute, 'Academic Institute');
        check(profileData.application?.country, 'Nationality/Country');
        check(profileData.research_interests, 'Research Interests');
    }

    check(profileData.photo_url, 'Profile Photo');
    check(profileData.orcid_id, 'ORCID ID');
    check(profileData.history, role === 'author' ? 'Submission History' : 'Activity History');

    return {
        score,
        total,
        percentage: Math.round((score / total) * 100),
        missing
    };
}
