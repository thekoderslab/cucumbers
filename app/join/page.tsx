import type { Metadata } from "next";
import Link from "next/link";
import styles from "./join.module.css";
import EntryGate from "@/components/EntryGate";
import JoinFlow from "@/components/JoinFlow";
import Wordmark from "@/components/Wordmark";
import ReferrerCard from "@/components/ReferrerCard";
import Leaderboard from "@/components/Leaderboard";
import { X_PROFILE, OPENSEA, externalLinkProps } from "@/lib/config";
import { POINTS_PER_REFERRAL, GTD_SPOTS } from "@/lib/referral";

export const metadata: Metadata = {
  title: "Join the Hood — Cucumber Hood",
  description:
    "Complete the tasks to lock your Cucumber Hood allowlist spot. 1,111 unique cucumbers on Robinhood Chain.",
};

export default function JoinPage() {
  return (
    <EntryGate>
      <div className={styles.page}>
        <div className={styles.dots} aria-hidden="true" />

        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.brand}>
              <Wordmark className={styles.brandMark} stacked={false} />
            </Link>

            <nav className={styles.nav} aria-label="Sections">
              <Link href="/" className={styles.navTab}>
                Home
              </Link>
              <Link href="/#hood" className={styles.navTab}>
                The Hood
              </Link>
              <Link href="/#roadmap" className={styles.navTab}>
                Roadmap
              </Link>
              <span className={styles.navTabActive} aria-current="page">
                Join
              </span>
            </nav>

            <div className={styles.headerLinks}>
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
          <div className={styles.grid}>
            <div className={styles.card}>
              <span className={styles.kicker}>Allowlist open</span>
              <h1 className={styles.title}>Join the Hood</h1>
              <p className={styles.sub}>
                Four quick steps to lock your spot. No pressure, just vibes.
              </p>
              <JoinFlow />
            </div>

            <aside className={styles.aside}>
              <ReferrerCard />

              <div className={styles.boardCard}>
                <div className={styles.boardHead}>
                  <span className={styles.boardKicker}>Top Cucumbers</span>
                  <h2 className={styles.boardTitle}>Leaderboard</h2>
                  <p className={styles.boardNote}>
                    {POINTS_PER_REFERRAL} points per referral. Top {GTD_SPOTS}{" "}
                    get a guaranteed spot.
                  </p>
                </div>
                <Leaderboard gtdSpots={GTD_SPOTS} />
              </div>
            </aside>
          </div>
        </main>

        <footer className={styles.footer}>
          <Link href="/" className={styles.backLink}>
            ← Back to Cucumber Hood
          </Link>
          <p className={styles.footerNote}>
            Cucumber Hood — native to Robinhood Chain
          </p>
        </footer>
      </div>
    </EntryGate>
  );
}
