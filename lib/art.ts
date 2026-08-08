/**
 * Every image the site uses, in one place.
 *
 * Each entry is a *fallback chain*: the first file that loads wins. That way
 * art can be swapped or added without touching components, and a missing
 * file renders a labelled placeholder instead of a broken image.
 */

/**
 * Plain cucumber — used in the wordmark's D and on the entry screen.
 * This one must be a TRANSPARENT png: it sits inside a letterform.
 *
 * Only list files that exist. A missing file at the front of a chain costs
 * a 404 on every page load, and because the markup is server-rendered it
 * can fail before React hydrates — see the note in SmartImage.
 */
export const CUCUMBER: string[] = [
  "/cucumber-base.png",
  "/cucumber-placeholder.svg",
];

/** The Home hero and the Join page garnish — the plain cucumber. */
export const HERO: string[] = [
  "/cucumber-base.png",
  "/cucumber-placeholder.svg",
];

export interface ArtItem {
  sources: string[];
  /** Character name, shown as the caption. */
  label: string;
  /** Token number, shown as a chip on the card. */
  id: string;
}

/**
 * Sneak-peek gallery on The Hood tab.
 * Files live in `public/art/`; the numbers are the real token numbers.
 */
export const GALLERY: ArtItem[] = [
  { sources: ["/art/cucumber-0001.png"], label: "Robin Hood", id: "0001" },
  { sources: ["/art/cucumber-0741.png"], label: "TMA", id: "0741" },
  { sources: ["/art/cucumber-0025.png"], label: "Punk", id: "0025" },
  { sources: ["/art/cucumber-0177.png"], label: "The King", id: "0177" },
  { sources: ["/art/cucumber-0002.png"], label: "Sheriff", id: "0002" },
  { sources: ["/art/cucumber-0176.png"], label: "Wizard", id: "0176" },
  { sources: ["/art/cucumber-0020.png"], label: "Full Send", id: "0020" },
  { sources: ["/art/cucumber-0184.png"], label: "Shutterbug", id: "0184" },
  { sources: ["/art/cucumber-0175.png"], label: "The General", id: "0175" },
  { sources: ["/art/cucumber-0310.png"], label: "Chef", id: "0310" },
  { sources: ["/art/cucumber-0246.png"], label: "Farmhand", id: "0246" },
  { sources: ["/art/cucumber-0218.png"], label: "Inspector", id: "0218" },
];
