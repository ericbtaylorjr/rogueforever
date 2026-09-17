# Rogue DPS Handbook

Single-page reference site for World of Warcraft Classic Rogues. Built from the
Claude Design handoff package (`design_handoff_rogue_compendium`).

React 19 + Vite 8 + TypeScript + Tailwind CSS 4.3, deployed to GitHub Pages.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build -> dist/
npm run typecheck
```

## Structure

```
src/
  config.ts                  build config (navLayout, simView, intensity, accent, …)
  styles/index.css           design tokens (@theme inline), type roles, keyframes
  content/
    content.json             data, verbatim from the handoff — edit this, not markup
    content.ts               typed loader + derived filters/counts
    copy.ts                  prose extracted from the prototype markup
    types.ts                 content types incl. the real GearItem schema
    gear.ts                  item data (intentionally empty) + quality colours
    links.ts                 every external URL — all TODO placeholders
    palette.ts               consumable category dot colours
    searchIndex.ts           ~126-entry command palette index
  state/CompendiumProvider.tsx  all page state, scroll-spy, keyboard, persistence
  components/shell/          sidebar, mobile bar, drawer, palette, spec bar, top tabs
  components/ui/             droplet, logo, callout, pills, copy button, tooltip
  components/sections/       the 15 sections, one file each
```

## Decisions worth knowing

**Tokens live in CSS variables, not in `@theme` directly.** `:root` holds the raw
values and `@theme inline` maps them into Tailwind's namespace, so `bg-panel`,
`text-mute` and `border-line` all follow a runtime override. That's what makes
the `intensity` / `accent` build config work without a second stylesheet.

**Display type is CSS component classes** (`.t-h1`, `.t-h2`, `.t-card-title`, …)
rather than piles of arbitrary utilities. The condensed Archivo widths are
load-bearing and the values are easier to tune in one place.

**Breakpoints are named for what they do**: `stack:` (900px), `hero:` (980px),
`rail:` (1100px), `wide:` (1600px). Layout switches the design drives from JS
(drawer, scroll offset, Forever outlook rows) read the same numbers from
`src/config.ts` so CSS and JS can't drift.

**Copy never lives in JSX.** `content.json` covers every data array; the hero,
section intros, callouts and footer are in `copy.ts` because the prototype
authored them in markup.

## Deliberately unfinished

- **Gear table** renders 17 slot rows against the real `GearItem` schema and shows
  an empty state. Fill `gearSets` in `src/content/gear.ts` and every row fills,
  Wowhead quality colouring and tooltips included. Item icons are a
  diagonal-hatch placeholder.
- **Rogue class icon** is a hand-drawn stand-in, isolated in
  `components/ui/RogueMark.tsx`. Swapping it touches one file.
- **External links** are all `#` placeholders in `src/content/links.ts`.
- **Vite `base`** is `/`. For a GitHub Pages project site, set `VITE_BASE` to
  `/<repo-name>/` in `.github/workflows/deploy.yml`.
- **Fonts** load from Google Fonts in `index.html`. Self-host before launch.

## Accessibility

Covered: real ARIA on tabs, accordions, the palette dialog and the drawer; focus
traps and focus restoration on both overlays; arrow-key + Enter navigation in the
palette; tooltips answer focus and tap, not just hover; `prefers-reduced-motion`
disables the six looping animations; 44px touch targets; live regions on the spec
and filter changes.

Not done yet: arrow-key navigation between tabs and accordion headers.

## Editorial rules the code enforces

- Every Forever claim carries a status, and only `Confirmed` reads as fact. The
  three badge treatments are in `ForeverWatch.tsx` — keep them distinct.
- The spec board is a 0–100 consensus index, never simulated DPS.
- The sweaty marker is a CSS teardrop, never an emoji.
