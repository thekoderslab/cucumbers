import { promises as fs } from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { POINTS_PER_REFERRAL } from "./referral";

export interface SaveResult {
  persisted: boolean;
  /** The wallet is already on the allowlist. */
  duplicate?: boolean;
  /** The signup's own referral code, whether newly created or pre-existing. */
  referralCode?: string;
  points?: number;
  error?: string;
}

export interface AllowlistEntry {
  wallet: string;
  quoteUrl: string;
  /** Parsed out of the quote URL. */
  handle?: string;
  followed: boolean;
  reposted: boolean;
  referralCode: string;
  /** Referral code this person arrived with, if any. */
  referredBy?: string;
  createdAt: string;
}

export interface Referrer {
  wallet: string;
  handle?: string;
  referralCode: string;
}

export interface LeaderboardRow {
  /** Already truncated — full addresses never leave the server. */
  wallet: string;
  handle?: string;
  points: number;
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

/** Postgres unique_violation. */
const UNIQUE_VIOLATION = "23505";

async function addEntrySupabase(
  db: SupabaseClient,
  entry: AllowlistEntry
): Promise<SaveResult> {
  /*
   * A plain insert, letting the UNIQUE (wallet) constraint reject repeats.
   * Checking for an existing row first would leave a race: two submissions
   * of the same wallet at once would both see "not there" and both proceed.
   * The database is the only place that can decide this atomically.
   */
  const { error } = await db.from("allowlist").insert({
    // Lowercased so the constraint dedupes properly — the same address with
    // different checksum casing is one wallet.
    wallet: entry.wallet.toLowerCase(),
    quote_url: entry.quoteUrl,
    handle: entry.handle ?? null,
    followed: entry.followed,
    reposted: entry.reposted,
    referral_code: entry.referralCode,
    referred_by: entry.referredBy ?? null,
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      // Hand back the existing code so a repeat visitor can still get their
      // referral link instead of hitting a dead end.
      const existing = await getByWalletSupabase(db, entry.wallet);
      return {
        persisted: false,
        duplicate: true,
        referralCode: existing?.referralCode,
        points: existing?.points,
      };
    }
    console.error("[allowlist] supabase insert failed:", error.message);
    return { persisted: false, error: error.message };
  }

  return { persisted: true, referralCode: entry.referralCode, points: 0 };
}

async function getByWalletSupabase(
  db: SupabaseClient,
  wallet: string
): Promise<{ referralCode: string; points: number } | null> {
  const { data } = await db
    .from("allowlist")
    .select("referral_code, points")
    .eq("wallet", wallet.trim().toLowerCase())
    .maybeSingle();

  return data
    ? { referralCode: data.referral_code, points: data.points ?? 0 }
    : null;
}

// ------------------------------------------------------------------ Public

export async function addEntry(entry: AllowlistEntry): Promise<SaveResult> {
  const db = getClient();
  return db ? addEntrySupabase(db, entry) : addEntryFile(entry);
}

/**
 * Has this exact quote post already been used to claim a spot? Two people
 * cannot own the same post, so a repeat means one wallet is recycling
 * another's link — the cheapest way to fake the quote step.
 */
export async function quoteUrlTaken(quoteUrl: string): Promise<boolean> {
  const db = getClient();
  if (!db) {
    const entries = await readFileEntries();
    return entries.some((e) => e.quoteUrl === quoteUrl);
  }

  const { count } = await db
    .from("allowlist")
    .select("*", { count: "exact", head: true })
    .eq("quote_url", quoteUrl);

  return (count ?? 0) > 0;
}

/** Who owns this referral code, if anyone. */
export async function findByReferralCode(
  code: string
): Promise<Referrer | null> {
  const db = getClient();
  if (!db) {
    const entries = await readFileEntries();
    const row = entries.find((e) => e.referralCode === code);
    return row
      ? { wallet: row.wallet, handle: row.handle, referralCode: code }
      : null;
  }

  const { data } = await db
    .from("allowlist")
    .select("wallet, handle, referral_code")
    .eq("referral_code", code)
    .maybeSingle();

  return data
    ? {
        wallet: data.wallet,
        handle: data.handle ?? undefined,
        referralCode: data.referral_code,
      }
    : null;
}

/** Increments the referrer's points. Atomic — see referrals.sql. */
export async function awardReferralPoint(code: string): Promise<boolean> {
  const db = getClient();
  if (!db) return false;

  const { error } = await db.rpc("award_referral_point", {
    code,
    amount: POINTS_PER_REFERRAL,
  });

  if (error) {
    console.error("[allowlist] award_referral_point failed:", error.message);
    return false;
  }
  return true;
}

/** How many people are ahead of this score. Only meaningful above zero. */
export async function rankForPoints(points: number): Promise<number | null> {
  const db = getClient();
  if (!db || points <= 0) return null;

  const { count, error } = await db
    .from("allowlist")
    .select("*", { count: "exact", head: true })
    .gt("points", points);

  if (error) return null;
  return (count ?? 0) + 1;
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardRow[]> {
  const db = getClient();
  if (!db) return [];

  const { data, error } = await db
    .from("allowlist")
    .select("wallet, handle, points")
    .gt("points", 0)
    .order("points", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[allowlist] leaderboard query failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    wallet: row.wallet,
    handle: row.handle ?? undefined,
    points: row.points ?? 0,
  }));
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

async function addEntryFile(entry: AllowlistEntry): Promise<SaveResult> {
  const entries = await readFileEntries();

  const key = entry.wallet.toLowerCase();
  const existing = entries.find((e) => e.wallet.toLowerCase() === key);
  if (existing) {
    return {
      persisted: false,
      duplicate: true,
      referralCode: existing.referralCode,
    };
  }
  entries.push({ ...entry, wallet: key });

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
    return { persisted: true, referralCode: entry.referralCode, points: 0 };
  } catch {
    console.error(
      "[allowlist] no database configured and the filesystem is read-only. " +
        "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Entry was:",
      JSON.stringify(entry)
    );
    return { persisted: false, error: "Storage is not configured." };
  }
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
    referralCode: row.referral_code,
    referredBy: row.referred_by ?? undefined,
    createdAt: row.created_at,
  }));
}
