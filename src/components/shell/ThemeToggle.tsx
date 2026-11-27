import { theme as copy } from '../../content/copy';
import { useTheme } from '../../state/ThemeProvider';

const LABEL = { light: copy.toLight, dark: copy.toDark, christmas: copy.toChristmas } as const;

/**
 * The icon is the destination: a snowflake in dark (the holiday theme is next, and it pulses frost
 * three times to say so, then rests with a faint glow), a sun in the holiday theme, a moon in light.
 */
export function ThemeToggle({ size = 36 }: { size?: number }) {
  const { next, toggleTheme } = useTheme();
  const label = LABEL[next];
  const touch = size > 36; // matches the neighbouring 44px MobileBar buttons
  const frost = next === 'christmas';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`grid shrink-0 place-items-center border transition-colors hover:border-accent hover:text-accent ${
        frost ? 'frost-btn' : 'border-line'
      } ${touch ? 'rounded-[10px]' : 'rounded-[8px]'} ${
        frost ? '' : touch ? 'text-mute' : 'text-faint'
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
        {next === 'christmas' && (
          <>
            <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7" />
            <path d="m9.5 3.8 2.5 2.2 2.5-2.2M9.5 20.2l2.5-2.2 2.5 2.2M3.2 10.4l3.3-.6.5-3.2M21 13.6l-3.3.6-.5 3.2M3.2 13.6l3.3.6.5 3.2M21 10.4l-3.3-.6-.5-3.2" />
          </>
        )}
        {next === 'light' && (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
          </>
        )}
        {next === 'dark' && <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z" />}
      </svg>
    </button>
  );
}
