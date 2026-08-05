import { Ref } from "react";
import styles from "./Wordmark.module.css";
import CucumberImage from "./CucumberImage";

// "D" with the left stem omitted — the cucumber supplies it.
// viewBox 110x130; the stem occupies x 0-36.
const D_BOWL =
  "M36,0 H58 C88,0 110,26 110,65 C110,104 88,130 58,130 H36 V102 H58 " +
  "C72,102 79,88 79,65 C79,42 72,28 58,28 H36 Z";

export default function Wordmark({
  className,
  slotRef,
  filled = true,
  hintSlot = false,
  stacked = true,
}: {
  className?: string;
  /** Measured by EntryScreen to fly the cucumber into the D. */
  slotRef?: Ref<HTMLSpanElement>;
  /** Render the cucumber inside the D's stem slot. */
  filled?: boolean;
  /** Dashed outline hinting where the cucumber belongs. */
  hintSlot?: boolean;
  stacked?: boolean;
}) {
  return (
    <span
      className={`${styles.mark} ${stacked ? styles.stacked : styles.inline} ${className ?? ""}`}
    >
      <span aria-hidden="true" className={styles.line}>
        Cucumber
      </span>
      <span aria-hidden="true" className={styles.line}>
        Hoo
        <span className={styles.dWrap}>
          <svg className={styles.dBowl} viewBox="0 0 110 130" focusable="false">
            <path d={D_BOWL} fill="currentColor" />
          </svg>
          <span
            ref={slotRef}
            className={`${styles.slot} ${hintSlot ? styles.slotHint : ""}`}
          >
            {filled && <CucumberImage className={styles.slotCuke} alt="" />}
          </span>
        </span>
      </span>
      <span className="visually-hidden">Cucumber Hood</span>
    </span>
  );
}
