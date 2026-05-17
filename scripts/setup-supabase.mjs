/**
 * Applies supabase/schema.sql via direct Postgres connection.
 *
 * Recommended: use Supabase SQL Editor instead (no local Postgres needed):
 * https://supabase.com/dashboard/project/bmfkzyocyluqpjeamupb/sql/new
 * Schema file: frontend/supabase/schema.sql (synced from airo_schema.sql)
 *
 * For this script, paste the FULL connection URI from:
 * Supabase → Settings → Database → Connection string → Session pooler (IPv4)
 *
 *   SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-....pooler.supabase.com:5432/postgres
 */

import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const PROJECT_REF = "bmfkzyocyluqpjeamupb";
const SQL_EDITOR = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`;

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error(`
Could not connect using SUPABASE_DB_PASSWORD alone.

The host db.${PROJECT_REF}.supabase.co is IPv6-only and often fails locally (ENOTFOUND).

Use ONE of these:

━━━ Option A (easiest) ━━━
1. Open: ${SQL_EDITOR}
2. Paste all of: frontend/supabase/schema.sql
3. Click Run

━━━ Option B (terminal) ━━━
1. Supabase → Settings → Database → Connection string
2. Choose "Session pooler" (IPv4) — NOT "Direct connection"
3. Copy the URI and add to .env.local:

   SUPABASE_DB_URL=postgresql://postgres.${PROJECT_REF}:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres

4. Run: npm run db:setup
`);
  process.exit(1);
}

const schemaPath = path.join(root, "supabase", "schema.sql");
const sql = fs.readFileSync(schemaPath, "utf8");

async function connect() {
  dns.setDefaultResultOrder("ipv6first");
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

let client;
try {
  client = await connect();
  console.log("Connected. Applying schema…");
  await client.query(sql);
  console.log("Done. Tables: patients, doctors, reports, soap_notes, …");
  console.log("Restart: npm run dev");
} catch (err) {
  console.error("Setup failed:", err.message);
  if (/ENOTFOUND|getaddrinfo/i.test(err.message)) {
    console.error(`
→ Your network cannot reach that database host.
  Use the SQL Editor instead: ${SQL_EDITOR}
  Or paste the Session pooler URI (not Direct) as SUPABASE_DB_URL.`);
  }
  if (/password authentication failed/i.test(err.message)) {
    console.error("→ Wrong password. Reset in Supabase → Database → Reset database password.");
  }
  process.exit(1);
} finally {
  if (client) await client.end();
}
