import { promises as fs } from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface AllowlistEntry {
  wallet: string;
  quoteUrl: string;
  /** Parsed out of the quote URL. */
  handle?: string;
  followed: boolean;
  reposted: boolean;
  createdAt: string;
}

/*
 * Storage has two backends:
 *
 *   Supabase  — used whenever SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are
 *               set. This is the real one, and the only one that works in
 *               production: Vercel's filesystem is read-only, so file writes
 *               there always fail.
 *   JSON file — a local-dev convenience so `npm run dev` works with no
 *               accounts or env vars set up.
 *
 * The service role key bypasses row-level security, so it must never reach
 * the browser. It has no NEXT_PUBLIC_ prefix precisely so Next.js can't
 * inline it into client bundles, and it's only read here — in code that runs
 * exclusively on the server.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

/** True when a real database is configured. */
export function hasDatabase(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

// ---------------------------------------------------------------- Supabase

async function addEntrySupabase(
  db: SupabaseClient,
  entry: AllowlistEntry
): Promise<{ persisted: boolean; error?: string }> {
  const { error } = await db.from("allowlist").upsert(
    {
      wallet: entry.wallet,
      quote_url: entry.quoteUrl,
      handle: entry.handle ?? null,
      followed: entry.followed,
      reposted: entry.reposted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "wallet" }
  );

  if (error) {
    console.error("[allowlist] supabase upsert failed:", error.message);
    return { persisted: false, error: error.message };
  }
  return { persisted: true };
}

// --------------------------------------------------------------- JSON file

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "allowlist.json");

async function readFileEntries(): Promise<AllowlistEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function addEntryFile(
  entry: AllowlistEntry
): Promise<{ persisted: boolean; error?: string }> {
  const entries = await readFileEntries();

  const key = entry.wallet.toLowerCase();
  const existing = entries.findIndex((e) => e.wallet.toLowerCase() === key);
  if (existing >= 0) entries[existing] = entry;
  else entries.push(entry);

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
    return { persisted: true };
  } catch {
    console.error(
      "[allowlist] no database configured and the filesystem is read-only. " +
        "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Entry was:",
      JSON.stringify(entry)
    );
    return { persisted: false, error: "Storage is not configured." };
  }
}

// ------------------------------------------------------------------ Public

export async function addEntry(
  entry: AllowlistEntry
): Promise<{ persisted: boolean; error?: string }> {
  const db = getClient();
  return db ? addEntrySupabase(db, entry) : addEntryFile(entry);
}

export async function getAllEntries(): Promise<AllowlistEntry[]> {
  const db = getClient();
  if (!db) return readFileEntries();

  const { data, error } = await db
    .from("allowlist")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[allowlist] supabase select failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    wallet: row.wallet,
    quoteUrl: row.quote_url,
    handle: row.handle ?? undefined,
    followed: row.followed,
    reposted: row.reposted,
    createdAt: row.created_at,
  }));
}
