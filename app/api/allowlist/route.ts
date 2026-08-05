import { NextRequest, NextResponse } from "next/server";
import { addEntry } from "@/lib/storage";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const wallet = typeof data.wallet === "string" ? data.wallet.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const twitter = typeof data.twitter === "string" ? data.twitter.trim() : "";

  if (!wallet) {
    return NextResponse.json(
      { error: "Wallet address is required." },
      { status: 400 }
    );
  }
  if (!twitter) {
    return NextResponse.json(
      { error: "X handle is required." },
      { status: 400 }
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "That email doesn't look right." },
      { status: 400 }
    );
  }

  await addEntry({
    wallet,
    email: email || undefined,
    twitter,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
