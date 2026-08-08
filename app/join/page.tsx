import type { Metadata } from "next";
import Link from "next/link";
import styles from "./join.module.css";
import JoinFlow from "@/components/JoinFlow";
import Wordmark from "@/components/Wordmark";
import SmartImage from "@/components/SmartImage";
import { HERO } from "@/lib/art";
import { X_PROFILE, DISCORD } from "@/lib/config";

export const metadata: Metadata = {
  title: "Join the Hood — Cucumber Hood",
  description:
    "Complete the tasks to lock your Cucumber Hood allowlist spot. 1,111 unique cucumbers on Robinhood Chain.",
};

export default function JoinPage() {
  return (
    <div className={styles.page}>
      <div className={styles.dots} aria-hidden="true" />

      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <Wordmark className={styles.brandMark} stacked={false} />
        </Link>
        <div className={styles.headerLinks}>
          <a
            className={styles.navLink}
            href={X_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>
          <a
            className={styles.navLink}
            href={DISCORD}
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>
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
            <SmartImage sources={HERO} alt="" className={styles.art} eager />
            <span className={styles.sticker}>see you at mint</span>
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
  );
}
