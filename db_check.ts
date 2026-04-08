import { db } from "./src/lib/db";
import { users } from "./src/db/schema";
import { count } from "drizzle-orm";

async function check() {
    try {
        const res = await db.select({ value: count() }).from(users);
        console.log("DB Connection OK:", res);
    } catch (error) {
        console.error("DB Connection FAILED:", error);
    }
}

check();
