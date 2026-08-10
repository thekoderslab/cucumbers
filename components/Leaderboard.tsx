"use client";

import { useEffect, useState } from "react";
import styles from "./Leaderboard.module.css";

interface Row {
  rank: number;
  wallet: string;
  handle?: string;
  points: number;
}

export default function Leaderboard({ gtdSpots = 10 }: { gtdSpots?: number }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;

    async function load() {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        if (!res.ok) throw new Error("bad response");
        const data = await res.json();
        if (live) {
          setRows(data.rows ?? []);
          setFailed(false);
        }
      } catch {
        if (live) setFailed(true);
      }
    }

    load();
    // Near-live: refresh while the tab is open so positions move as people
    // refer, without hammering the API.
    const timer = setInterval(load, 30000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);

  if (failed && !rows) {
    return (
      <p className={styles.empty}>
        Couldn&apos;t load the leaderboard. Try again in a moment.
      </p>
    );
  }

  if (!rows) {
    return <p className={styles.empty}>Counting cucumbers…</p>;
  }

  if (rows.length === 0) {
    return (
      <p className={styles.empty}>
        Nobody&apos;s on the board yet. Join the Hood, share your referral link,
        and this spot is yours.
      </p>
    );
  }

  return (
    <ol className={styles.board}>
      {rows.map((row) => (
        <li
          key={row.rank}
          className={`${styles.row} ${row.rank <= gtdSpots ? styles.gtd : ""}`}
        >
          <span className={styles.rank}>{row.rank}</span>
          <span className={styles.who}>
            {row.handle ? (
              <a
                href={`https://x.com/${row.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.handle}
              >
                @{row.handle}
              </a>
            ) : (
              <span className={styles.handle}>anon</span>
            )}
            <span className={styles.wallet}>{row.wallet}</span>
          </span>
          {row.rank <= gtdSpots && <span className={styles.badge}>GTD spot</span>}
          <span className={styles.points}>{row.points}</span>
        </li>
      ))}
    </ol>
  );
}
