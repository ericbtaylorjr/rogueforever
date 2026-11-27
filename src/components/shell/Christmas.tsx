import { useEffect, useState } from 'react';
import { theme as copy } from '../../content/copy';

const STILL_KEY = 'rc:snow';

/** Flakes with fixed, hand-picked numbers (no Math.random), so the snow looks the same on every render. */
const FLAKES = Array.from({ length: 56 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  size: 3 + ((i * 5) % 7),
  opacity: 0.45 + ((i * 7) % 5) / 10,
  duration: 10 + ((i * 3) % 11),
  delay: -((i * 2.3) % 21),
  drift: `${((i % 2 ? 1 : -1) * (20 + ((i * 11) % 60))).toString()}px`,
}));

function PauseIcon({ playing }: { playing: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      {playing ? (
        <>
          <rect x="2.5" y="2" width="3" height="10" rx="1" />
          <rect x="8.5" y="2" width="3" height="10" rx="1" />
        </>
      ) : (
        <path d="M3.5 1.8v10.4c0 .5.5.8.9.5l8-5.2c.4-.3.4-.8 0-1l-8-5.2c-.4-.3-.9 0-.9.5z" />
      )}
    </svg>
  );
}

/**
 * The holiday theme's falling snow, plus a button to pause it and the lights (WCAG 2.2.2: moving
 * content that starts on its own and runs longer than five seconds needs a way to stop it).
 * Reduced-motion visitors get no snow at all (styles/index.css) and the lights hold still.
 */
export function Snowfall() {
  const [still, setStill] = useState(() => {
    try {
      return localStorage.getItem(STILL_KEY) === 'off';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('xmas-still', still);
    return () => document.documentElement.classList.remove('xmas-still');
  }, [still]);

  const toggle = () => {
    const next = !still;
    setStill(next);
    try {
      if (next) localStorage.setItem(STILL_KEY, 'off');
      else localStorage.removeItem(STILL_KEY);
    } catch {
      /* a preference, not a requirement */
    }
  };

  return (
    <>
      <div className="xmas-snow" aria-hidden="true">
        {FLAKES.map((f, i) => (
          <span
            key={i}
            className="xmas-flake"
            style={
              {
                '--l': f.left,
                '--s': `${f.size}px`,
                '--o': f.opacity,
                '--d': `${f.duration}s`,
                '--dl': `${f.delay}s`,
                '--x': f.drift,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={still}
        aria-label={still ? copy.playSnow : copy.pauseSnow}
        title={still ? copy.playSnow : copy.pauseSnow}
        className="fixed right-[14px] bottom-[calc(14px+env(safe-area-inset-bottom,0px))] z-[48] grid size-[38px] place-items-center rounded-full border border-line text-mute transition-colors hover:border-accent hover:text-accent"
        style={{ background: 'var(--surface-pop)' }}
      >
        <PauseIcon playing={!still} />
      </button>
    </>
  );
}

/** A string of lights swagged across the top of the page. */
export function Garland() {
  return (
    <div className="xmas-garland" aria-hidden="true">
      {Array.from({ length: 28 }, (_, i) => (
        <span key={i} className="xmas-bulb-unit" style={{ '--i': i } as React.CSSProperties} />
      ))}
    </div>
  );
}

/** A Santa hat tipped over the corner of the logo. */
export function SantaHat({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{ left: -size * 0.28, top: -size * 0.62, transform: 'rotate(-18deg)' }}
    >
      <path d="M3 17C4 7 11 2 19 5c-2 2-1 5 3 8l-1 4z" fill="#e0303c" />
      <rect x="1.5" y="15" width="21" height="5" rx="2.5" fill="#fff7ea" />
      <circle cx="20" cy="6" r="2.8" fill="#fff7ea" />
    </svg>
  );
}

/** One snowflake for the hero rule: six arms with a pair of barbs each. */
export function Flake({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#cfeeff"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7" />
      <path d="m9 4.5 3 2.5 3-2.5M9 19.5l3-2.5 3 2.5" />
    </svg>
  );
}
