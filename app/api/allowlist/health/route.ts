import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/storage";
import { createClient } from "@supabase/supabase-js";

/**
 * Diagnostic for the allowlist storage wiring. Visit /api/allowlist/health.
 *
 * Reports whether the env vars are present and whether the table is actually
 * reachable, so a failing signup can be diagnosed without digging through
 * function logs. It exposes no allowlist data — only a row count.
 *
 * Safe to delete once storage is confirmed working.
 */
export async function GET() {
  const configured = hasDatabase();

  if (!configured) {
    return NextResponse.json({
      configured: false,
      ok: false,
      hint:
        "SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are not set in this " +
        "environment. Add them in Vercel → Settings → Environment Variables, " +
        "then redeploy (env vars only apply to new builds).",
    });
  }

  const db = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { count, error } = await db
    .from("allowlist")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({
      configured: true,
      ok: false,
      code: error.code,
      error: error.message,
      hint:
        error.code === "42P01"
          ? "The allowlist table doesn't exist — run supabase/schema.sql."
          : "Check the key is the service_role key, not anon.",
    });
  }

  return NextResponse.json({ configured: true, ok: true, rows: count ?? 0 });
}
