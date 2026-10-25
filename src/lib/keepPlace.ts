import { useLayoutEffect } from 'react';
import { bp, scrollOffset } from '../config';

/**
 * Switching spec or build swaps the Talents, Stats and Gear content, which changes its
 * height. Left alone, everything below it slides under a scroll position that hasn't moved:
 * reading Rotation, a switch can leave Gear on screen. So a switch holds the section you're
 * reading, and once the new build has rendered (before it paints), the page scrolls by
 * however far that section moved. Nothing on screen moves and nothing animates.
 *
 * The browser's own scroll anchoring can't do this: inside the spec sections, what it would
 * anchor to is the content being replaced (Safari has none at all). Below them it can, so
 * it's switched off while a switch is held, leaving one correction in every browser.
 */

/** Where a section's top sits once scrolled to: just under the sticky header. */
export const sectionOffset = () =>
  window.innerWidth < bp.rail ? scrollOffset.narrow : scrollOffset.desktop;

let held: { el: HTMLElement; top: number; target: string } | null = null;

/** Hold the section under the sticky header until the build `target` (`spec/build`) has rendered. */
export function holdPlace(target: string): void {
  const line = sectionOffset() + 1;
  let el: HTMLElement | null = null;
  for (const s of document.querySelectorAll<HTMLElement>('main section[id]')) {
    if (s.getBoundingClientRect().top <= line) el = s;
  }
  held = el && { el, top: el.getBoundingClientRect().top, target };
  if (held) document.documentElement.style.overflowAnchor = 'none';
}

/**
 * Puts the held section back where it was after every commit until `shown` (the rendered
 * `spec/build`) reaches the target. Call it from a component that renders the deferred build.
 */
export function useKeepPlace(shown: string): void {
  useLayoutEffect(() => {
    if (!held) return;
    const moved = held.el.getBoundingClientRect().top - held.top;
    if (Math.abs(moved) >= 1) window.scrollBy({ top: moved, behavior: 'instant' });
    if (shown === held.target) {
      held = null;
      document.documentElement.style.overflowAnchor = '';
    }
  });
}
