import { promises as fs } from "fs";
import path from "path";

export interface AllowlistEntry {
  wallet: string;
  quoteUrl: string;
  /** Parsed out of the quote URL. */
  handle?: string;
  followed: boolean;
  reposted: boolean;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "allowlist.json");

async function readAll(): Promise<AllowlistEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persists an allowlist submission to a local JSON file.
 *
 * NOTE: On serverless hosts like Vercel the filesystem is read-only in
 * production (outside /tmp, which itself doesn't persist between
 * invocations), so this file-based store only survives in `next dev` or on a
 * traditional always-on server. When the write fails we still log the entry
 * so it shows up in the platform's function logs instead of vanishing
 * silently. To get real persistence on Vercel, swap this module's internals
 * for a hosted store (Vercel KV/Postgres, Supabase, etc.) — the rest of the
 * app only depends on `addEntry`/`getAllEntries`, so the swap is contained
 * to this file.
 */
export async function addEntry(
  entry: AllowlistEntry
): Promise<{ persisted: boolean }> {
  const entries = await readAll();

  // Re-submitting the same wallet updates the existing row rather than
  // adding a duplicate.
  const key = entry.wallet.toLowerCase();
  const existing = entries.findIndex((e) => e.wallet.toLowerCase() === key);
  if (existing >= 0) entries[existing] = entry;
  else entries.push(entry);

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
    return { persisted: true };
  } catch {
    console.log(
      "[allowlist] filesystem write failed (expected on serverless/Vercel); logging entry instead:",
      JSON.stringify(entry)
    );
    return { persisted: false };
  }
}

export async function getAllEntries(): Promise<AllowlistEntry[]> {
  return readAll();
}
