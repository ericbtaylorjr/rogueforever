---
name: audit-performance
description: Audit the Rogue Handbook's performance (Lighthouse, layout shift, interaction latency) and act on Cloudflare Web Analytics field data (FCP, LCP, INP, CLS). Use when asked to audit or improve performance, Core Web Vitals, INP or CLS.
---

# Performance audit

Read README > Performance first: it records what was tried, what was rejected on purpose
(`content-visibility: auto`, prerendering, Preact) and the current numbers.

## Setup

Same as the accessibility audit: tools in `AUDIT_TOOLS`, `npm run build`, then
`npx vite preview --port 4173 --strictPort &`. See `audit-accessibility` for the Chromium
library workaround.

## Run

    npm run audit:perf                 # Lighthouse desktop + mobile, layout shifts, interaction timing
    npm run audit:perf -- --no-lighthouse

Budgets (exit code 1 when missed): Lighthouse mobile ≥ 95, CLS ≤ 0.1, each interaction ≤ 200ms
at 4x CPU slowdown. Lighthouse notes (unused JS, DOM size, Cloudflare's cache and legacy-JS
notes) are known and expected, see the README.

## Field data beats the lab

Cloudflare → Analytics & Logs → Web Analytics → Web Vitals is the source of truth. When the
user shares it, read the **Debug View**: it names the element and the sub-part.

- **INP**: input delay (main thread busy), processing duration (our handlers), presentation
  delay (render, layout, paint). A large presentation delay with tiny processing means the
  click re-rendered or re-laid-out a lot of DOM. Fix by painting the control first and
  deferring the content (`useDeferredValue`/`useShownBuild`, see `SpecBoard` and README).
  Map the element to a component: `#tab-<id>` is `SegmentedTabs`; a `grid … text-left`
  button is a `BuildList` row.
- **CLS**: the element and previous/current rects. `{x:15 → x:0}` with zero sizes reproduced
  nothing locally (checked real scrollbars, 9 widths, slow network); if it recurs, look for
  anything that changes the page's width or inserts content above the fold after load
  (consent banner, scroll lock, late fonts).
- **FCP/LCP**: poor tail on slow networks is the JS bundle: fonts are preloaded, the service
  worker serves repeats; remaining wins are listed in the README ("Preact", prerender).

Reproduce a field number with `audit:perf` before changing code, and show before/after.

## Rules of thumb for changes

Images WebP at ~3× display size; icons lazy; new below-the-fold lists that follow the build
use `useShownBuild()`; don't add a render-blocking request; keep `preload-fonts` in
`vite.config.ts` in sync with the hero's fonts. Remaining big lever: `useHandbook()` is one
context, so every pick re-renders every section; splitting it (spec/build vs UI state) would
cut build-pick cost.

## Record

Update README > Performance: date, Lighthouse scores, what changed, and any new
"not done, on purpose" with its reason.
