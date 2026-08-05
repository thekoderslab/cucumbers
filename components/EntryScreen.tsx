"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./EntryScreen.module.css";
import CucumberImage from "./CucumberImage";
import { Sunglasses } from "./CucumberDecor";

type Stage = "idle" | "spinning" | "glasses" | "pause" | "exiting";

// Timeline (ms from click): spin 0-600, glasses drop 600-1000,
// settle pause 1000-1300, fade/slide out 1300-1800. Total under 2s.
const SPIN_MS = 600;
const DROP_MS = 400;
const PAUSE_MS = 300;
const EXIT_MS = 500;

function playPop() {
  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    osc.onended = () => ctx.close();
  } catch {
    // Autoplay blocked or Web Audio unsupported — fail silently, per spec.
  }
}

export default function EntryScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  function handleClick() {
    if (stage !== "idle") return;
    playPop();
    setStage("spinning");
    timers.current.push(setTimeout(() => setStage("glasses"), SPIN_MS));
    timers.current.push(
      setTimeout(() => setStage("pause"), SPIN_MS + DROP_MS)
    );
    timers.current.push(
      setTimeout(() => setStage("exiting"), SPIN_MS + DROP_MS + PAUSE_MS)
    );
    timers.current.push(
      setTimeout(onComplete, SPIN_MS + DROP_MS + PAUSE_MS + EXIT_MS)
    );
  }

  const dropped = stage === "glasses" || stage === "pause" || stage === "exiting";

  return (
    <div
      className={`${styles.overlay} ${stage === "exiting" ? styles.exiting : ""}`}
    >
      <h1 className={styles.title}>Cucumber Hood</h1>
      <div
        className={`${styles.stage} ${stage === "spinning" ? styles.spinning : ""} ${dropped ? styles.dropped : ""}`}
      >
        <button
          type="button"
          className={styles.cucumberBtn}
          onClick={handleClick}
          disabled={stage !== "idle"}
          aria-label="Click the cucumber to enter Cucumber Hood"
        >
          <CucumberImage
            className={styles.cucumberImg}
            alt="Cucumber Hood mascot"
          />
        </button>
        <Sunglasses className={styles.glasses} />
      </div>
      <p className={`${styles.hint} ${stage !== "idle" ? styles.hintStill : ""}`}>
        click the cucumber
      </p>
    </div>
  );
}
