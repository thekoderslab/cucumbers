/**
 * Links and copy that change independently of the code.
 * Update these before launch.
 */

/** Official X profile — used by the "follow" task. */
export const X_PROFILE = "https://x.com/CucumberHoodNFT";

/**
 * The allowlist post on X that people have to like, repost and quote.
 * TODO: replace with the real post URL once it's live.
 */
export const X_POST = "https://x.com/CucumberHoodNFT/status/0000000000000000000";

export const DISCORD = "https://discord.gg/cucumberhood";

/** Public site URL, used in the share text. */
export const SITE = "cucumbershoodnft.com";

/** Text pre-filled into the share composer after someone joins. */
export const SHARE_TEXT = `I got the spot in @CucumberHoodNFT go get yours at ${SITE}/join now.`;

/** Opens X's composer pre-filled — the user still hits post themselves. */
export function shareIntentUrl(): string {
  const params = new URLSearchParams({ text: SHARE_TEXT, url: X_POST });
  return `https://x.com/intent/post?${params.toString()}`;
}
