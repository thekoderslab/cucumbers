# Art assets

Drop your real artwork here using these exact filenames. Every one is
optional — the site falls back gracefully to a placeholder until the file
exists, so you can add them one at a time.

| File | Where it appears |
| --- | --- |
| `cucumber.png` | The wordmark's D, the entry screen, the Join tab |
| `hero.png` | Home tab hero (the "finished look" — shades, cap, etc.) |
| `trait-eyewear.png` | Traits tab (this one is the large feature card) |
| `trait-headwear.png` | Traits tab |
| `trait-chains.png` | Traits tab |
| `trait-backgrounds.png` | Traits tab |
| `trait-props.png` | Traits tab |
| `trait-faces.png` | Traits tab |
| `1.png` `2.png` `3.png` `4.png` | The Hood tab collage |

Tips:

- **`cucumber.png` and `hero.png` must be transparent PNGs** — they sit
  directly on the lime background and inside the wordmark's letterform.
- Trait and collage images are cropped square (`object-fit: cover`), so
  square source files look best.
- Keep them reasonably small (under ~300KB each) — the site loads fast
  today and images are the easiest way to lose that.

To rename files, add more, or change the labels, edit
[`lib/art.ts`](../../lib/art.ts) — it's the single source of truth.
