/**
 * Starator logo — a gold star above an open book.
 * Single SVG; same artwork is reused for the favicon (public/favicon.svg)
 * and any in-app placement.
 *
 *   <Logo size={44} />               -> mark only, transparent background
 *   <Logo size={64} showBg />        -> mark with the rounded cream background
 */
interface Props {
  size?: number;
  showBg?: boolean;
  title?: string;
}

export function Logo({ size = 44, showBg = false, title = 'Starator' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 240"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      style={{ flexShrink: 0 }}
    >
      <title>{title}</title>
      {showBg && <rect width="240" height="240" rx="48" fill="#fbf6e9" />}
      {/* Star */}
      <path
        d="M120 32 L133.5 72 L176 72 L141.5 96.5 L154.8 137 L120 112 L85.2 137 L98.5 96.5 L64 72 L106.5 72 Z"
        fill="#e7b541"
        stroke="#a07a1c"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Book binding (shadow base) */}
      <path d="M40 154 Q120 142 200 154 L200 214 Q120 202 40 214 Z" fill="#8c5a2c" />
      {/* Book pages */}
      <path
        d="M48 162 Q120 152 192 162 L192 206 Q120 196 48 206 Z"
        fill="#fbf6e9"
        stroke="#5a3a1a"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Center spine */}
      <line x1="120" y1="153" x2="120" y2="196" stroke="#5a3a1a" strokeWidth="3" />
      {/* Page text lines (suggestion of text) */}
      <line x1="64" y1="174" x2="106" y2="172" stroke="#5a3a1a" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
      <line x1="64" y1="186" x2="100" y2="184" stroke="#5a3a1a" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
      <line x1="134" y1="172" x2="176" y2="174" stroke="#5a3a1a" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
      <line x1="140" y1="184" x2="176" y2="186" stroke="#5a3a1a" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
    </svg>
  );
}
