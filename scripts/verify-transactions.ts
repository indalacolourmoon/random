import pool from "../src/lib/db";
import * as dotenv from "dotenv";

dotenv.config();

async function runVerification() {
    console.log("🚀 Starting Phase 6 Transaction Verification...");
    
    const connection = await pool.getConnection();
    
    try {
        // 0. Setup dummy data
        console.log("--- Setup ---");
        const [setupResult]: any = await connection.execute(
            "INSERT INTO submissions (paper_id, title, author_name, author_email, status) VALUES (?, ?, ?, ?, ?)",
            ["VERIFY-TEST-001", "Transaction Verification Paper", "Tester", "verify@test.org", "submitted"]
        );
        const testId = setupResult.insertId;
        console.log(`Created test submission with ID: ${testId}`);

        // 1. Verify Rollback on Failure
        console.log("\n--- Test 1: Rolling Back on Failure ---");
        try {
            await connection.beginTransaction();
            console.log("Started transaction...");

            await connection.execute(
                "UPDATE submissions SET status = 'accepted' WHERE id = ?",
                [testId]
            );
            console.log("Updated status to 'accepted' (should be temporary)...");

            // Simulate failure
            console.log("Simulating failure (throwing error)...");
            throw new Error("Simulated Database Failure during multi-step operation");

            // We should never reach here
            await connection.commit();
        } catch (err: any) {
            console.log(`Caught expected error: ${err.message}`);
            await connection.rollback();
            console.log("Transaction successfully rolled back.");
        }

        // Check if rollback worked
        const [rollbackCheck]: any = await connection.execute(
            "SELECT status FROM submissions WHERE id = ?",
            [testId]
        );
        console.log(`Current status in DB: '${rollbackCheck[0].status}'`);
        if (rollbackCheck[0].status === 'submitted') {
            console.log("✅ Verification Success: Data remained 'submitted' after rollback.");
        } else {
            console.error("❌ Verification Failure: Data was NOT rolled back!");
        }

        // 2. Verify Commit on Success
        console.log("\n--- Test 2: Committing on Success ---");
        await connection.beginTransaction();
        console.log("Started transaction...");

        await connection.execute(
            "UPDATE submissions SET status = 'accepted' WHERE id = ?",
            [testId]
        );
        console.log("Updated status to 'accepted'...");

        await connection.commit();
        console.log("Transaction committed.");

        const [commitCheck]: any = await connection.execute(
            "SELECT status FROM submissions WHERE id = ?",
            [testId]
        );
        console.log(`Current status in DB: '${commitCheck[0].status}'`);
        if (commitCheck[0].status === 'accepted') {
            console.log("✅ Verification Success: Data persisted to 'accepted'.");
        } else {
            console.error("❌ Verification Failure: Data was NOT persisted!");
        }

        // 3. Cleanup
        console.log("\n--- Cleanup ---");
        await connection.execute("DELETE FROM submissions WHERE id = ?", [testId]);
        console.log("Deleted test data.");

    } catch (error) {
        console.error("Verification Script Error:", error);
    } finally {
        connection.release();
        console.log("\nDone.");
        process.exit(0);
    }
}

runVerification();
