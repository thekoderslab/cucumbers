import { NextRequest, NextResponse } from "next/server";
import {
  addEntry,
  findByReferralCode,
  awardReferralPoint,
  rankForPoints,
} from "@/lib/storage";
import { isEvmAddress, isXStatusUrl, handleFromStatusUrl } from "@/lib/validate";
import { referralUrl, isReferralCode } from "@/lib/referral";
import { referralCodeFor } from "@/lib/referral-code";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const wallet = typeof data.wallet === "string" ? data.wallet.trim() : "";
  const quoteUrl = typeof data.quoteUrl === "string" ? data.quoteUrl.trim() : "";
  const ref = typeof data.ref === "string" ? data.ref.trim().toUpperCase() : "";

  if (!isEvmAddress(wallet)) {
    return NextResponse.json(
      { error: "Enter a valid EVM address (0x + 40 characters)." },
      { status: 400 }
    );
  }

  if (!isXStatusUrl(quoteUrl)) {
    return NextResponse.json(
      { error: "That doesn't look like an X post link." },
      { status: 400 }
    );
  }

  /*
   * Verification gate for referral points. These are the checks the funnel
   * already requires, reused rather than re-invented: the follow and repost
   * steps, plus a real X post URL for the quote. Points are only awarded when
   * all of them are satisfied, so a bare form POST earns the referrer nothing.
   */
  const followed = data.followed === true;
  const reposted = data.reposted === true;
  const handle = handleFromStatusUrl(quoteUrl);
  const verified = followed && reposted && Boolean(handle);

  const referralCode = referralCodeFor(wallet);

  const result = await addEntry({
    wallet,
    quoteUrl,
    handle,
    followed,
    reposted,
    referralCode,
    referredBy: isReferralCode(ref) ? ref : undefined,
    createdAt: new Date().toISOString(),
  });

  if (result.duplicate) {
    // Still hand back their link — being already registered shouldn't mean
    // losing access to your own referral URL.
    return NextResponse.json(
      {
        error: "This wallet is already on the allowlist. You're in.",
        duplicate: true,
        referralCode: result.referralCode,
        referralUrl: result.referralCode
          ? referralUrl(result.referralCode)
          : undefined,
        points: result.points ?? 0,
      },
      { status: 409 }
    );
  }

  // Never confirm a spot we didn't actually store — a cheerful success
  // screen over a dropped entry is worse than an honest error.
  if (!result.persisted) {
    return NextResponse.json(
      { error: "We couldn't save your spot. Please try again shortly." },
      { status: 503 }
    );
  }

  // --- Referral attribution -------------------------------------------
  // Deliberately after the insert: the signup is what matters, so a problem
  // crediting someone else must never cost this person their spot.
  if (isReferralCode(ref) && ref !== referralCode && verified) {
    try {
      const referrer = await findByReferralCode(ref);
      const selfReferral =
        referrer &&
        (referrer.wallet.toLowerCase() === wallet.toLowerCase() ||
          // Same X account on a second wallet is still self-referral.
          (Boolean(handle) &&
            referrer.handle?.toLowerCase() === handle?.toLowerCase()));

      if (referrer && !selfReferral) {
        await awardReferralPoint(ref);
      }
    } catch (err) {
      console.error("[allowlist] referral attribution failed:", err);
    }
  }

  return NextResponse.json({
    ok: true,
    referralCode,
    referralUrl: referralUrl(referralCode),
    points: 0,
    rank: await rankForPoints(0),
  });
}
