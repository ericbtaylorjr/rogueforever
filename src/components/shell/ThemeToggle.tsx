import { theme as copy } from '../../content/copy';
import { useTheme } from '../../state/ThemeProvider';

/** Sun when you're in dark (tap to go light), moon when you're in light — the icon is the destination. */
export function ThemeToggle({ size = 36 }: { size?: number }) {
  const { theme, toggleTheme } = useTheme();
  const toLight = theme === 'dark';
  const label = toLight ? copy.toLight : copy.toDark;
  const touch = size > 36; // matches the neighbouring 44px MobileBar buttons

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`grid shrink-0 place-items-center border border-line transition-colors hover:border-accent hover:text-accent ${
        touch ? 'rounded-[10px] text-mute' : 'rounded-[8px] text-faint'
      }`}
      style={
        touch ? { width: size, height: size } : { width: size, background: 'var(--surface-deep)' } // height comes from the search field beside it
      }
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {toLight ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
          </>
        ) : (
          <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z" />
        )}
      </svg>
    </button>
  );
}
