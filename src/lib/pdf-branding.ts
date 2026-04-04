import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

interface BrandingMetadata {
    journalName: string;
    journalShortName: string;
    volume: string | number;
    issue: string | number;
    year: string | number;
    monthRange: string;
    issn: string;
    website: string;
    paperId: string;
    startPage?: number | null;
    endPage?: number | null;
}

export async function brandPdf(inputPath: string, outputPath: string, metadata: BrandingMetadata) {
    try {
        // 1. Read the existing PDF
        const fullInputPath = path.join(process.cwd(), 'public', inputPath);
        const pdfBytes = await fs.readFile(fullInputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        const fontSize = 9;

        // 2. Embed fonts
        const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        // 3. Load and embed Logo
        const logoPath = path.join(process.cwd(), 'public/logo.png');
        const logoBytes = await fs.readFile(logoPath);
        const logoImage = await pdfDoc.embedPng(logoBytes);
        
        // Scale logo to height of ~40 pts
        const logoHeight = 40;
        const logoWidth = (logoImage.width / logoImage.height) * logoHeight;

        // 4. Prepare replacement text strings
        const headerLines = [
            metadata.journalName,
            `A Peer-Reviewed International Research Journal (${metadata.journalShortName})`,
            `${metadata.website} | E-ISSN: ${metadata.issn}`
        ];
        
        // 5. PROCESS ALL PAGES
        const headerMaskHeight = 80; 
        const footerMaskHeight =70;

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();
            const currentPageNumber = (metadata.startPage || 1) + i;

            // --- HEADER REPLACEMENT ---
            // White out the top area
            page.drawRectangle({
                x: 0,
                y: height - headerMaskHeight,
                width: width,
                height: headerMaskHeight,
                color: rgb(1, 1, 1), 
            });

            // Draw Logo on the left
            page.drawImage(logoImage, {
                x: 50,
                y: height - 55,
                width: logoWidth * (35 / logoHeight), // Scale down slightly
                height: 35,
            });

            // Draw the new header lines
            const textX = 50 + (logoWidth * (35 / logoHeight)) + 20;
            page.drawText(headerLines[0], {
                x: textX,
                y: height - 25,
                size: fontSize + 1,
                font: font,
                color: rgb(0.5, 0, 0),
            });

            page.drawText(headerLines[1], {
                x: textX,
                y: height - 40,
                size: fontSize - 1,
                font: font,
                color: rgb(0.4, 0, 0.4),
            });

            page.drawText(headerLines[2], {
                x: textX,
                y: height - 55,
                size: fontSize - 1,
                font: font,
                color: rgb(0, 0, 0),
            });

            // Straight line below header
            page.drawLine({
                start: { x: 50, y: height - 70 },
                end: { x: width - 50, y: height - 70 },
                thickness: 0.5,
                color: rgb(0.5, 0, 0.5),
            });

            // --- FOOTER REPLACEMENT ---
            // White out the bottom area
            page.drawRectangle({
                x: 0,
                y: 0,
                width: width,
                height: footerMaskHeight,
                color: rgb(1, 1, 1),
            });

            // Straight line above footer
            const footerLineY = 60;
            page.drawLine({
                start: { x: 50, y: footerLineY },
                end: { x: width - 50, y: footerLineY },
                thickness: 0.5,
                color: rgb(0.5, 0, 0),
            });

            // Left: Paper ID
            page.drawText(`Paper ID: ${metadata.paperId}`, {
                x: 50,
                y: footerLineY - 20,
                size: fontSize,
                font: regularFont,
                color: rgb(0, 0, 0),
            });

            // Center: Volume, Issue, Date
            const centerText = `Volume ${metadata.volume} Issue ${metadata.issue}, ${metadata.monthRange} ${metadata.year}`;
            const centerTextWidth = regularFont.widthOfTextAtSize(centerText, fontSize);
            page.drawText(centerText, {
                x: (width / 2) - (centerTextWidth / 2),
                y: footerLineY - 20,
                size: fontSize,
                font: regularFont,
                color: rgb(0, 0, 0),
            });

            // Right: Page Number
            const pageText = `${currentPageNumber}`;
            const pageTextWidth = regularFont.widthOfTextAtSize(pageText, fontSize);
            page.drawText(pageText, {
                x: width - 50 - pageTextWidth,
                y: footerLineY - 20,
                size: fontSize,
                font: regularFont,
                color: rgb(0, 0, 0),
            });

            // URL below center (Blue/Underlined)
            const urlText = metadata.website.replace(/^https?:\/\//, '');
            const urlTextWidth = regularFont.widthOfTextAtSize(urlText, fontSize);
            const urlX = (width / 2) - (urlTextWidth / 2);
            const urlY = footerLineY - 35;
            
            page.drawText(urlText, {
                x: urlX,
                y: urlY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 1),
            });
            // Underline
            page.drawLine({
                start: { x: urlX, y: urlY - 1 },
                end: { x: urlX + urlTextWidth, y: urlY - 1 },
                thickness: 0.5,
                color: rgb(0, 0, 1),
            });
        }

        // 6. Save the branded PDF
        const brandedBytes = await pdfDoc.save();
        const fullOutputPath = path.join(process.cwd(), 'public', outputPath);
        await fs.mkdir(path.dirname(fullOutputPath), { recursive: true });
        await fs.writeFile(fullOutputPath, brandedBytes);

        return { success: true, path: outputPath };
    } catch (error) {
        console.error("PDF Branding Error:", error);
        throw new Error(`Failed to replace metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
}
