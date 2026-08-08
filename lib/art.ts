/**
 * Every image the site uses, in one place.
 *
 * Each entry is a *fallback chain*: the first file that loads wins. That way
 * you can drop real art in whenever it's ready without touching components,
 * and nothing breaks in the meantime.
 *
 * Drop your art into `public/art/` using these filenames.
 */

/** Plain cucumber — used in the wordmark's D and on the entry screen. */
export const CUCUMBER: string[] = [
  "/art/cucumber.png",
  "/cucumber-base.png",
  "/cucumber-placeholder.svg",
];

/** The "finished look" hero character (shades, cap, whatever else). */
export const HERO: string[] = [
  "/art/hero.png",
  "/art/cucumber.png",
  "/cucumber-base.png",
  "/cucumber-placeholder.svg",
];

export interface ArtItem {
  sources: string[];
  label: string;
  sub: string;
}

/** Trait families — real art thumbnails, not icons. */
export const TRAITS: ArtItem[] = [
  {
    sources: ["/art/trait-eyewear.png"],
    label: "Eyewear",
    sub: "Shades on, always",
  },
  {
    sources: ["/art/trait-headwear.png"],
    label: "Headwear",
    sub: "Caps, buckets, crowns",
  },
  {
    sources: ["/art/trait-chains.png"],
    label: "Chains",
    sub: "Ice, but chill",
  },
  {
    sources: ["/art/trait-backgrounds.png"],
    label: "Backgrounds",
    sub: "All lime, all vibes",
  },
  {
    sources: ["/art/trait-props.png"],
    label: "Props",
    sub: "Boards, cups, snacks",
  },
  {
    sources: ["/art/trait-faces.png"],
    label: "Faces",
    sub: "Smirks to deadpan",
  },
];

/** Collection teasers shown on the Hood tab. */
export const GALLERY: ArtItem[] = [
  { sources: ["/art/1.png"], label: "#001", sub: "" },
  { sources: ["/art/2.png"], label: "#014", sub: "" },
  { sources: ["/art/3.png"], label: "#077", sub: "" },
  { sources: ["/art/4.png"], label: "#420", sub: "" },
];
