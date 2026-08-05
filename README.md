# Cucumber Hood

Single-page Next.js (App Router + TypeScript) site for the Cucumber Hood NFT collection: a click-to-enter animated intro that reveals the main allowlist page.

## Before you deploy

**Add the mascot image.** Save your cucumber photo/art as:

```
public/cucumber-base.png
```

Until that file exists, the site automatically falls back to a simple SVG placeholder cucumber (`public/cucumber-placeholder.svg`) so nothing breaks — but swap in the real image before launch. Sunglasses and the cap are drawn in code (`components/CucumberDecor.tsx`) and composited on top of whatever image is at that path, so you only need the one base image.

**Update placeholder links.** `SOCIALS` in [`components/MainPage.tsx`](components/MainPage.tsx) has placeholder X/Discord URLs — point them at the real ones.

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

The `/api/allowlist` route (see [`lib/storage.ts`](lib/storage.ts)) writes submissions to a local JSON file at `data/allowlist.json`. That works great in local dev (`npm run dev`) but **Vercel's serverless filesystem is read-only in production**, so file-based storage won't actually persist submissions once deployed there — each invocation runs in a fresh, ephemeral environment.

To keep things simple for now, failed writes are logged instead (visible in the Vercel function logs), so you won't lose data silently — but for real, durable capture in production you'll want to swap `lib/storage.ts`'s internals for a hosted store, for example:

- **Vercel Postgres / Vercel KV** — add the integration from the Vercel dashboard (same account, a few clicks, no separate signup)
- **Supabase / PlanetScale** — free tier, a few lines of client code
- **Airtable or Formspree** — if you'd rather not manage a database at all

The rest of the app only calls `addEntry()` / `getAllEntries()`, so the swap is contained to that one file.

## Project structure

- `app/page.tsx` — top-level page; shows the entry animation once per browser session (via `sessionStorage`), then the main page underneath
- `components/EntryScreen.tsx` — click-to-enter animation (spin → sunglasses drop → pause → fade out)
- `components/MainPage.tsx` — header, hero, allowlist section, trait preview, footer
- `components/AllowlistForm.tsx` — the signup form (wallet, optional email, X handle)
- `app/api/allowlist/route.ts` — API route that validates and stores submissions
- `lib/storage.ts` — storage layer (see the Vercel note above)
