import { NextRequest, NextResponse } from "next/server";
import { findByReferralCode, rankForPoints } from "@/lib/storage";
import { isReferralCode, truncateWallet } from "@/lib/referral";

export const dynamic = "force-dynamic";

/**
 * Public info about whoever owns a referral code — shown to visitors who
 * arrive through someone's link. Referral codes are meant to be shared, so
 * this is public by design, but the wallet is still truncated before it
 * leaves the server and nothing else about the row is exposed.
 */
export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") ?? "").trim().toUpperCase();

  if (!isReferralCode(code)) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  const referrer = await findByReferralCode(code);
  if (!referrer) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  return NextResponse.json({
    found: true,
    handle: referrer.handle,
    wallet: truncateWallet(referrer.wallet),
    points: referrer.points,
    rank: await rankForPoints(referrer.points),
  });
}
