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

/** OpenSea collection. TODO: replace "#" with the real URL when it's live. */
export const OPENSEA = "#";

/**
 * Only add target/rel for links that actually leave the site — a "#"
 * placeholder opening a blank tab would be a dead end.
 */
export function externalLinkProps(href: string) {
  return href.startsWith("http")
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
}

/** Public site URL, used in the share text. */
export const SITE = "cucumbershoodnft.com";

/** Text pre-filled into the share composer after someone joins. */
export const SHARE_TEXT = `I got the spot in @CucumberHoodNFT go get yours at ${SITE}/join now.`;

/** Opens X's composer pre-filled — the user still hits post themselves. */
export function shareIntentUrl(): string {
  const params = new URLSearchParams({ text: SHARE_TEXT, url: X_POST });
  return `https://x.com/intent/post?${params.toString()}`;
}
