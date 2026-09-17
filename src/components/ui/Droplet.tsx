/**
 * The sweaty-tip marker. A CSS teardrop, never an emoji — see README > Assets.
 */
export function Droplet({
  size = 8,
  color = 'var(--venom)',
  className = '',
  title = 'Sweaty tip',
}: {
  size?: number;
  color?: string;
  className?: string;
  title?: string;
}) {
  return (
    <span
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 ${className}`}
      style={{
        width: size,
        height: size * 1.15,
        background: color,
        borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%',
        clipPath: 'polygon(50% 0%, 100% 62%, 78% 100%, 22% 100%, 0% 62%)',
      }}
    />
  );
}
