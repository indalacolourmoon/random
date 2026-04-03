import ILovePDFApi from '@ilovepdf/ilovepdf-nodejs';
import ILovePDFFile from '@ilovepdf/ilovepdf-nodejs/ILovePDFFile';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Converts a DOCX file buffer to a PDF buffer using iLovePDF.
 * @param fileBuffer - The DOCX file buffer.
 * @param fileName - The filename (original).
 * @returns The PDF buffer.
 */
export async function convertDocxToPdf(fileBuffer: Buffer, fileName: string): Promise<Buffer> {
    const publicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const secretKey = process.env.ILOVEPDF_SECRET_KEY;

    if (!publicKey || !secretKey) {
        throw new Error("iLovePDF API keys are not configured in environment variables.");
    }

    const instance = new ILovePDFApi(publicKey, secretKey);

    let tempFilePath: string | null = null;
    try {
        // 1. Create a temporary file because the SDK expects a file path
        const tempDir = os.tmpdir();
        // Use a safe filename for temp storage
        const safeName = fileName.replace(/[^a-z0-9.]/gi, '_');
        const uniqueName = `${Date.now()}-${safeName}`;
        tempFilePath = path.join(tempDir, uniqueName);
        await fs.writeFile(tempFilePath, fileBuffer);

        // 2. Start the officepdf task
        const task = instance.newTask('officepdf');
        await task.start();
        
        // 3. Add the file
        const file = new ILovePDFFile(tempFilePath);
        await task.addFile(file);
        
        // 4. Process the task
        await task.process();
        
        // 5. Download the result (returns a Uint8Array or similar depending on environment)
        const pdfData = await task.download();

        // 6. Ensure it's a Buffer
        return Buffer.from(pdfData);
    } catch (error) {
        console.error("iLovePDF Conversion Error:", error);
        // Provide user-friendly error message as requested
        throw new Error("Failed to convert document. Please try again.");
    } finally {
        // 7. Cleanup temporary file
        if (tempFilePath) {
            try {
                await fs.unlink(tempFilePath);
            } catch (err) {
                console.error("Failed to delete temp file:", err);
            }
        }
    }
}
