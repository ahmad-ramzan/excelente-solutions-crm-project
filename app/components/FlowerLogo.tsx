// SVG Flower / brand mark — extracted from the prototype's canvas drawing
export default function FlowerLogo({
  size = 34,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="fg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A768FD" />
          <stop offset="52%" stopColor="#608FF7" />
          <stop offset="100%" stopColor="#1AB3F6" />
        </linearGradient>
        <linearGradient id="fg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1AB3F6" />
          <stop offset="100%" stopColor="#608FF7" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill="url(#fg1)" />
      {/* Petal 1 — top */}
      <ellipse cx="50" cy="26" rx="9" ry="18" fill="rgba(255,255,255,0.85)" transform="rotate(0 50 50)" />
      {/* Petal 2 — top-right */}
      <ellipse cx="50" cy="26" rx="9" ry="18" fill="rgba(255,255,255,0.75)" transform="rotate(60 50 50)" />
      {/* Petal 3 — bottom-right */}
      <ellipse cx="50" cy="26" rx="9" ry="18" fill="rgba(255,255,255,0.65)" transform="rotate(120 50 50)" />
      {/* Petal 4 — bottom */}
      <ellipse cx="50" cy="26" rx="9" ry="18" fill="rgba(255,255,255,0.85)" transform="rotate(180 50 50)" />
      {/* Petal 5 — bottom-left */}
      <ellipse cx="50" cy="26" rx="9" ry="18" fill="rgba(255,255,255,0.75)" transform="rotate(240 50 50)" />
      {/* Petal 6 — top-left */}
      <ellipse cx="50" cy="26" rx="9" ry="18" fill="rgba(255,255,255,0.65)" transform="rotate(300 50 50)" />
      {/* Centre circle */}
      <circle cx="50" cy="50" r="13" fill="url(#fg2)" />
      <circle cx="50" cy="50" r="8" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}
