"use server";

import { db } from "@/lib/db";
import { 
    users, 
    userProfiles, 
    applications, 
    applicationInterests, 
    masterInterests,
    submissions, 
    reviews,
    submissionVersions,
    reviewAssignments
} from "@/db/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ActionResponse } from "@/db/types";

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
    history: Array<{
        title: string;
        created_at?: Date | null;
        updated_at?: Date | null;
        status?: string | null;
        decision?: string | null;
    }>;
    completeness: {
        score: number;
        total: number;
        percentage: number;
        missing: string[];
    };
};

export async function getProfileData(userId: string, role: 'admin' | 'editor' | 'reviewer' | 'author'): Promise<ActionResponse<ProfileData>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: "Unauthorized" };

        // 1. Fetch User Base Info and Profile
        const userWithProfile = await db.select({
            id: users.id,
            email: users.email,
            name: userProfiles.fullName,
            designation: userProfiles.designation,
            photo_url: userProfiles.photoUrl,
            orcid_id: userProfiles.orcidId,
        })
        .from(users)
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(eq(users.id, userId))
        .limit(1);

        if (userWithProfile.length === 0) return { success: false, error: "User not found" };
        const userData = userWithProfile[0];

        const profileData: Partial<ProfileData> = { 
            id: userData.id,
            email: userData.email,
            name: userData.name || "",
            designation: userData.designation || "",
            photo_url: userData.photo_url,
            orcid_id: userData.orcid_id,
            research_interests: []
        };

        // 2. Fetch Application Data (if not admin)
        if (role !== 'admin') {
            const appRows = await db.select({
                institute: applications.institute,
                country: applications.nationality,
                status: applications.status,
                rejection_reason: sql<string | null>`NULL`,
                reviewed_at: applications.reviewedAt
            })
            .from(applications)
            .where(eq(applications.email, userData.email))
            .limit(1);

            if (appRows.length > 0) {
                profileData.application = {
                    institute: appRows[0].institute,
                    country: appRows[0].country || "",
                    status: appRows[0].status,
                    rejection_reason: appRows[0].rejection_reason,
                    reviewed_at: appRows[0].reviewed_at ? appRows[0].reviewed_at.toISOString() : null
                };
                
                // Fetch interests from join table
                if (role === 'reviewer' || role === 'editor') {
                    const interestRows = await db.select({ name: masterInterests.name })
                        .from(applicationInterests)
                        .innerJoin(applications, eq(applicationInterests.applicationId, applications.id))
                        .innerJoin(masterInterests, eq(applicationInterests.interestId, masterInterests.id))
                        .where(eq(applications.email, userData.email));
                    profileData.research_interests = interestRows.map(r => r.name);
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
        let history: ProfileData['history'] = [];
        if (role === 'author') {
            const subRows = await db.select({
                title: submissionVersions.title,
                status: submissions.status,
                created_at: submissions.submittedAt
            })
            .from(submissions)
            .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
            .where(eq(submissions.correspondingAuthorId, userId))
            .orderBy(desc(submissions.submittedAt))
            .limit(10);
            history = subRows;
        } else if (role === 'reviewer') {
            const revRows = await db.select({
                title: submissionVersions.title,
                decision: reviews.decision,
                updated_at: reviews.submittedAt
            })
            .from(reviews)
            .innerJoin(reviewAssignments, eq(reviews.assignmentId, reviewAssignments.id))
            .innerJoin(submissions, eq(reviewAssignments.submissionId, submissions.id))
            .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
            .where(and(
                eq(reviewAssignments.reviewerId, userId),
                eq(reviewAssignments.status, 'completed')
            ))
            .orderBy(desc(reviews.submittedAt))
            .limit(10);
            history = revRows;
        }
        profileData.history = history;

        // 5. Calculate Completeness
        profileData.completeness = await getProfileCompleteness(profileData, role);

        return { success: true, data: profileData as ProfileData };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("getProfileData error:", error);
        return { success: false, error: "Failed to fetch profile: " + message };
    }
}

export async function updateProfileField(userId: string, field: string, value: string): Promise<ActionResponse<string>> {
    const whitelist = ['name', 'designation', 'orcid_id'];
    if (!whitelist.includes(field)) {
        return { success: false, error: 'Field not permitted' };
    }

    const trimmedValue = value.trim();
    if (!trimmedValue && field !== 'orcid_id') {
        return { success: false, error: 'Value cannot be empty' };
    }

    try {
        const updateDoc: Record<string, string> = {};
        if (field === 'name') updateDoc.fullName = trimmedValue;
        else if (field === 'orcid_id') updateDoc.orcidId = trimmedValue;
        else if (field === 'designation') updateDoc.designation = trimmedValue;

        await db.update(userProfiles)
            .set(updateDoc)
            .where(eq(userProfiles.userId, userId));
            
        revalidatePath("/(panel)", "layout");
        return { success: true, data: trimmedValue };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("updateProfileField error:", error);
        return { success: false, error: "Failed to update field: " + message };
    }
}

export async function updateResearchInterests(userId: string, interests: string[]): Promise<ActionResponse<string[]>> {
    if (!Array.isArray(interests)) return { success: false, error: "Invalid interests format" };
    const cleanInterests = interests.map(i => i.trim()).filter(Boolean).slice(0, 20);

    try {
        await db.transaction(async (tx) => {
            // Get User Email and Profile
            const userRows = await tx.select({ email: users.email })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);
            
            const email = userRows[0]?.email;
            if (!email) throw new Error("User not found");

            const appRows = await tx.select({ id: applications.id })
                .from(applications)
                .where(eq(applications.email, email))
                .limit(1);
            
            const applicationId = appRows[0]?.id;

            if (applicationId) {
                // Also update the legacy many-to-many system for consistency
                await tx.delete(applicationInterests).where(eq(applicationInterests.applicationId, applicationId));
                
                for (const name of cleanInterests) {
                    let interestId: number;
                    const existing = await tx.select().from(masterInterests).where(eq(masterInterests.name, name)).limit(1);
                    
                    if (existing[0]) {
                        interestId = existing[0].id;
                    } else {
                        const [inserted] = await tx.insert(masterInterests).values({ name }).$returningId();
                        interestId = inserted.id;
                    }

                    await tx.insert(applicationInterests).values({
                        applicationId,
                        interestId
                    });
                }
            }

            // Interests are stored only in the join table (masterInterests + applicationInterests)
        });
        
        revalidatePath("/(panel)", "layout");
        return { success: true, data: cleanInterests };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("updateResearchInterests error:", error);
        return { success: false, error: "Failed to update interests: " + message };
    }
}

export async function updateProfilePhoto(userId: string, formData: FormData): Promise<ActionResponse<string>> {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return { success: false, error: "Invalid file type. Only JPG, PNG and WEBP allowed." };
    }

    if (file.size > 2 * 1024 * 1024) {
        return { success: false, error: "File too large. Max 2MB allowed." };
    }

    try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles");
        await mkdir(uploadsDir, { recursive: true });

        const ext = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);
        const photoUrl = `/uploads/profiles/${fileName}`;

        // Get old photo to delete later
        const rows = await db.select({ photoUrl: userProfiles.photoUrl })
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId))
            .limit(1);
        
        const oldPhoto = rows[0]?.photoUrl;

        await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
        
        await db.update(userProfiles)
            .set({ photoUrl: photoUrl })
            .where(eq(userProfiles.userId, userId));

        if (oldPhoto && oldPhoto.startsWith('/uploads/profiles/')) {
            const oldPath = path.join(process.cwd(), "public", oldPhoto);
            try { await unlink(oldPath); } catch (e) {}
        }

        revalidatePath("/(panel)", "layout");
        return { success: true, data: photoUrl };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("updateProfilePhoto error:", error);
        return { success: false, error: "Failed to update photo: " + message };
    }
}

export async function getProfileCompleteness(profileData: Partial<ProfileData>, role: string) {
    let score = 0;
    let total = 0;
    const missing: string[] = [];

    const check = (val: unknown, label: string) => {
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
