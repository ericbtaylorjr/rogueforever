import { useEffect } from 'react';
import { track } from './analytics';

/**
 * `section_view`: what people actually look at, not just where they clicked. A section counts
 * as "in view" while it fills at least half the screen (or, if it's shorter than that, while at
 * least half of it is showing). Each stretch in view that lasts 2s or more is one event, sent
 * when it ends (scrolled away, tab hidden, page closed) with:
 *   section     — the section id, e.g. "talents"
 *   seconds     — how long that stretch lasted
 *   via         — "nav" if the visitor jumped there from the nav or search, else "scroll"
 *   nth_section — how many sections this visit has viewed so far, for reading order
 * Coming back to a section later counts again, so event count is views, not unique sections.
 */
const MIN_MS = 2000;
const MAX_SECONDS = 1800; // a tab left open overnight shouldn't skew the averages
/** A jump only claims the view if the section was reached within this long of it. */
const JUMP_WINDOW_MS = 2500;
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

let lastJump: { id: string; at: number } | null = null;

/** Called by HandbookProvider's jump(), so the next view of that section is credited to the nav. */
export function noteJump(id: string): void {
  lastJump = { id, at: performance.now() };
}

export function useSectionViews(ids: readonly string[]): void {
  useEffect(() => {
    const nodes = ids.map((id) => document.getElementById(id)).filter((n): n is HTMLElement => !!n);
    if (!nodes.length) return;

    /** Sections in view right now: when the current stretch began, and how they were reached. */
    const live = new Map<string, { since: number; via: 'nav' | 'scroll' }>();
    let viewed = 0;

    const start = (id: string) => {
      if (live.has(id)) return;
      const now = performance.now();
      const fromNav = lastJump?.id === id && now - lastJump.at < JUMP_WINDOW_MS;
      live.set(id, { since: now, via: fromNav ? 'nav' : 'scroll' });
    };

    const end = (id: string) => {
      const v = live.get(id);
      if (!v) return;
      live.delete(id);
      const ms = performance.now() - v.since;
      if (ms < MIN_MS) return;
      viewed += 1;
      track('section_view', {
        section: id,
        seconds: Math.min(Math.round(ms / 1000), MAX_SECONDS),
        via: v.via,
        nth_section: viewed,
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const vh = e.rootBounds?.height ?? window.innerHeight;
          const shown = e.intersectionRect.height;
          const inView = e.isIntersecting && shown >= Math.min(vh, e.boundingClientRect.height) * 0.5;
          if (inView) start(e.target.id);
          else end(e.target.id);
        }
      },
      { threshold: THRESHOLDS },
    );
    nodes.forEach((n) => io.observe(n));

    // A hidden tab isn't being read: close every stretch, and restart them when it's back.
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') [...live.keys()].forEach(end);
      else nodes.forEach((n) => {
        io.unobserve(n);
        io.observe(n); // re-reports current intersection, restarting what's still in view
      });
    };
    const onPageHide = () => [...live.keys()].forEach(end);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      [...live.keys()].forEach(end);
    };
  }, [ids]);
}
