import { drizzle } from "drizzle-orm/node-postgres";
import pg, { type Pool } from "pg";
import * as schema from "@shared/schema";

const { Pool: PoolConstructor } = pg;

export let pool: Pool | undefined;
export let db: any;

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("user:password")) {
  pool = new PoolConstructor({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  console.warn("DATABASE_URL is missing or placeholder. Falling back to in-memory storage.");
}
