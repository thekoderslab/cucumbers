import { NextRequest, NextResponse } from "next/server";
import {
  addEntry,
  findByReferralCode,
  awardReferralPoint,
  rankForPoints,
  quoteUrlTaken,
} from "@/lib/storage";
import {
  isEvmAddress,
  isXStatusUrl,
  handleFromStatusUrl,
  statusCreatedAt,
} from "@/lib/validate";
import { X_POST, X_HANDLE, MAX_QUOTE_AGE_MS } from "@/lib/config";
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

  const quoteHandle = handleFromStatusUrl(quoteUrl);

  // Pasting our own post back instead of their quote of it.
  if (quoteHandle?.toLowerCase() === X_HANDLE.toLowerCase()) {
    return NextResponse.json(
      { error: "That's our post — paste the link to your own quote of it." },
      { status: 400 }
    );
  }

  /*
   * Post ids are snowflakes, so creation time is readable straight off the
   * id with no API call. A genuine quote must have been created after the
   * post it quotes, and can't be from the future. Made-up or recycled ids
   * fail this without us ever having to ask X whether the post exists.
   */
  const campaignAt = statusCreatedAt(X_POST);
  const quoteAt = statusCreatedAt(quoteUrl);

  if (!quoteAt) {
    return NextResponse.json(
      { error: "That doesn't look like a real X post link." },
      { status: 400 }
    );
  }

  if (campaignAt && quoteAt.getTime() < campaignAt.getTime()) {
    return NextResponse.json(
      {
        error:
          "That post is older than the one you're quoting. Paste the link to your quote.",
      },
      { status: 400 }
    );
  }

  // Small allowance for clock skew between us and X.
  if (quoteAt.getTime() > Date.now() + 5 * 60 * 1000) {
    return NextResponse.json(
      { error: "That doesn't look like a real X post link." },
      { status: 400 }
    );
  }

  /*
   * The quote has to be fresh. Posting the quote and pasting its link is a
   * matter of seconds, so a link to something posted hours ago is almost
   * always an unrelated real post someone found — the gap the snowflake
   * check can't see. Window lives in config so it can be tightened without
   * touching this logic.
   */
  if (Date.now() - quoteAt.getTime() > MAX_QUOTE_AGE_MS) {
    return NextResponse.json(
      {
        error:
          "That quote is too old. Post a new quote of the pinned post, then paste its link.",
      },
      { status: 400 }
    );
  }

  // One post, one spot. Recycling someone else's quote link across wallets
  // is the cheapest way to fake this step.
  if (await quoteUrlTaken(quoteUrl)) {
    return NextResponse.json(
      { error: "That post has already been used to claim a spot." },
      { status: 409 }
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
