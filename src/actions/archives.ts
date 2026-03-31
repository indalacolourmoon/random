"use server";

import pool from "@/lib/db";

export async function getPublishedPapers() {
    try {
        const [rows]: any = await pool.execute(`
            SELECT 
                s.*, 
                vi.volume_number, 
                vi.issue_number, 
                vi.year as publication_year, 
                vi.month_range
            FROM submissions s
            JOIN volumes_issues vi ON s.issue_id = vi.id
            WHERE s.status IN ('published', 'retracted')
            ORDER BY vi.year DESC, vi.volume_number DESC, vi.issue_number DESC, s.updated_at DESC
        `);
        return rows;
    } catch (error: any) {
        if (error.code === 'ETIMEDOUT') {
            console.error("Build-time DB Connection Timeout (Published Papers) - Skipping");
        } else {
            console.error("Get Published Papers Error:", error);
        }
        return [];
    }
}
export async function getLatestIssuePapers() {
    try {
        const [rows]: any = await pool.execute(`
            SELECT 
                s.*, 
                vi.volume_number, 
                vi.issue_number, 
                vi.year as publication_year, 
                vi.month_range
            FROM submissions s
            JOIN volumes_issues vi ON s.issue_id = vi.id
            WHERE s.status IN ('published', 'retracted')
            AND s.submission_mode = 'current'
            ORDER BY s.published_at DESC
        `);
        
        return rows;
    } catch (error: any) {
        if (error.code === 'ETIMEDOUT') {
            console.error("Build-time DB Connection Timeout (Latest Issue Papers) - Skipping");
        } else {
            console.error("Get Latest Issue Papers Error:", error);
        }
        return [];
    }
}

export async function getArchivePapers() {
    try {
        const [rows]: any = await pool.execute(`
            SELECT 
                s.*, 
                vi.volume_number, 
                vi.issue_number, 
                vi.year as publication_year, 
                vi.month_range
            FROM submissions s
            JOIN volumes_issues vi ON s.issue_id = vi.id
            WHERE s.status IN ('published', 'retracted')
            AND s.submission_mode = 'archive'
            ORDER BY s.published_at DESC, vi.year DESC, vi.issue_number DESC
        `);
        return rows;
    } catch (error: any) {
        console.error("Get Archive Papers Error:", error);
        return [];
    }
}

export async function getPaperById(id: string) {
    try {
        const [rows]: any = await pool.execute(`
            SELECT 
                s.*, 
                vi.volume_number, 
                vi.issue_number, 
                vi.year as publication_year, 
                vi.month_range
            FROM submissions s
            JOIN volumes_issues vi ON s.issue_id = vi.id
            WHERE s.id = ? AND s.status IN ('published', 'retracted')
        `, [id]);
        return rows[0] || null;
    } catch (error: any) {
        if (error.code !== 'ETIMEDOUT') {
            console.error("Get Paper By ID Error:", error);
        }
        return null;
    }
}
