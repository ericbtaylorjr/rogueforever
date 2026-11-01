/** Gold star that marks "New to Rogue?", in the left navigation and the intro button. */
export function StarIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`shrink-0 ${className ?? ''}`}
      style={{ width: size, height: size, fill: '#F5C518' }}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
