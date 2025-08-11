import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const isProd = process.env.NODE_ENV === "production";

// Enforce SSL in production, accept self-signed only if explicitly allowed
const client = postgres(connectionString, {
  ssl: isProd
    ? { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== "false" }
    : undefined,
  max: 10,
});

export const db = drizzle(client, { schema });
export * from "./schema";
