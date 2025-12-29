import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const result = await client.execute("SELECT 1 as test");
  console.log("✓ Turso connected!");
  console.log("  Test query:", result.rows[0]);

  // List tables
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table'"
  );
  console.log("  Tables:", tables.rows.map(r => r.name));
}

main().catch(console.error);
