import { useSyncExternalStore } from 'react';
import { config } from '../config';

/**
 * Google Analytics 4, behind cookie consent. Nothing from Google loads until the visitor
 * picks "Allow" on the consent banner; declining, or a Global Privacy Control signal, keeps
 * it off. The choice lasts 12 months, then the banner asks again. It can be changed any
 * time from the footer, and withdrawing it also clears GA's cookies.
 *
 * gtag.js is loaded from this module rather than the usual inline snippet, so the CSP still
 * refuses every inline script but the theme one. Events are only sent from production builds,
 * so local work never pollutes the numbers; the banner itself shows in dev so it can be designed.
 */
type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

export type ConsentChoice = 'granted' | 'denied';

/** Whether this build asks for consent at all. */
export const analyticsConfigured = !!config.analyticsId;
const sending = import.meta.env.PROD && analyticsConfigured;

const CONSENT_KEY = 'rc:consent';
const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

/* ----- consent store ----- */

interface ConsentState {
  /** null until the visitor has chosen (or their choice expired). */
  choice: ConsentChoice | null;
  /** Banner reopened from the footer to change an earlier choice. */
  reviewing: boolean;
}

function readChoice(): ConsentChoice | null {
  try {
    // Storage is user-editable, so anything but a well-formed, unexpired record is ignored.
    const parsed: unknown = JSON.parse(localStorage.getItem(CONSENT_KEY) ?? 'null');
    if (parsed && typeof parsed === 'object') {
      const { choice, at } = parsed as { choice?: unknown; at?: unknown };
      const fresh = typeof at === 'number' && Date.now() - at < CONSENT_TTL_MS;
      if (fresh && (choice === 'granted' || choice === 'denied')) return choice;
    }
  } catch {
    /* ignore — falls through to asking again */
  }
  // A browser-level "don't track me" is an answer already; don't nag those visitors.
  if (typeof navigator !== 'undefined' && navigator.globalPrivacyControl) return 'denied';
  return null;
}

let state: ConsentState = {
  choice: typeof window === 'undefined' ? null : readChoice(),
  reviewing: false,
};
const listeners = new Set<() => void>();

function emit(next: Partial<ConsentState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The visitor's choice, plus whether the banner should be on screen. */
export function useConsent(): ConsentState & { open: boolean } {
  const s = useSyncExternalStore(subscribe, () => state);
  return { ...s, open: analyticsConfigured && (s.choice === null || s.reviewing) };
}

export function setConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice, at: Date.now() }));
  } catch {
    /* ignore — the choice still applies for this visit */
  }
  emit({ choice, reviewing: false });
  if (choice === 'granted') load();
  else unload();
}

/** Reopen the banner to change an earlier choice (footer "Cookie settings"). */
export function reviewConsent(): void {
  emit({ reviewing: true });
}

/** Close a reopened banner without changing anything. */
export function closeConsentReview(): void {
  emit({ reviewing: false });
}

/* ----- gtag ----- */

let loaded = false;

function load() {
  if (!sending) return;
  window[`ga-disable-${config.analyticsId}`] = false;
  if (loaded) {
    window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    return;
  }
  loaded = true;
  window.dataLayer = window.dataLayer ?? [];
  // gtag.js reads the `arguments` object, not an array, so this can't be an arrow function.
  window.gtag = function gtag() {
    window.dataLayer!.push(arguments);
  };
  // Consent covers analytics only; ad storage and ad signals stay off.
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  window.gtag('config', config.analyticsId);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.analyticsId)}`;
  document.head.appendChild(script);
}

/** Withdrawn consent: stop sending and remove the cookies GA already set. */
function unload() {
  if (!analyticsConfigured) return;
  window[`ga-disable-${config.analyticsId}`] = true;
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' });

  const host = window.location.hostname;
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid')
    .forEach((name) =>
      domains.forEach((d) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`;
      }),
    );
}

/** Call once at startup: picks up a choice made on an earlier visit. */
export function initAnalytics(): void {
  if (state.choice === 'granted') load();
}

/** Send a custom event. Safe to call anywhere: a no-op without consent or outside production. */
export function track(event: string, params?: Record<string, string | number | boolean>): void {
  if (sending && state.choice === 'granted') window.gtag?.('event', event, params);
}
