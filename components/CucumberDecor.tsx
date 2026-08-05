/**
 * Decorative SVG accessories composited on top of the base cucumber image,
 * so we don't depend on a separate "finished look" art asset.
 */

export function Sunglasses({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 70"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g>
        <path
          d="M2 26 L20 20"
          stroke="#0b1f12"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M198 26 L180 20"
          stroke="#0b1f12"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="10" y="12" width="76" height="46" rx="20" fill="#0b1f12" />
        <rect x="114" y="12" width="76" height="46" rx="20" fill="#0b1f12" />
        <rect x="82" y="28" width="36" height="9" rx="4.5" fill="#0b1f12" />
        <rect
          x="20"
          y="19"
          width="26"
          height="16"
          rx="8"
          fill="#ffffff"
          opacity="0.28"
        />
        <rect
          x="124"
          y="19"
          width="26"
          height="16"
          rx="8"
          fill="#ffffff"
          opacity="0.28"
        />
      </g>
    </svg>
  );
}

export function Cap({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 120"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="112" cy="96" rx="98" ry="18" fill="#0b1f12" />
      <path
        d="M20 84 Q28 8 122 8 Q198 12 206 76 Q118 104 20 84 Z"
        fill="#123a1f"
      />
      <path
        d="M20 84 Q28 8 122 8"
        stroke="#0b1f12"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="122" cy="14" r="6" fill="#0b1f12" />
    </svg>
  );
}
