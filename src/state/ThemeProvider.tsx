import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { track } from '../lib/analytics';
import { CHRISTMAS_SURFACES, readableOnDark, readableOnLight } from '../lib/tone';

export type Theme = 'light' | 'dark' | 'christmas';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  /** Where the toggle goes next. */
  next: Theme;
  /** Content colour → a version that's legible in the current theme. */
  tone: (hex: string, min?: number) => string;
}

const STORE_KEY = 'rc:theme';
const META_COLOR: Record<Theme, string> = { dark: '#0B0B0D', light: '#EBDEB6', christmas: '#0B1F15' };
/** Dark → holiday → light → dark. The holiday theme is only ever chosen, never picked for you. */
const NEXT: Record<Theme, Theme> = { dark: 'christmas', christmas: 'light', light: 'dark' };
const LIGHT_QUERY = '(prefers-color-scheme: light)';

const Ctx = createContext<ThemeState | null>(null);

/** A choice made with the toggle, if any. Anything else in storage is ignored. */
function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(STORE_KEY);
    return v === 'light' || v === 'dark' || v === 'christmas' ? v : null;
  } catch {
    return null;
  }
}

/** Device setting, defaulting to dark when it can't tell us. Mirrors src/theme-init.js. */
function deviceTheme(): Theme {
  try {
    return window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function initialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  // theme-init.js already resolved this before first paint; trust it so React can't disagree.
  const applied = document.documentElement.getAttribute('data-theme');
  if (applied === 'light' || applied === 'dark' || applied === 'christmas') return applied;
  return readStored() ?? deviceTheme();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme]);
  }, [theme]);

  // With no explicit choice, keep following the device (e.g. OS switches at sunset).
  useEffect(() => {
    let mq: MediaQueryList;
    try {
      mq = window.matchMedia(LIGHT_QUERY);
    } catch {
      return;
    }
    const onChange = () => {
      if (!readStored()) setTheme(mq.matches ? 'light' : 'dark');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = NEXT[theme];
    try {
      localStorage.setItem(STORE_KEY, next);
    } catch {
      /* a preference, not a requirement */
    }
    setTheme(next);
    track('theme_toggle', { theme: next });
  }, [theme]);

  const value = useMemo<ThemeState>(
    () => ({
      theme,
      next: NEXT[theme],
      toggleTheme,
      tone: (hex, min) =>
        theme === 'light'
          ? readableOnLight(hex, min)
          : readableOnDark(hex, min, theme === 'christmas' ? CHRISTMAS_SURFACES : undefined),
    }),
    [theme, toggleTheme],
  );

  return <Ctx value={value}>{children}</Ctx>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
