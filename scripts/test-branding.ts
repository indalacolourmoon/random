import { brandPdf } from "../src/lib/pdf-branding";
import dotenv from "dotenv";
dotenv.config();

async function test() {
    const input = "uploads/submissions/secure-13-1773160217801.pdf";
    const output = "uploads/test-branded.pdf";
    const metadata = {
        journalName: "International Journal of Innovative Trends in Engineering Science and Technology",
        journalShortName: "IJITEST",
        volume: 1,
        issue: 1,
        year: 2026,
        monthRange: "February",
        issn: "XXXX-XXXX",
        website: "https://www.ijitest.org",
        paperId: "IJITEST-2026-001",
        startPage: 1
    };

    console.log("🚀 Starting test branding...");
    try {
        const result = await brandPdf(input, output, metadata);
        console.log("✅ Branded PDF created at:", result.path);
    } catch (e) {
        console.error("❌ Branding Failed:", e);
    }
}

test();
