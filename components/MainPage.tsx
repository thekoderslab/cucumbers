import styles from "./MainPage.module.css";
import CucumberImage from "./CucumberImage";
import { Sunglasses, Cap } from "./CucumberDecor";
import AllowlistForm from "./AllowlistForm";

// Placeholder social URLs — swap for the real handles/invite before launch.
const SOCIALS = {
  x: "https://x.com/cucumberhood",
  discord: "https://discord.gg/cucumberhood",
};

const TRAITS = [
  { emoji: "🕶️", label: "Eyewear" },
  { emoji: "🧢", label: "Headwear" },
  { emoji: "🌈", label: "Background" },
  { emoji: "🥇", label: "Props" },
  { emoji: "🩳", label: "Bandanas" },
  { emoji: "⛓️", label: "Chains" },
];

export default function MainPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>Cucumber Hood</div>
        <nav className={styles.nav}>
          <a href={SOCIALS.x} target="_blank" rel="noopener noreferrer">
            X
          </a>
          <a href={SOCIALS.discord} target="_blank" rel="noopener noreferrer">
            Discord
          </a>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroImage}>
            <CucumberImage
              className={styles.heroCucumber}
              alt="Cucumber Hood mascot wearing sunglasses and a cap"
            />
            <Sunglasses className={styles.heroGlasses} />
            <Cap className={styles.heroCap} />
          </div>
          <h1 className={styles.heroTitle}>
            1,111 unique cucumbers coming to Robinhood Chain
          </h1>
          <p className={styles.heroSubtext}>
            Cool cucumbers. Chill cucumbers. Just cucumbers.
          </p>
          <a href="#join" className={styles.heroCta}>
            Join the Hood
          </a>
        </section>

        <section id="join" className={styles.join}>
          <h2 className={styles.sectionTitle}>Join the Hood</h2>
          <p className={styles.sectionSubtext}>
            Get early access before public mint. No pressure, just vibes.
          </p>
          <AllowlistForm />
        </section>

        <section className={styles.traits}>
          <h2 className={styles.sectionTitle}>What&apos;s in the Hood</h2>
          <div className={styles.traitGrid}>
            {TRAITS.map((t) => (
              <div key={t.label} className={styles.traitCard}>
                <span className={styles.traitEmoji} aria-hidden="true">
                  {t.emoji}
                </span>
                <span className={styles.traitLabel}>{t.label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Cucumber Hood — native to Robinhood Chain</p>
        <div className={styles.footerSocials}>
          <a href={SOCIALS.x} target="_blank" rel="noopener noreferrer">
            X
          </a>
          <a href={SOCIALS.discord} target="_blank" rel="noopener noreferrer">
            Discord
          </a>
        </div>
      </footer>
    </div>
  );
}
