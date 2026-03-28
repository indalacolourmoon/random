import { drizzle } from "drizzle-orm/mysql2";
import pool from "../lib/db";
import * as schema from "./schema";
import * as relations from "./relations";

export const db = drizzle(pool, { schema: { ...schema, ...relations }, mode: "default" });
