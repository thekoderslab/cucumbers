"use client";

import { useState } from "react";

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
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      decoding={eager ? "sync" : "async"}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
