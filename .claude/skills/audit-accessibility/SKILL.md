---
name: audit-accessibility
description: Audit the Rogue Handbook for WCAG 2.2 AA accessibility (axe-core, keyboard walk, contrast) and fix what it finds. Use when asked to audit accessibility or a11y, or after adding UI, colours, tooltips or interactive controls.
---

# Accessibility audit

Target: WCAG 2.2 AA. Read README > Accessibility first: it lists what is already covered
and the accepted exceptions (poison drips, non-hoverable tooltips). Don't "fix" those.

## Setup (once per machine)

Audit tools are not project dependencies. Install them in a scratch folder:

    mkdir -p /tmp/audit-tools && cd /tmp/audit-tools && npm init -y && npm i playwright-core axe-core lighthouse
    export AUDIT_TOOLS=/tmp/audit-tools

Chromium comes from Playwright's cache (`npx playwright-core install chromium` if missing).
If Chromium fails with `libnspr4.so`/`libnss3.so`/`libasound.so.2` not found and there is no
sudo: `apt-get download libnspr4 libnss3 libasound2t64`, `dpkg -x` each into a folder, and run
with `LD_LIBRARY_PATH=<folder>/usr/lib/x86_64-linux-gnu`.

Serve the production build (the CSP is only in the build):

    npm run build && npx vite preview --port 4173 --strictPort &

## Run

    npm run audit:a11y                 # all 6 pages × 1440/390px × dark/light, then a keyboard walk
    npm run audit:a11y -- --quick      # first page only
    npm run audit:a11y -- --only=questing

It runs axe-core (WCAG 2 A/AA, 2.1, 2.2 tags) and tabs through the page checking that every
stop shows a focus ring. Exit code 1 on any violation. `incomplete` rules ("need review")
are contrast checks axe can't resolve (gradients, images): spot-check them by eye.

## Beyond axe (check by hand when UI changed)

- Keyboard: Tab through, Esc closes the palette, drawer, privacy dialog and tooltips; arrow
  keys move in tabs and talent trees; focus returns where it started.
- Name vs visible text (WCAG 2.5.3): an `aria-label` must contain the visible text. Spans in a
  flex row need `{' '}` between them so the visible text keeps its spaces (talent order list).
- Colour: new tinted backgrounds (`c.soft`) need the text on them at 4.5:1. Use `text-mute`,
  not `text-faint`, on spec-tinted or active rows. Brand colours (YouTube red) must be dark
  enough for white text: `#cc0000`, not `#ff0000` (4.0:1).
- Reduced motion, 200% zoom and 320px reflow: no horizontal scroll.
- Screen reader names for icon-only buttons and for repeated links (unique names).

## Fix and record

Fix the violations in `src/`, rebuild, rerun until clean, then update README > Accessibility:
the date, axe-core version (`node_modules` of AUDIT_TOOLS), what was covered, and anything newly
accepted. Add a one-line note for each class of problem fixed so the next audit knows why.
A new axe version can flag rules an older one passed: that is a real finding, not noise.
