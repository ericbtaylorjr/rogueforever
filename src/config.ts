import type { IntensityId, SpecId } from './content/types';

/**
 * Build-time configuration, not end-user settings — there is no settings UI in
 * the design. Recommended ship values are the defaults below.
 */
export interface CompendiumConfig {
  navLayout: 'sidebar' | 'topTabs';
  simView: 'bars' | 'table' | 'cards';
  intensity: IntensityId;
  accent: string;
  showSweaty: boolean;
  phaseLabel: string;
  defaultSpec: SpecId;
}

export const config: CompendiumConfig = {
  navLayout: 'sidebar',
  simView: 'bars',
  intensity: 'shadow',
  accent: '#FFF468',
  showSweaty: true,
  phaseLabel: 'v 0.1',
  defaultSpec: 'cbsword',
};

/** Viewport thresholds. Kept in one place so CSS and JS can't drift apart. */
export const bp = {
  phone: 640,
  stack: 900,
  hero: 980,
  rail: 1100,
  wide: 1600,
} as const;

/** Smooth-scroll offsets, per the handoff. */
export const scrollOffset = { desktop: 78, narrow: 118 } as const;
