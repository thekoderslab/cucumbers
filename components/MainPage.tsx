import styles from "./MainPage.module.css";
import CucumberImage from "./CucumberImage";
import { Sunglasses, Cap } from "./CucumberDecor";
import AllowlistForm from "./AllowlistForm";
import Wordmark from "./Wordmark";
import Marquee from "./Marquee";

// Placeholder social URLs — swap for the real handles/invite before launch.
const SOCIALS = {
  x: "https://x.com/cucumberhood",
  discord: "https://discord.gg/cucumberhood",
};

const MARQUEE = [
  "Cool as a cucumber",
  "1,111 unique",
  "Native to Robinhood Chain",
  "Join the Hood",
];

const STATS = [
  { value: "1,111", label: "Supply" },
  { value: "RHC", label: "Chain" },
  { value: "TBA", label: "Mint" },
];

const TRAITS = [
  { emoji: "🕶️", label: "Eyewear", sub: "Shades on, always" },
  { emoji: "🧢", label: "Headwear", sub: "Caps, buckets, crowns" },
  { emoji: "⛓️", label: "Chains", sub: "Ice, but chill" },
  { emoji: "🌈", label: "Backgrounds", sub: "All lime, all vibes" },
  { emoji: "🛹", label: "Props", sub: "Boards, cups, snacks" },
  { emoji: "😎", label: "Faces", sub: "Smirks to deadpan" },
];

const VIBES = [
  {
    emoji: "🥒",
    title: "1,111 of them",
    text: "Hand-tuned traits, no filler, no 10k slop.",
  },
  {
    emoji: "⚡",
    title: "Robinhood Chain",
    text: "Native from day one. Fast, cheap, easy.",
  },
  {
    emoji: "🧘",
    title: "Just vibes",
    text: "No roadmap. No promises. Only cucumbers.",
  },
];

export default function MainPage() {
  return (
    <div className={styles.page}>
      <div className={styles.dots} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Wordmark className={styles.brandMark} stacked={false} />
          <nav className={styles.nav}>
            <a
              className={styles.navLink}
              href={SOCIALS.x}
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>
            <a
              className={styles.navLink}
              href={SOCIALS.discord}
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
            <a className={styles.navCta} href="#join">
              Join
            </a>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.badge}>Native to Robinhood Chain</span>
            <h1 className={styles.heroTitle}>
              <span className={styles.num}>1,111</span>
              <span>unique cucumbers</span>
              <span className={styles.thin}>coming to Robinhood Chain</span>
            </h1>
            <p className={styles.heroSub}>
              Cool cucumbers. Chill cucumbers. Just cucumbers.
            </p>
            <div className={styles.ctaRow}>
              <a href="#join" className={styles.cta}>
                Join the Hood
              </a>
              <a
                href={SOCIALS.x}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaGhost}
              >
                Follow on X
              </a>
            </div>
            <ul className={styles.stats}>
              {STATS.map((s) => (
                <li key={s.label} className={styles.stat}>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.heroArt}>
            <div className={styles.burst} aria-hidden="true" />
            <div className={styles.artWrap}>
              <CucumberImage
                className={styles.heroCucumber}
                alt="Cucumber Hood mascot wearing sunglasses and a cap"
              />
              <Cap className={styles.heroCap} />
              <Sunglasses className={styles.heroGlasses} />
            </div>
            <span className={`${styles.sticker} ${styles.stickerOne}`}>
              100% vibes
            </span>
            <span className={`${styles.sticker} ${styles.stickerTwo}`}>
              stay chill
            </span>
          </div>
        </section>

        <Marquee items={MARQUEE} />

        <section className={styles.vibes}>
          <div className={styles.vibeGrid}>
            {VIBES.map((v) => (
              <div key={v.title} className={styles.vibeCard}>
                <span className={styles.vibeEmoji} aria-hidden="true">
                  {v.emoji}
                </span>
                <h3 className={styles.vibeTitle}>{v.title}</h3>
                <p className={styles.vibeText}>{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="join" className={styles.join}>
          <div className={styles.joinCard}>
            <span className={styles.kicker}>Allowlist open</span>
            <h2 className={styles.sectionTitle}>Join the Hood</h2>
            <p className={styles.sectionSub}>
              Get early access before public mint. No pressure, just vibes.
            </p>
            <AllowlistForm />
          </div>
        </section>

        <section className={styles.traits}>
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>Sneak peek</span>
            <h2 className={styles.sectionTitle}>What&apos;s in the Hood</h2>
            <p className={styles.sectionSub}>
              Six trait families, a whole lot of combinations. The rest stays
              in the crisper drawer.
            </p>
          </div>
          <div className={styles.traitGrid}>
            {TRAITS.map((t) => (
              <div key={t.label} className={styles.traitCard}>
                <span className={styles.traitEmoji} aria-hidden="true">
                  {t.emoji}
                </span>
                <span className={styles.traitLabel}>{t.label}</span>
                <span className={styles.traitSub}>{t.sub}</span>
              </div>
            ))}
          </div>
        </section>

        <Marquee items={MARQUEE} reverse />
      </main>

      <footer className={styles.footer}>
        <Wordmark className={styles.footerMark} stacked={false} />
        <p className={styles.footerNote}>
          Cucumber Hood — native to Robinhood Chain
        </p>
        <div className={styles.footerSocials}>
          <a
            className={styles.socialPill}
            href={SOCIALS.x}
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>
          <a
            className={styles.socialPill}
            href={SOCIALS.discord}
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>
        </div>
      </footer>
    </div>
  );
}
