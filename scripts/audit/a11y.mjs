#!/usr/bin/env node
/**
 * Accessibility audit: axe-core (WCAG 2.2 A/AA) on every PAGES entry at desktop and phone
 * widths, dark and light, plus a keyboard walk that checks every tab stop shows a focus
 * indicator. Exit code 1 on any violation or missing focus ring.
 *
 *   AUDIT_TOOLS=/tmp/audit-tools node scripts/audit/a11y.mjs [--quick | --only=<text in page name>]
 */
import { readFileSync } from 'node:fs';
import { PAGES, URL_BASE, VIEWPORTS, launch, toolPath } from './lib.mjs';

const quick = process.argv.includes('--quick');
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
const axeSource = readFileSync(toolPath('axe-core/axe.min.js'), 'utf8');
const browser = await launch();
let failures = 0;

const pages = only ? PAGES.filter((p) => p.name.includes(only)) : quick ? PAGES.slice(0, 1) : PAGES;
for (const page of pages) {
  for (const vp of VIEWPORTS) {
    for (const theme of ['dark', 'light']) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.hasTouch,
        colorScheme: theme,
        serviceWorkers: 'block',
      });
      const p = await ctx.newPage();
      // The consent banner is part of what a first-time visitor sees, so audit with it showing.
      await p.goto(`${URL_BASE}/${page.query}`, { waitUntil: 'networkidle' });
      await p.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await p.waitForTimeout(800);
      await p.evaluate(axeSource);
      const result = await p.evaluate(() =>
        // eslint-disable-next-line no-undef
        axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }),
      );
      const tag = `${page.name} · ${vp.name}px · ${theme}`;
      if (result.violations.length) {
        failures += result.violations.length;
        console.log(`✗ ${tag}`);
        for (const v of result.violations) {
          console.log(`   ${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s)`);
          for (const n of v.nodes.slice(0, 3)) console.log(`     ${n.target.join(' ')}`);
        }
      } else console.log(`✓ ${tag} · ${result.passes.length} rules passed, ${result.incomplete.length} need review`);
      await ctx.close();
    }
  }
}

// Keyboard walk (desktop, dark): Tab through the page; every stop must show an outline or ring.
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const p = await ctx.newPage();
await p.goto(`${URL_BASE}/${PAGES[0].query}`, { waitUntil: 'networkidle' });
const seen = new Set();
let stops = 0;
const noRing = [];
for (let i = 0; i < 600; i++) {
  await p.keyboard.press('Tab');
  const info = await p.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    const ring =
      (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
      (cs.boxShadow && cs.boxShadow !== 'none');
    const key = `${el.tagName}|${el.id}|${el.getAttribute('aria-label') ?? ''}|${(el.textContent ?? '').trim().slice(0, 30)}|${el.getBoundingClientRect().top + scrollY | 0}`;
    return { key, ring, label: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40)}"` };
  });
  if (!info) continue;
  if (seen.has(info.key)) break;
  seen.add(info.key);
  stops++;
  if (!info.ring) noRing.push(info.label);
}
console.log(`\nKeyboard walk: ${stops} tab stops, ${noRing.length} without a visible focus ring`);
for (const l of noRing.slice(0, 15)) console.log(`   ✗ ${l}`);
failures += noRing.length;
await browser.close();
process.exit(failures ? 1 : 0);
