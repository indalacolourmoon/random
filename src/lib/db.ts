import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as schema from "@/db/schema";
dotenv.config();

const poolOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 5, // Reduced from 10 to avoid hitting limits on Hostinger
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    idleTimeout: 60000,
    connectTimeout: 20000 // Increased for remote stability
};

/**
 * Global Singleton for Database
 * This prevents creating multiple connection pools during Next.js hot-reloading in development.
 */
const globalForDb = globalThis as unknown as {
    db: any | undefined;
};

export const db = globalForDb.db ?? drizzle(mysql.createPool(poolOptions), { schema, mode: "default" });

if (process.env.NODE_ENV !== "production") {
    globalForDb.db = db;
}
