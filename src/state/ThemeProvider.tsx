import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { readableOnLight } from '../lib/tone';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  /** Content colour → a version that's legible in the current theme (identity in dark). */
  tone: (hex: string, min?: number) => string;
}

const STORE_KEY = 'rc:theme';
const META_COLOR: Record<Theme, string> = { dark: '#0B0B0D', light: '#EBDEB6' };
const LIGHT_QUERY = '(prefers-color-scheme: light)';

const Ctx = createContext<ThemeState | null>(null);

/** A choice made with the toggle, if any. Anything else in storage is ignored. */
function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(STORE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

/** Device setting, defaulting to dark when it can't tell us. Mirrors public/theme-init.js. */
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
  if (applied === 'light' || applied === 'dark') return applied;
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
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem(STORE_KEY, next);
    } catch {
      /* a preference, not a requirement */
    }
    setTheme(next);
  }, [theme]);

  const value = useMemo<ThemeState>(
    () => ({
      theme,
      toggleTheme,
      tone: (hex, min) => (theme === 'light' ? readableOnLight(hex, min) : hex),
    }),
    [theme, toggleTheme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
