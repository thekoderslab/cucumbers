"use client";

import { useEffect, useState } from "react";
import styles from "./ReferrerCard.module.css";
import { useReferralCode } from "@/lib/use-referral-code";
import { POINTS_PER_REFERRAL } from "@/lib/referral";

interface Referrer {
  handle?: string;
  wallet: string;
  points: number;
  rank: number | null;
}

/**
 * Shown to visitors who arrived through someone's referral link: who invited
 * them and how that person is doing. Renders nothing when there's no code or
 * the code isn't recognised — an unexplained empty panel is worse than none.
 */
export default function ReferrerCard() {
  const code = useReferralCode();
  const [referrer, setReferrer] = useState<Referrer | null>(null);

  useEffect(() => {
    if (!code) return;
    let live = true;

    (async () => {
      try {
        const res = await fetch(`/api/referrer?code=${code}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (live && data.found) setReferrer(data);
      } catch {
        // Nothing to show — the card just stays hidden.
      }
    })();

    return () => {
      live = false;
    };
  }, [code]);

  if (!referrer) return null;

  const who = referrer.handle ? `@${referrer.handle}` : referrer.wallet;

  return (
    <div className={styles.card}>
      <span className={styles.kicker}>You were invited</span>
      <p className={styles.line}>
        {referrer.handle ? (
          <a
            href={`https://x.com/${referrer.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.who}
          >
            {who}
          </a>
        ) : (
          <span className={styles.who}>{who}</span>
        )}{" "}
        sent you here.
      </p>
      <p className={styles.stats}>
        They have <strong>{referrer.points}</strong>{" "}
        {referrer.points === 1 ? "point" : "points"}
        {referrer.rank ? ` — rank #${referrer.rank}` : ""}. Finish the steps and
        they earn {POINTS_PER_REFERRAL} more.
      </p>
    </div>
  );
}
