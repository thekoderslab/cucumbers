/**
 * Every image the site uses, in one place.
 *
 * Each entry is a *fallback chain*: the first file that loads wins. That way
 * you can drop real art in whenever it's ready without touching components,
 * and nothing breaks in the meantime.
 *
 * Drop your art into `public/art/` using these filenames.
 */

/**
 * Plain cucumber — used in the wordmark's D and on the entry screen.
 * This one must be a TRANSPARENT png: it sits inside a letterform.
 */
export const CUCUMBER: string[] = [
  "/art/cucumber.png",
  "/cucumber-base.png",
  "/cucumber-placeholder.svg",
];

/** The Home hero and the Join page garnish — the plain cucumber. */
export const HERO: string[] = [
  "/art/hero.png",
  "/art/cucumber.png",
  "/cucumber-base.png",
  "/cucumber-placeholder.svg",
];

export interface ArtItem {
  sources: string[];
  label: string;
}

/** Sneak-peek gallery on The Hood tab. */
export const GALLERY: ArtItem[] = [
  { sources: ["/art/fisher.png"], label: "Gone fishin'" },
  { sources: ["/art/paperbag.png"], label: "Anon" },
  { sources: ["/art/robin.png"], label: "Robin Hood" },
  { sources: ["/art/sheriff.png"], label: "Sheriff" },
  { sources: ["/art/skater.png"], label: "Fresh cap" },
  { sources: ["/art/scientist.png"], label: "Lab work" },
  { sources: ["/art/vampire.png"], label: "Night shift" },
  { sources: ["/art/gamer.png"], label: "Full send" },
  { sources: ["/art/punk.png"], label: "Punk" },
];
