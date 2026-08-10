# Cucumber Hood

Next.js (App Router + TypeScript) site for the Cucumber Hood NFT collection: a click-to-enter intro where the cucumber flies up and slots into the **D of HOOD**, revealing a tabbed landing site, plus a dedicated `/join` allowlist page.

## Before you deploy

**1. Add your art.** Everything is driven by real image files — drop them into `public/art/` using the filenames listed in [`public/art/README.md`](public/art/README.md). Each one is optional; anything missing falls back to a placeholder tile so the site never breaks mid-build.

The one image worth adding first is `public/art/cucumber.png` (transparent PNG) — it's the cucumber in the wordmark's D and on the entry screen.

To rename files, add more, or change captions, edit [`lib/art.ts`](lib/art.ts) — the single source of truth for all imagery.

**2. Fill in the real links.** [`lib/config.ts`](lib/config.ts) holds every external URL:

| Constant | What it is | Status |
| --- | --- | --- |
| `X_PROFILE` | The X account people follow | ✅ set to `x.com/CucumberHoodNFT` |
| `X_POST` | The post to like / repost / quote | ⚠️ **placeholder — must be updated** |
| `OPENSEA` | OpenSea collection | ⚠️ `#` placeholder |
| `SITE` | Domain used in the share text | `cucumbershoodnft.com` |

Until `X_POST` is set to the real post, tasks 2 and 3 on the join page open a dead link.

## Design system

- **Display font:** [Bungee](https://fonts.google.com/specimen/Bungee) — blocky signage face, carries the "Hood" energy. Used for the wordmark, headlines, buttons and labels.
- **Body font:** [Fredoka](https://fonts.google.com/specimen/Fredoka) — rounded and friendly.
- **Look:** screen-printed / sticker style — everything is dark ink on `#CCFF00`, with thick borders, hard offset shadows, slight rotations, a subtle dot texture and scrolling marquee bars. The page background stays `#CCFF00` everywhere; contrast comes from ink-filled components (buttons, badges, dark panels, marquee bars), not from other background colors.
- **Layout:** deliberately asymmetric. Every section runs on a 12-column grid with lopsided spans, off-axis type, staggered cards and rotated panels rather than centered blocks.

## Routes and tabs

- **`/`** — the landing site. Three tabs, switched with client-side state in [`components/MainPage.tsx`](components/MainPage.tsx): **Home**, **The Hood** (the sneak-peek gallery), **Roadmap**. They're a proper ARIA `tablist` with arrow-key/Home/End navigation.
- **`/join`** — a real, separate route, so `cucumbershoodnft.com/join` is directly linkable and people can land on it straight from X. No entry animation there.

The "Join" button in the header is a link to `/join`, not a tab.

## The join flow

[`components/JoinFlow.tsx`](components/JoinFlow.tsx) walks through four tasks with a progress bar; the submit button stays disabled until all four are satisfied:

1. **Follow on X** — opens `X_PROFILE` in a new tab, marks the step done.
2. **Like and repost** — opens `X_POST` in a new tab, marks the step done.
3. **Quote the post** — opens `X_POST`, then unlocks a field for the URL of *their* quote. Validated against an `x.com/<handle>/status/<id>` pattern.
4. **EVM wallet** — validated as `0x` + 40 hex characters.

On success a modal appears with a **Share on X** button that opens X's composer pre-filled with the share text from `lib/config.ts` (the user still presses post themselves).

Steps 1 and 2 are honour-system — X doesn't expose follow/repost state without API credentials and OAuth. The quote URL is the one piece of real evidence captured, and the handle is parsed out of it and stored alongside the wallet, so you can verify submissions against the post afterwards.

Swapping the fonts is a two-line change in [`app/layout.tsx`](app/layout.tsx) — both are wired through the `--font-display` / `--font-body` CSS variables in [`app/globals.css`](app/globals.css).

## The wordmark and the entry animation

The "D" in HOOD is a **custom SVG drawn without its left stem** ([`components/Wordmark.tsx`](components/Wordmark.tsx)), leaving an exact empty slot. The cucumber *is* the stem.

- On the entry screen the slot starts empty with a pulsing dashed outline. Clicking the cucumber measures the slot with `getBoundingClientRect()`, writes the delta into CSS variables, and a keyframe animation flies the cucumber into place with a wind-up and a bounce settle — so it lands precisely at any viewport size.
- The main page's header and footer render the same wordmark with the slot already filled.

Timing from click: fly `750ms` → impact/settle `300ms` → overlay exit `500ms` = **1.55s total**. The entry plays once per browser session (`sessionStorage`).

**If the D ever looks misaligned** with the neighbouring letters, tune the single `--cap` variable in [`app/globals.css`](app/globals.css) — it's the display font's cap height as a fraction of font size (currently `0.72em`). That one value controls the SVG D's size and baseline alignment.

Everything is CSS keyframes/transitions — no animation library. All motion respects `prefers-reduced-motion`.

## Running locally

Requires Node.js 18.18+ (20+ recommended).

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploying to Vercel

Push this repo to GitHub and import it in Vercel, or run `vercel` from the project root. No environment variables are required for the default setup.

## Allowlist storage (Supabase) — required for production

Submissions go to Supabase. **Without it configured, nothing is saved in production** — Vercel's filesystem is read-only, so the local-JSON fallback can only work in `npm run dev`.

Setup, once:

1. Create a project at [supabase.com](https://supabase.com) (free tier is plenty).
2. Open **SQL Editor → New query**, paste [`supabase/schema.sql`](supabase/schema.sql), run it.
3. Go to **Project Settings → API** and copy the **Project URL** and the **`service_role`** key.
4. Add both to Vercel under **Settings → Environment Variables** (and to `.env.local` for local dev — see [`.env.example`](.env.example)):

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. Redeploy.

**Never give either variable a `NEXT_PUBLIC_` prefix.** The service role key bypasses row-level security; prefixing it would inline it into the JavaScript bundle served to every visitor, handing anyone full read/write access to your allowlist. It's read only in [`lib/storage.ts`](lib/storage.ts), which runs server-side only.

The schema enables row-level security with no policies, so the public anon key can't read the table either — wallets and handles are only reachable via the service role.

## Referral system

Run [`supabase/referrals.sql`](supabase/referrals.sql) in the SQL Editor **after** `schema.sql`. It adds `referral_code`, `referred_by` and `points`, plus an `award_referral_point` function. Safe to re-run.

**How it works**

- Every signup gets a referral code derived from their wallet (`sha256(wallet)`, first 8 hex chars, uppercased). Deriving rather than randomising means the same wallet always yields the same code, re-submitting can't mint a second one, and there's no generate-check-retry loop against the unique index.
- Their link is `https://<SITE>/join?ref=CODE`, shown on the success screen with a copy button.
- Arriving with `?ref=` stores the code in `localStorage`, so it survives the round trip to X and back — people routinely return in a fresh tab without the query string.
- On a successful signup the referrer gets **10 points**. Top **10** hold a guaranteed spot.

**Points are awarded in the database, not the API.** Read-add-write from the route would silently drop awards whenever two referrals landed at once — both reads see the same value, the second write overwrites the first. `award_referral_point` does it in a single `UPDATE`.

**Anti-abuse.** A referral only scores when the new signup passes the checks the funnel already requires — follow, repost, and a valid X post URL for the quote. A bare API POST earns nothing. Self-referral is blocked on wallet **and** on X handle, so the same account on a second wallet doesn't count.

⚠️ **Steps 1 and 2 remain honour-system.** X doesn't expose follow/repost state without API credentials and OAuth, so the button click is taken at face value. The quote URL is the only real evidence — it's a live post that must exist and parse. With points now worth something, expect people to farm with multiple wallets: fresh wallets are free, and only the X account is any friction. Before this matters, consider rate limiting by IP and reviewing the top of the leaderboard by hand against the actual quote posts.

### Leaderboard

`/api/leaderboard` returns the top 10 by points, server-side via the service role — RLS stays locked, and wallets are truncated before they leave the server. The Leaderboard tab polls every 30s while open.

### Exporting the list

Supabase dashboard → **Table Editor → allowlist → Export to CSV**. Wallets are unique (re-submitting an address updates the row instead of duplicating it), and the `handle` column is parsed from each quote URL so you can cross-check entries against the post.

### If it isn't configured

The API route returns a 503 and the form shows an error rather than falsely confirming a spot. A silent success over a dropped signup would be worse than an honest failure, so this is deliberate — if you see that error in production, the env vars aren't set.

### Worth knowing

An open allowlist form will attract bots. Nothing here rate-limits or proves the tasks were done — steps 1 and 2 are honour-system, and the quote URL isn't verified against the X API. Before launch consider adding rate limiting and, if spots are valuable, verifying quote URLs against the real post.

## Project structure

- `app/page.tsx` — shows the entry animation once per session, then the landing site underneath
- `app/join/page.tsx` — the standalone `/join` allowlist page
- `components/Wordmark.tsx` — the CUCUMBER HOOD wordmark with the cucumber-as-D
- `components/EntryScreen.tsx` — click-to-enter animation
- `components/MainPage.tsx` — tabs + the Home / The Hood / Roadmap panels
- `components/JoinFlow.tsx` — the four-task allowlist flow and success modal
- `components/SmartImage.tsx` — image with a fallback chain and placeholder tile
- `components/Marquee.tsx` — scrolling sticker bars
- `app/api/allowlist/route.ts` — validates and stores submissions
- `lib/art.ts` — every image path and label used on the site
- `lib/config.ts` — external URLs and share copy
- `lib/validate.ts` — EVM address and X post URL validation, shared client/server
- `lib/storage.ts` — storage layer (see the Vercel note above)
