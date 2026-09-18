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
- **External links**: only Comfy's UI is still a placeholder (`weakauras: '#'` in
  `src/content/links.ts`); its card renders as a disabled "Coming Soon" button.
- **Vite `base`** is `/`. For a GitHub Pages project site, set `VITE_BASE` to
  `/<repo-name>/` in `.github/workflows/deploy.yml`.

## Accessibility

Target: WCAG 2.2 AA. Last audited with axe-core (0 violations at 1440px and 390px,
including the palette and drawer open) plus a manual keyboard pass.

Covered: skip link and `<main>` landmark; nav jumps move keyboard focus to the target
section and respect `prefers-reduced-motion`; tabs use roving tabindex with
arrow/Home/End keys; the palette is a real combobox/listbox with a live result count;
tooltips are dismissible (Esc), hoverable, and only set `aria-describedby` while showing
(WCAG 1.4.13); focus is kept clear of the sticky bars (`scroll-padding-top`); the Gear
table has table semantics and its scroll region is keyboard-reachable; copy buttons have
unique names and announce success; no bare-key shortcuts (WCAG 2.1.4 — only Ctrl/⌘+K);
text meets 4.5:1 (`--dim` is deliberately light — don't darken it back).

Known / accepted: the looping decorative animations (bar shimmer, poison drips, pulsing
dots) have no pause control beyond `prefers-reduced-motion` (WCAG 2.2.2). Not done yet:
arrow-key navigation between FAQ/raid accordion headers (not required by WCAG).

## Security

Static site, no backend, no user input beyond a search box, no `dangerouslySetInnerHTML`,
no third-party scripts, no runtime network requests. `npm audit` is clean.

- **CSP** ships as a `<meta>` tag injected at build time (`vite.config.ts`); everything is
  first-party, including fonts (`src/assets/fonts`, OFL). `style-src` needs
  `'unsafe-inline'` for the design's inline styles; `script-src` does not.
- **Limits of GitHub Pages:** it can't set response headers, so `frame-ancestors`
  (clickjacking), HSTS and `X-Content-Type-Options` aren't available. If the site moves
  behind Cloudflare/Netlify, set them there.
- **External links** use `target="_blank"` with `rel="noreferrer"` (implies `noopener`).
- **Stored data:** the URL `?spec=` param and localStorage are validated against the
  known spec list; anything else is ignored.
- **CI:** actions are pinned to commit SHAs, the workflow defaults to read-only, and only
  the deploy job gets `pages`/`id-token` write. Dependabot keeps both up to date.

## Editorial rules the code enforces

- Every Forever claim carries a status, and only `Confirmed` reads as fact. The
  three badge treatments are in `ForeverWatch.tsx` — keep them distinct.
- The spec board is a 0–100 consensus index, never simulated DPS.
- The sweaty marker is a CSS teardrop, never an emoji.
