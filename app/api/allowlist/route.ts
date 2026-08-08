import { NextRequest, NextResponse } from "next/server";
import { addEntry } from "@/lib/storage";
import { isEvmAddress, isXStatusUrl, handleFromStatusUrl } from "@/lib/validate";

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

  const result = await addEntry({
    wallet,
    quoteUrl,
    handle: handleFromStatusUrl(quoteUrl),
    followed: data.followed === true,
    reposted: data.reposted === true,
    createdAt: new Date().toISOString(),
  });

  // Never confirm a spot we didn't actually store — a cheerful success
  // screen over a dropped entry is worse than an honest error.
  if (!result.persisted) {
    return NextResponse.json(
      { error: "We couldn't save your spot. Please try again shortly." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
