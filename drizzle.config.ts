import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Load .env.local first (Next.js convention), fallback to .env
config({ path: ".env.local" });
config({ path: ".env" });

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://localhost:5432/workflow",
  },
} satisfies Config;
