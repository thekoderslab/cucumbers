# Cucumber Hood

Single-page Next.js (App Router + TypeScript) site for the Cucumber Hood NFT collection: a click-to-enter intro where the cucumber flies up and slots into the **D of HOOD**, revealing the main allowlist page.

## Before you deploy

**1. Add the mascot image.** Save your cucumber art as:

```
public/cucumber-base.png
```

Use a **transparent PNG** — the cucumber sits directly on the lime background and inside the wordmark's D, so a white box around it will show. Until the file exists, the site falls back to a simple SVG placeholder (`public/cucumber-placeholder.svg`) so nothing breaks.

Sunglasses and the cap are drawn in code (`components/CucumberDecor.tsx`) and composited over whatever image is at that path, so you only need the one base image.

**2. Update placeholder links.** `SOCIALS` in [`components/MainPage.tsx`](components/MainPage.tsx) has placeholder X/Discord URLs.

## Design system

- **Display font:** [Bungee](https://fonts.google.com/specimen/Bungee) — blocky signage face, carries the "Hood" energy. Used for the wordmark, headlines, buttons and labels.
- **Body font:** [Fredoka](https://fonts.google.com/specimen/Fredoka) — rounded and friendly.
- **Look:** screen-printed / sticker style — everything is dark ink on `#CCFF00`, with thick borders, hard offset shadows, slight rotations, a subtle dot texture and scrolling marquee bars. The page background stays `#CCFF00` everywhere; contrast comes from ink-filled components (buttons, badges, marquee bars), not from other background colors.

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

### ⚠️ Allowlist storage on Vercel

The `/api/allowlist` route (see [`lib/storage.ts`](lib/storage.ts)) writes submissions to a local JSON file at `data/allowlist.json`. That works in local dev (`npm run dev`) but **Vercel's serverless filesystem is read-only in production**, so file-based storage won't persist submissions once deployed there — each invocation runs in a fresh, ephemeral environment.

Failed writes are logged instead (visible in the Vercel function logs), so you won't lose data silently — but for durable capture in production, swap `lib/storage.ts`'s internals for a hosted store:

- **Vercel Postgres / Vercel KV** — add the integration from the Vercel dashboard (same account, a few clicks)
- **Supabase / PlanetScale** — free tier, a few lines of client code
- **Airtable or Formspree** — if you'd rather not manage a database

The rest of the app only calls `addEntry()` / `getAllEntries()`, so the swap is contained to that one file.

## Project structure

- `app/page.tsx` — shows the entry animation once per session, then the main page underneath
- `components/Wordmark.tsx` — the CUCUMBER HOOD wordmark with the cucumber-as-D
- `components/EntryScreen.tsx` — click-to-enter animation
- `components/MainPage.tsx` — header, hero, vibes cards, allowlist, trait preview, footer
- `components/Marquee.tsx` — scrolling sticker bars
- `components/AllowlistForm.tsx` — signup form (wallet, optional email, X handle)
- `app/api/allowlist/route.ts` — validates and stores submissions
- `lib/storage.ts` — storage layer (see the Vercel note above)
