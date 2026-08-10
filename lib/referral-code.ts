import "server-only";
import { createHash } from "crypto";

/**
 * Server-only: uses Node's crypto, so importing this from a client component
 * would break the bundle. `server-only` turns that mistake into a build error
 * instead of a confusing runtime one.
 *
 * The code is derived from the wallet rather than random, so it's stable: the
 * same wallet always gets the same code, re-submitting can't mint a second
 * one, and there's no generate-check-retry loop against the unique index.
 */
export function referralCodeFor(wallet: string): string {
  return createHash("sha256")
    .update(wallet.trim().toLowerCase())
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();
}
