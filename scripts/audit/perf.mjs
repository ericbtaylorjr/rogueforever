#!/usr/bin/env node
/**
 * Performance audit against the production build:
 *  1. Lighthouse (performance category) on desktop and throttled mobile.
 *  2. Layout shift: every shift during load and 3s after, with the shifted elements (CLS).
 *  3. Interaction latency: click the controls that re-render the most (meta tabs, build
 *     pickers, spec switch, sweaty toggle, Gear tabs) under 4x CPU slowdown and report the
 *     Event Timing duration (input delay + processing + presentation), a lab stand-in for INP.
 *
 * Budgets (exit code 1 when missed): Lighthouse mobile ≥ 95, CLS ≤ 0.1, interaction ≤ 200ms.
 * Field numbers (Cloudflare Web Analytics → Web Vitals) are the source of truth; use this to
 * reproduce what they show. Compare Cloudflare's "Debug View" element against the clicks below.
 *
 *   AUDIT_TOOLS=/tmp/audit-tools node scripts/audit/perf.mjs [--no-lighthouse]
 */
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { PAGES, URL_BASE, chromePath, launch, toolPath } from './lib.mjs';

let failed = false;
const fail = (msg) => {
  failed = true;
  console.log(`   ✗ ${msg}`);
};

if (!process.argv.includes('--no-lighthouse')) {
  const lighthouse = (await import(pathToFileURL(toolPath('lighthouse')).href)).default;
  // Lighthouse attaches to a Chromium started with a debugging port.
  const port = 9333;
  const chrome = spawn(chromePath(), ['--headless=new', `--remote-debugging-port=${port}`, '--no-sandbox', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 2500));
  for (const form of ['desktop', 'mobile']) {
    const settings = { port, onlyCategories: ['performance'], output: 'json', logLevel: 'error' };
    if (form === 'desktop') Object.assign(settings, { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } });
    const { lhr } = await lighthouse(`${URL_BASE}/`, settings);
    const a = lhr.audits;
    const score = Math.round(lhr.categories.performance.score * 100);
    console.log(`Lighthouse ${form}: performance ${score} · FCP ${a['first-contentful-paint'].displayValue} · LCP ${a['largest-contentful-paint'].displayValue} · TBT ${a['total-blocking-time'].displayValue} · CLS ${a['cumulative-layout-shift'].displayValue} · ${Math.round(a['total-byte-weight'].numericValue / 1024)} KiB`);
    if (form === 'mobile' && score < 95) fail(`mobile performance ${score} < 95`);
    for (const id of ['render-blocking-resources', 'unused-javascript', 'dom-size', 'uses-long-cache-ttl', 'legacy-javascript']) {
      const x = a[id];
      if (x && x.score !== null && x.score < 0.9) console.log(`   note: ${x.title} (${x.displayValue ?? ''})`);
    }
  }
  chrome.kill();
}

const browser = await launch();

console.log('\nLayout shifts (load + 3s):');
for (const [label, vp] of [['desktop 1440', { width: 1440, height: 900 }], ['phone 390', { width: 390, height: 844 }]]) {
  for (const page of PAGES.slice(0, 1)) {
    const ctx = await browser.newContext({ viewport: vp, serviceWorkers: 'block' });
    const p = await ctx.newPage();
    await p.addInitScript(() => {
      window.__shifts = [];
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          if (!e.hadRecentInput)
            window.__shifts.push({
              value: e.value,
              at: Math.round(e.startTime),
              nodes: e.sources.map((s) => ({ node: (s.node?.id ? `#${s.node.id}` : s.node?.nodeName) ?? '?', from: s.previousRect.toJSON(), to: s.currentRect.toJSON() })),
            });
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await p.goto(`${URL_BASE}/${page.query}`, { waitUntil: 'load' });
    await p.waitForTimeout(3000);
    const shifts = await p.evaluate(() => window.__shifts);
    const cls = shifts.reduce((n, s) => n + s.value, 0);
    console.log(`  ${label} · ${page.name}: CLS ${cls.toFixed(3)} (${shifts.length} shift${shifts.length === 1 ? '' : 's'})`);
    if (cls > 0.1) fail(`CLS ${cls.toFixed(3)} > 0.1`);
    for (const s of shifts) for (const n of s.nodes) console.log(`     ${s.at}ms ${s.value.toFixed(3)} ${n.node} x ${Math.round(n.from.x)}→${Math.round(n.to.x)} y ${Math.round(n.from.y)}→${Math.round(n.to.y)}`);
    await ctx.close();
  }
}

console.log('\nInteractions under 4x CPU slowdown (Event Timing, ms):');
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
// Injected before load: the page's CSP refuses inline scripts added afterwards.
await p.addInitScript({
  content: `window.__ev = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.interactionId) window.__ev.push({ name: e.name, ms: e.duration, delay: Math.round(e.processingStart - e.startTime), proc: Math.round(e.processingEnd - e.processingStart), target: e.target ? (e.target.id ? '#' + e.target.id : e.target.textContent.trim().slice(0, 30)) : '' }); }).observe({ type: 'event', durationThreshold: 16, buffered: true });`,
});
await p.goto(`${URL_BASE}/?spec=combat&build=backstab`, { waitUntil: 'networkidle' });
const steps = [
  ['Meta tab: Leveling', '#tab-leveling'],
  ['Meta tab: Level 60', '#tab-endgame'],
  ['Build picker: Subtlety Hemo', 'ol[aria-label] button:has-text("Hemo")'],
  ['Build picker: Combat Backstab', 'ol[aria-label] button:has-text("Combat")'],
  ['Meta tab: Leveling again', '#tab-leveling'],
];
for (const [label, selector] of steps) {
  const el = p.locator(selector).first();
  if (!(await el.count())) {
    console.log(`  – ${label}: selector not found (${selector})`);
    continue;
  }
  await el.scrollIntoViewIfNeeded();
  await p.evaluate(() => (window.__ev.length = 0));
  await el.click();
  await p.waitForTimeout(700);
  const ev = await p.evaluate(() => window.__ev);
  const worst = ev.sort((a, b) => b.ms - a.ms)[0];
  console.log(`  ${label}: ${worst ? `${worst.ms}ms (input delay ${worst.delay}, processing ${worst.proc})` : 'under 16ms'}`);
  if (worst && worst.ms > 200) fail(`${label} took ${worst.ms}ms`);
}
await browser.close();
process.exit(failed ? 1 : 0);
