import fs from "fs/promises";
import path from "path";

/**
 * Safely deletes a file from the public directory.
 * @param relativePath The path relative to the public folder (e.g., "/uploads/submissions/file.pdf")
 */
export async function safeDeleteFile(relativePath: string | null | undefined) {
    if (!relativePath || !relativePath.startsWith('/')) return;

    try {
        const absolutePath = path.join(process.cwd(), "public", relativePath);

        // Check if file exists before trying to delete
        try {
            await fs.access(absolutePath);
            await fs.unlink(absolutePath);
            console.log(`Successfully deleted file: ${absolutePath}`);
        } catch (accessError: any) {
            if (accessError.code === 'ENOENT') {
                // File already doesn't exist, which is fine
                return;
            }
            throw accessError;
        }
    } catch (error) {
        console.error(`Error deleting file ${relativePath}:`, error);
    }
}
