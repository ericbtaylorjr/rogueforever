/**
 * PLACEHOLDER — hand-drawn crossed daggers standing in for the official WoW
 * Rogue class icon. Swap the contents of this one component for the licensed
 * asset; nothing else references the artwork. See README > Assets.
 */
export function RogueMark({ size = 30 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-[6px]"
      style={{
        width: size,
        height: size,
        background: 'var(--accent)',
        boxShadow: 'var(--glow)',
      }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--accent-ink)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 20 15 9l1.6-5.2L20 4l-.3 3.4L14.5 9.5z" />
        <path d="M20 20 9 9 7.4 3.8 4 4l.3 3.4L9.5 9.5z" />
        <path d="M6.6 17.4 4.4 19.6M17.4 17.4l2.2 2.2" />
      </svg>
    </span>
  );
}
