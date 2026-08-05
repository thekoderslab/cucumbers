import styles from "./Marquee.module.css";

/**
 * Scrolling sticker bar. The track holds two identical halves and slides by
 * exactly -50%, so the loop is seamless.
 */
export default function Marquee({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  const half = (key: string) => (
    <div className={styles.half} key={key}>
      {items.map((item, i) => (
        <span key={`${key}-${i}`} className={styles.item}>
          {item}
          <span className={styles.star}> ★</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`${styles.marquee} ${reverse ? styles.reverse : ""}`}
      aria-hidden="true"
    >
      <div className={styles.track}>
        {half("a")}
        {half("b")}
      </div>
    </div>
  );
}
