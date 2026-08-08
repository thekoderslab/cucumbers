# Art assets

The gallery on The Hood tab is driven by the files in this folder. The
mapping of filename → caption lives in [`lib/art.ts`](../../lib/art.ts) —
that's the single source of truth. Add, remove or rename art there and the
page follows.

## Currently wired up

| File | Caption |
| --- | --- |
| `cucumber-0001.png` | Robin Hood |
| `cucumber-0741.png` | TMA |
| `cucumber-0025.png` | Punk |
| `cucumber-0177.png` | The King |
| `cucumber-0002.png` | Sheriff |
| `cucumber-0176.png` | Wizard |
| `cucumber-0020.png` | Full Send |
| `cucumber-0184.png` | Shutterbug |
| `cucumber-0175.png` | The General |
| `cucumber-0310.png` | Chef |
| `cucumber-0246.png` | Farmhand |
| `cucumber-0218.png` | Inspector |

The grid layout in `MainPage.module.css` is tuned for exactly 12 tiles — if
you add more, extend the `.shot:nth-child(n)` rules to match, or they'll
fall back to plain auto-placement (which still works, just less deliberate).

## The plain cucumber

The wordmark's **D**, the entry screen, the Home hero, the Join page and the
success popup all use `/public/cucumber-base.png` — the plain transparent
cucumber. To swap it, replace that file, or edit the `CUCUMBER` / `HERO`
chains in [`lib/art.ts`](../../lib/art.ts).

⚠️ Only ever list files that **exist** in those chains. A missing file at the
front costs a 404 on every page load, and since the markup is server-rendered
it can fail before React hydrates — which previously left the entry screen
cucumber invisible.

## A note on file size

These are ~800KB–1MB each, ~10MB for the set. They're lazy-loaded so only
what's on screen downloads, but converting them to WebP would cut that by
roughly 70% with no visible difference. Worth doing before launch if traffic
is coming from phones.
