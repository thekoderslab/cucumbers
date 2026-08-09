import { statusIdFromUrl } from "./validate";

/**
 * Links and copy that change independently of the code.
 * Update these before launch.
 */

/** Official X handle, without the @. */
export const X_HANDLE = "CucumberHoodNFT";

export const X_PROFILE = `https://x.com/${X_HANDLE}`;

/**
 * The allowlist post on X that people have to like, repost and quote.
 * Keep it in canonical form — no ?s= tracking params — since the post id is
 * parsed out of it to build the like/repost intents.
 */
export const X_POST =
  "https://x.com/CucumberHoodNFT/status/2086407275770687975";

/** OpenSea collection. TODO: replace "#" with the real URL when it's live. */
export const OPENSEA = "#";

/** Public site domain, used in the share and quote copy. */
export const SITE = "cucumberhoodnft.xyz";

/** Text pre-filled into the share composer after someone joins. */
export const SHARE_TEXT = `I got the spot in @${X_HANDLE} go get yours at ${SITE}/join now.`;

/**
 * Text pre-filled into the quote composer for task 3. X appends the post URL
 * after this, which is what turns the post into a quote.
 */
export const QUOTE_TEXT = `just a chill cucumber i love these @${X_HANDLE}
want your spot? go get it 🥒
${SITE}`;

/*
 * X Web Intents — these open a small action dialog (follow / like / repost /
 * composer) instead of just landing on the page, so the user is one click
 * from done. X controls this behaviour: signed-out users get a login prompt
 * first, and if X ever retires an intent the URL degrades to the normal page.
 * Each helper falls back to the plain post/profile URL when it can't build an
 * intent, so a task is never a dead link.
 */

const POST_ID = statusIdFromUrl(X_POST);

/** Opens the "Follow @handle" dialog. */
export function followIntentUrl(): string {
  return `https://x.com/intent/follow?screen_name=${encodeURIComponent(X_HANDLE)}`;
}

/** Opens the "Like this post" dialog. */
export function likeIntentUrl(): string {
  return POST_ID ? `https://x.com/intent/like?tweet_id=${POST_ID}` : X_POST;
}

/** Opens the "Repost this post" dialog. */
export function repostIntentUrl(): string {
  return POST_ID ? `https://x.com/intent/retweet?tweet_id=${POST_ID}` : X_POST;
}

/**
 * Opens the composer pre-filled with QUOTE_TEXT and the post attached, so
 * posting it produces a quote — saving them from writing anything or hunting
 * for the quote button. They can still edit the text before posting.
 */
export function quoteIntentUrl(): string {
  const params = new URLSearchParams({ text: QUOTE_TEXT, url: X_POST });
  return `https://x.com/intent/post?${params.toString()}`;
}

/** Opens the composer pre-filled — the user still hits post themselves. */
export function shareIntentUrl(): string {
  const params = new URLSearchParams({ text: SHARE_TEXT, url: X_POST });
  return `https://x.com/intent/post?${params.toString()}`;
}

/**
 * Only add target/rel for links that actually leave the site — a "#"
 * placeholder opening a blank tab would be a dead end.
 */
export function externalLinkProps(href: string) {
  return href.startsWith("http")
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
}
