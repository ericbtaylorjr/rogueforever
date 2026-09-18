import type { CSSProperties } from 'react';
import { config } from '../config';
import { themes } from '../content/content';
import { hexA } from './color';

/**
 * `intensity` swaps the (dark) surface palette, `accent` recomputes the accent tint
 * and glow. Both are build config (src/config.ts), not user controls.
 */
export function themeVars(theme: 'light' | 'dark' = 'dark'): CSSProperties {
  // `intensity` / `accent` are dark-theme knobs. The light theme's palette lives in
  // styles/index.css and must not be overridden by inline variables.
  if (theme === 'light') return {};
  const t = themes[config.intensity];
  const accent = config.accent;

  const vars: Record<string, string> = {
    '--bg': t.bg,
    '--panel': t.panel,
    '--panel2': t.panel2,
    '--line': t.line,
    '--tex': t.tex,
    '--accent': accent,
    '--accent-dim': hexA(accent, 0.16),
    '--glow': `0 0 44px -14px ${hexA(accent, t.glowA)}`,
  };

  // The venom theme shifts secondary text green-ward. These values still clear
  // 4.5:1 on its darker background — don't darken them further.
  if (config.intensity === 'venom') {
    vars['--mute'] = '#A0BCA6';
    vars['--faint'] = '#8CA894';
  }

  return vars as CSSProperties;
}
