# Art assets

Drop your artwork here using these exact filenames. Every one is optional —
the site falls back to a labelled placeholder tile until the file exists, so
you can add them one at a time.

## The gallery (The Hood tab)

| File | Which one |
| --- | --- |
| `fisher.png` | Blue shades + antenna + fishing rod |
| `paperbag.png` | Paper bag head + hawaiian shirt + teddy |
| `robin.png` | Robin Hood hat + bow |
| `sheriff.png` | Cowboy hat + sheriff badge |
| `skater.png` | Purple cap + pixel shades + trowel |
| `scientist.png` | Goggles + blue mohawk + flask |
| `vampire.png` | Top hat + cape |
| `gamer.png` | Headphones + visor + controller |
| `punk.png` | Blue mohawk + cat-eye shades + studded belt |

## The two special ones

| File | Where it appears | Requirement |
| --- | --- | --- |
| `cucumber.png` | Inside the wordmark's **D**, the entry screen, the success popup | **Must be a transparent PNG** — it sits inside a letterform. Falls back to `/public/cucumber-base.png`. |
| `hero.png` | Home tab hero (floats over the page) | Transparent PNG works best. Falls back to `punk.png`. |

Tips:

- Gallery images are cropped square (`object-fit: cover`), so square source
  files look best. The lime background baked into your art matches the site's
  `#CCFF00`, and the card frames use the same lime so they blend seamlessly.
- Keep each file under ~300KB — images are the easiest way to lose the fast
  load the site has today.

To rename files, add more, or change the captions, edit
[`lib/art.ts`](../../lib/art.ts) — the single source of truth.
