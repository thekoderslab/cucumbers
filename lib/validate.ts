/** Shared client/server validation for allowlist submissions. */

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const X_STATUS =
  /^https?:\/\/(www\.)?(x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d{5,25})/;

export function isEvmAddress(value: string): boolean {
  return EVM_ADDRESS.test(value.trim());
}

export function isXStatusUrl(value: string): boolean {
  return X_STATUS.test(value.trim());
}

/** Pulls the @handle out of a post URL, e.g. .../CucumberHood/status/123. */
export function handleFromStatusUrl(value: string): string | undefined {
  const match = X_STATUS.exec(value.trim());
  return match?.[3];
}

/** Pulls the numeric post id out of a post URL — what X intents need. */
export function statusIdFromUrl(value: string): string | undefined {
  const match = X_STATUS.exec(value.trim());
  return match?.[4];
}

/**
 * X post ids are snowflakes: the top 41 bits are milliseconds since the
 * Twitter epoch. That means a post's creation time can be read straight off
 * its id, with no API call and no way to forge it — the id *is* the
 * timestamp. Used to reject quotes claiming to predate the post they quote.
 */
const TWITTER_EPOCH = 1288834974657;

export function statusCreatedAt(value: string): Date | undefined {
  const id = statusIdFromUrl(value);
  if (!id) return undefined;
  try {
    const ms = (BigInt(id) >> 22n) + BigInt(TWITTER_EPOCH);
    const date = new Date(Number(ms));
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}
