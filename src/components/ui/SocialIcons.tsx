/**
 * Minimal inline social-link glyphs — generic shapes, not brand wordmarks. See README > Assets.
 */
type IconProps = { size?: number };

const shared = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Video-camera glyph, standing in for YouTube. */
export function VideoIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...shared} aria-hidden="true">
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.89L15 14" />
    </svg>
  );
}

/** Smartphone glyph, standing in for TikTok. */
export function PhoneIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...shared} aria-hidden="true">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

/** Envelope glyph for the mail link. */
export function MailIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...shared} aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="M2.5 6.5l9.5 7 9.5-7" />
    </svg>
  );
}

/** TV glyph, standing in for Twitch. */
export function TvIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...shared} aria-hidden="true">
      <rect x="2.5" y="7" width="19" height="14" rx="2" />
      <path d="M17 2l-5 5-5-5" />
    </svg>
  );
}
