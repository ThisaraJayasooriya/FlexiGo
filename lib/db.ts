import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// Prevent multiple DB client instances in Next.js dev mode (hot-reload).
// `postgres` is a pure JavaScript Postgres client — zero native bindings,
// fully compatible with Turbopack without any --webpack workaround.
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle<typeof schema>>;
};

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, {
    max: 1, // keep connection pool small for serverless/edge
  });
  return drizzle(client, { schema });
}

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
