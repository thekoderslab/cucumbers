"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./EntryScreen.module.css";
import SmartImage from "./SmartImage";
import Wordmark from "./Wordmark";
import { CUCUMBER } from "@/lib/art";

type Stage = "idle" | "flying" | "landed" | "exiting";

// Timeline (ms from click): fly into the D 0-750, impact/settle 750-1050,
// overlay exit 1050-1550. Total well under 2s.
const FLY_MS = 750;
const SETTLE_MS = 300;
const EXIT_MS = 500;

/** Short synthesized "thunk" — no audio asset, and silent if blocked. */
function playThunk() {
  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(58, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.26);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
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
  const [ring, setRing] = useState<{ x: number; y: number } | null>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const cukeRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  function handleClick() {
    if (stage !== "idle") return;

    const slotEl = slotRef.current;
    const cukeEl = cukeRef.current;
    const slot = slotEl?.getBoundingClientRect();
    const cuke = cukeEl?.getBoundingClientRect();

    // If anything is unmeasurable (image not laid out yet, odd viewport),
    // skip straight to the reveal rather than animating to a wrong spot.
    if (!cukeEl || !slot || !cuke || !cuke.width || !cuke.height) {
      onComplete();
      return;
    }

    const dx = slot.left + slot.width / 2 - (cuke.left + cuke.width / 2);
    const dy = slot.top + slot.height / 2 - (cuke.top + cuke.height / 2);

    cukeEl.style.setProperty("--fly-x", `${dx}px`);
    cukeEl.style.setProperty("--fly-y", `${dy}px`);
    cukeEl.style.setProperty("--fly-sx", `${slot.width / cuke.width}`);
    cukeEl.style.setProperty("--fly-sy", `${slot.height / cuke.height}`);

    setRing({ x: slot.left + slot.width / 2, y: slot.top + slot.height / 2 });
    playThunk();
    setStage("flying");

    timers.current.push(setTimeout(() => setStage("landed"), FLY_MS));
    timers.current.push(
      setTimeout(() => setStage("exiting"), FLY_MS + SETTLE_MS)
    );
    timers.current.push(
      setTimeout(onComplete, FLY_MS + SETTLE_MS + EXIT_MS)
    );
  }

  const landed = stage === "landed" || stage === "exiting";

  return (
    <div
      className={`${styles.overlay} ${styles[stage]} ${stage === "exiting" ? styles.exiting : ""}`}
    >
      <div className={styles.dots} />

      <Wordmark
        className={styles.wordmark}
        slotRef={slotRef}
        filled={false}
        hintSlot={stage === "idle"}
      />

      <div className={styles.stage}>
        <button
          type="button"
          className={styles.cucumberBtn}
          onClick={handleClick}
          disabled={stage !== "idle"}
          aria-label="Click the cucumber to enter Cucumber Hood"
        >
          <div className={styles.cukeWrap} ref={cukeRef}>
            <SmartImage sources={CUCUMBER} className={styles.cukeImg} eager />
          </div>
        </button>
      </div>

      {landed && ring && (
        <span className={styles.ring} style={{ left: ring.x, top: ring.y }} />
      )}

      <p className={`${styles.hint} ${stage !== "idle" ? styles.hintStill : ""}`}>
        click the cucumber
      </p>
    </div>
  );
}
