"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders the first source in the chain that actually loads, walking down
 * the list on error. If none load, renders a labelled placeholder tile
 * instead of a broken image.
 */
export default function SmartImage({
  sources,
  alt = "",
  className,
  placeholderClassName,
  placeholderLabel,
  eager = false,
}: {
  sources: string[];
  alt?: string;
  className?: string;
  placeholderClassName?: string;
  placeholderLabel?: string;
  /** Load immediately — for above-the-fold art and anything measured on load. */
  eager?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const advance = () => setIndex((i) => i + 1);

  /*
   * The markup is server-rendered, so the browser starts fetching the first
   * source while parsing the HTML — potentially failing *before* React
   * hydrates and attaches onError, which would strand us on a broken source
   * forever. A finished-but-zero-width image is exactly that case, so check
   * for it once the element is live.
   */
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) {
      advance();
    }
  }, [index]);

  if (index >= sources.length) {
    return (
      <span className={placeholderClassName} aria-hidden="true">
        {placeholderLabel ?? alt}
      </span>
    );
  }

  const src = sources[index];

  return (
    // `key` forces a remount when we fall through to the next source, so the
    // browser re-runs the load (and can fire onError again).
    <img
      key={src}
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      decoding={eager ? "sync" : "async"}
      onError={advance}
    />
  );
}
