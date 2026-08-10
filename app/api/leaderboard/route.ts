import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/storage";
import { truncateWallet, GTD_SPOTS } from "@/lib/referral";

// Always read fresh — a cached leaderboard is a wrong leaderboard.
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getLeaderboard(GTD_SPOTS);

  return NextResponse.json({
    gtdSpots: GTD_SPOTS,
    rows: rows.map((row, i) => ({
      rank: i + 1,
      // Truncated here so full addresses never leave the server.
      wallet: truncateWallet(row.wallet),
      handle: row.handle,
      points: row.points,
    })),
  });
}
