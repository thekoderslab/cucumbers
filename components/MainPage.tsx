"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./MainPage.module.css";
import SmartImage from "./SmartImage";
import Wordmark from "./Wordmark";
import Marquee from "./Marquee";
import { HERO, GALLERY } from "@/lib/art";
import { X_PROFILE, OPENSEA, externalLinkProps } from "@/lib/config";

const MARQUEE = [
  "Cool as a cucumber",
  "1,111 unique",
  "Native to Robinhood Chain",
  "Join the Hood",
];

const TABS = [
  { id: "home", label: "Home" },
  { id: "hood", label: "The Hood" },
  { id: "roadmap", label: "Roadmap" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ROADMAP = [
  {
    phase: "01",
    title: "Allowlist",
    text: "Tasks go up, spots go out. The hood starts forming.",
  },
  {
    phase: "02",
    title: "Mint",
    text: "1,111 cucumbers, native mint on Robinhood Chain.",
  },
  {
    phase: "03",
    title: "Reveal",
    text: "Traits drop. Everybody finds out who they really are.",
  },
  {
    phase: "04",
    title: "The Hood",
    text: "Community, collabs, and whatever the hood decides next.",
  },
];

export default function MainPage() {
  const [tab, setTab] = useState<TabId>("home");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Tabs are reflected in the URL hash, so /#hood and /#roadmap are
  // linkable from anywhere (the join page header uses exactly that).
  useEffect(() => {
    const fromHash = window.location.hash.replace("#", "");
    if (TABS.some((t) => t.id === fromHash)) {
      setTab(fromHash as TabId);
    }
  }, []);

  function selectTab(id: TabId) {
    setTab(id);
    window.history.replaceState(null, "", id === "home" ? "/" : `/#${id}`);
  }

  function onTabKeyDown(e: React.KeyboardEvent, i: number) {
    const last = TABS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = i === last ? 0 : i + 1;
    else if (e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    selectTab(TABS[next].id);
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
            onClick={() => selectTab("home")}
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
                onClick={() => selectTab(t.id)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
              >
                {t.label}
              </button>
            ))}
            <Link href="/join" className={styles.tabJoin}>
              Join
            </Link>
          </div>

          <div className={styles.headerSocials}>
            <a
              className={styles.navLink}
              href={X_PROFILE}
              {...externalLinkProps(X_PROFILE)}
            >
              X
            </a>
            <a
              className={styles.navLink}
              href={OPENSEA}
              {...externalLinkProps(OPENSEA)}
            >
              OpenSea
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
                  <Link href="/join" className={styles.cta}>
                    Join the Hood
                  </Link>
                  <button
                    type="button"
                    className={styles.ctaGhost}
                    onClick={() => selectTab("hood")}
                  >
                    Sneak peek
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

        {/* ---------------- THE HOOD (sneak peek) ---------------- */}
        {tab === "hood" && (
          <section
            role="tabpanel"
            id="panel-hood"
            aria-labelledby="tab-hood"
            className={styles.panel}
          >
            <div className={styles.hoodHead}>
              <span className={styles.kicker}>Sneak peek</span>
              <h2 className={styles.bigTitle}>What&apos;s in the Hood</h2>
              <p className={styles.leadText}>
                A few of them, out in the wild. The rest stays in the crisper
                drawer until reveal.
              </p>
            </div>

            <div className={styles.gallery}>
              {GALLERY.map((item) => (
                <figure key={item.label} className={styles.shot}>
                  <div className={styles.shotFrame}>
                    <SmartImage
                      sources={item.sources}
                      alt={`Cucumber Hood — ${item.label}`}
                      className={styles.shotImg}
                      placeholderClassName={styles.shotPlaceholder}
                      placeholderLabel={item.label}
                    />
                  </div>
                  <figcaption className={styles.shotCap}>
                    {item.label}
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className={styles.hoodCta}>
              <Link href="/join" className={styles.cta}>
                Join the Hood
              </Link>
            </div>

            <Marquee items={MARQUEE} reverse />
          </section>
        )}

        {/* ---------------- ROADMAP ---------------- */}
        {tab === "roadmap" && (
          <section
            role="tabpanel"
            id="panel-roadmap"
            aria-labelledby="tab-roadmap"
            className={styles.panel}
          >
            <div className={styles.roadHead}>
              <span className={styles.kicker}>Roadmap</span>
              <h2 className={styles.bigTitle}>Where this is going</h2>
              <p className={styles.leadText}>
                Four steps. Nothing complicated.
              </p>
            </div>

            <ol className={styles.roadList}>
              {ROADMAP.map((r) => (
                <li key={r.phase} className={styles.roadItem}>
                  <span className={styles.roadPhase}>{r.phase}</span>
                  <div className={styles.roadCard}>
                    <h3 className={styles.roadTitle}>{r.title}</h3>
                    <p className={styles.roadText}>{r.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className={styles.hoodCta}>
              <Link href="/join" className={styles.cta}>
                Join the Hood
              </Link>
            </div>

            <Marquee items={MARQUEE} />
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
            href={X_PROFILE}
            {...externalLinkProps(X_PROFILE)}
          >
            X
          </a>
          <a
            className={styles.socialPill}
            href={OPENSEA}
            {...externalLinkProps(OPENSEA)}
          >
            OpenSea
          </a>
        </div>
      </footer>
    </div>
  );
}
