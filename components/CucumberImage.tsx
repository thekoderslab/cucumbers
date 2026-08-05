"use client";

import { useState } from "react";

/**
 * Renders the Cucumber Hood mascot from /public/cucumber-base.png.
 * Falls back to a hand-drawn SVG placeholder if that file hasn't been
 * added to /public yet, so the site still looks reasonable in the meantime.
 */
export default function CucumberImage({
  className,
  alt = "Cucumber Hood mascot",
}: {
  className?: string;
  alt?: string;
}) {
  const [src, setSrc] = useState("/cucumber-base.png");

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setSrc("/cucumber-placeholder.svg")}
    />
  );
}
