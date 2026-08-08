"use client";

import { useRef, useState } from "react";
import styles from "./MainPage.module.css";
import SmartImage from "./SmartImage";
import AllowlistForm from "./AllowlistForm";
import Wordmark from "./Wordmark";
import Marquee from "./Marquee";
import { HERO, CUCUMBER, TRAITS, GALLERY } from "@/lib/art";

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

const TABS = [
  { id: "home", label: "Home" },
  { id: "hood", label: "The Hood" },
  { id: "traits", label: "Traits" },
  { id: "join", label: "Join" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function MainPage() {
  const [tab, setTab] = useState<TabId>("home");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onTabKeyDown(e: React.KeyboardEvent, i: number) {
    const last = TABS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = i === last ? 0 : i + 1;
    else if (e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className={styles.page}>
      <div className={styles.dots} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button
            type="button"
            className={styles.brandBtn}
            onClick={() => setTab("home")}
            aria-label="Cucumber Hood — go to home"
          >
            <Wordmark className={styles.brandMark} stacked={false} />
          </button>

          <div className={styles.tablist} role="tablist" aria-label="Sections">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-controls={`panel-${t.id}`}
                aria-selected={tab === t.id}
                tabIndex={tab === t.id ? 0 : -1}
                className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.headerSocials}>
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
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* ---------------- HOME ---------------- */}
        {tab === "home" && (
          <section
            role="tabpanel"
            id="panel-home"
            aria-labelledby="tab-home"
            className={styles.panel}
          >
            <div className={styles.homeGrid}>
              <div className={styles.homeCopy}>
                <span className={styles.badge}>Native to Robinhood Chain</span>
                <h1 className={styles.homeTitle}>
                  <span className={styles.num}>1,111</span>
                  <span className={styles.titleLine}>unique</span>
                  <span className={styles.titleLineOffset}>cucumbers</span>
                </h1>
                <p className={styles.homeSub}>
                  Cool cucumbers. Chill cucumbers. Just cucumbers.
                </p>
                <div className={styles.ctaRow}>
                  <button
                    type="button"
                    className={styles.cta}
                    onClick={() => setTab("join")}
                  >
                    Join the Hood
                  </button>
                  <button
                    type="button"
                    className={styles.ctaGhost}
                    onClick={() => setTab("traits")}
                  >
                    See the traits
                  </button>
                </div>
              </div>

              <div className={styles.homeArt}>
                <div className={styles.burst} aria-hidden="true" />
                <SmartImage
                  sources={HERO}
                  alt="Cucumber Hood mascot"
                  className={styles.heroImg}
                  eager
                />
                <span className={`${styles.sticker} ${styles.stickerOne}`}>
                  100% vibes
                </span>
                <span className={`${styles.sticker} ${styles.stickerTwo}`}>
                  stay chill
                </span>
              </div>

              <div className={styles.homeStats}>
                <div className={styles.stat}>
                  <strong>1,111</strong>
                  <span>Supply</span>
                </div>
                <div className={styles.statWide}>
                  <strong>Robinhood Chain</strong>
                  <span>Native from day one</span>
                </div>
                <div className={styles.stat}>
                  <strong>TBA</strong>
                  <span>Mint</span>
                </div>
              </div>
            </div>

            <Marquee items={MARQUEE} />
          </section>
        )}

        {/* ---------------- THE HOOD ---------------- */}
        {tab === "hood" && (
          <section
            role="tabpanel"
            id="panel-hood"
            aria-labelledby="tab-hood"
            className={styles.panel}
          >
            <div className={styles.hoodGrid}>
              <div className={styles.hoodIntro}>
                <span className={styles.kicker}>The Hood</span>
                <h2 className={styles.bigTitle}>
                  No roadmap.
                  <br />
                  No promises.
                  <br />
                  <span className={styles.num}>Only cucumbers.</span>
                </h2>
              </div>

              <div className={styles.hoodShotA}>
                <SmartImage
                  sources={GALLERY[0].sources}
                  alt={`Cucumber Hood ${GALLERY[0].label}`}
                  className={styles.shotImg}
                  placeholderClassName={styles.shotPlaceholder}
                  placeholderLabel={GALLERY[0].label}
                />
              </div>

              <div className={styles.hoodNote}>
                <p>
                  1,111 hand-tuned cucumbers. No filler, no 10k slop. Every one
                  of them is doing absolutely nothing, extremely well.
                </p>
              </div>

              <div className={styles.hoodShotB}>
                <SmartImage
                  sources={GALLERY[1].sources}
                  alt={`Cucumber Hood ${GALLERY[1].label}`}
                  className={styles.shotImg}
                  placeholderClassName={styles.shotPlaceholder}
                  placeholderLabel={GALLERY[1].label}
                />
              </div>

              <div className={styles.hoodPanelDark}>
                <h3>Built for the chain</h3>
                <p>
                  Native to Robinhood Chain from day one. Fast, cheap, and
                  nobody has to explain what gas is again.
                </p>
              </div>

              <div className={styles.hoodShotC}>
                <SmartImage
                  sources={GALLERY[2].sources}
                  alt={`Cucumber Hood ${GALLERY[2].label}`}
                  className={styles.shotImg}
                  placeholderClassName={styles.shotPlaceholder}
                  placeholderLabel={GALLERY[2].label}
                />
              </div>

              <div className={styles.hoodShotD}>
                <SmartImage
                  sources={GALLERY[3].sources}
                  alt={`Cucumber Hood ${GALLERY[3].label}`}
                  className={styles.shotImg}
                  placeholderClassName={styles.shotPlaceholder}
                  placeholderLabel={GALLERY[3].label}
                />
              </div>
            </div>

            <Marquee items={MARQUEE} reverse />
          </section>
        )}

        {/* ---------------- TRAITS ---------------- */}
        {tab === "traits" && (
          <section
            role="tabpanel"
            id="panel-traits"
            aria-labelledby="tab-traits"
            className={styles.panel}
          >
            <div className={styles.traitsHead}>
              <span className={styles.kicker}>Sneak peek</span>
              <h2 className={styles.bigTitle}>What&apos;s in the Hood</h2>
              <p className={styles.leadText}>
                Six trait families, a whole lot of combinations. The rest stays
                in the crisper drawer.
              </p>
            </div>

            <div className={styles.traitGrid}>
              {TRAITS.map((t, i) => (
                <figure
                  key={t.label}
                  className={`${styles.traitCard} ${i === 0 ? styles.traitCardBig : ""}`}
                >
                  <div className={styles.traitImgWrap}>
                    <SmartImage
                      sources={t.sources}
                      alt={`${t.label} trait preview`}
                      className={styles.traitImg}
                      placeholderClassName={styles.traitPlaceholder}
                      placeholderLabel={t.label}
                    />
                  </div>
                  <figcaption className={styles.traitCap}>
                    <span className={styles.traitLabel}>{t.label}</span>
                    <span className={styles.traitSub}>{t.sub}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- JOIN ---------------- */}
        {tab === "join" && (
          <section
            role="tabpanel"
            id="panel-join"
            aria-labelledby="tab-join"
            className={styles.panel}
          >
            <div className={styles.joinGrid}>
              <div className={styles.joinCard}>
                <span className={styles.kicker}>Allowlist open</span>
                <h2 className={styles.joinTitle}>Join the Hood</h2>
                <p className={styles.joinSub}>
                  Get early access before public mint. No pressure, just vibes.
                </p>
                <AllowlistForm />
              </div>

              <aside className={styles.joinAside}>
                <SmartImage
                  sources={CUCUMBER}
                  alt=""
                  className={styles.joinArt}
                />
                <span className={`${styles.sticker} ${styles.stickerThree}`}>
                  see you at mint
                </span>
              </aside>
            </div>
          </section>
        )}
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
