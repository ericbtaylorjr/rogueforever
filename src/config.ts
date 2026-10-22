import type { IntensityId, SpecId } from './content/types.ts';

/**
 * Build-time configuration, not end-user settings — there is no settings UI in
 * the design. Recommended ship values are the defaults below.
 */
export interface HandbookConfig {
  navLayout: 'sidebar' | 'topTabs';
  simView: 'bars' | 'table' | 'cards';
  intensity: IntensityId;
  accent: string;
  showSweaty: boolean;
  phaseLabel: string;
  defaultSpec: SpecId;
  /** GA4 measurement ID (`G-…`). Public by design, so it lives here. Empty turns analytics off. */
  analyticsId: string;
  /**
   * Cloudflare Web Analytics site token. Cookieless visit counts for every visitor, so no
   * consent is asked for it. Public by design (it ships in the page). Empty turns it off.
   */
  cfBeaconToken: string;
}

export const config: HandbookConfig = {
  navLayout: 'sidebar',
  simView: 'bars',
  intensity: 'shadow',
  accent: '#FFF468',
  showSweaty: true,
  phaseLabel: 'v 1.60.1',
  defaultSpec: 'combat',
  analyticsId: 'G-2X22ZZJLFJ',
  cfBeaconToken: '464cb912098a449fb507327176b98dbd',
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
