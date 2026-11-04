/**
 * Shared helpers for the audit scripts (npm run audit:*). The audit tools (playwright-core,
 * axe-core, lighthouse) are NOT project dependencies: install them in a scratch folder and
 * point AUDIT_TOOLS at it, so the repo's lockfile and CI stay clean.
 *
 *   mkdir -p /tmp/audit-tools && cd /tmp/audit-tools && npm init -y && npm i playwright-core axe-core lighthouse
 *   AUDIT_TOOLS=/tmp/audit-tools npm run audit:a11y
 *
 * Every script audits a production build served by `vite preview` (AUDIT_URL, default
 * http://localhost:4173): `npm run build && npx vite preview --port 4173 --strictPort &`.
 * Chromium comes from Playwright's cache (CHROME_PATH overrides it).
 */
import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const URL_BASE = (process.env.AUDIT_URL ?? 'http://localhost:4173').replace(/\/$/, '');

const toolsDir = process.env.AUDIT_TOOLS;
if (!toolsDir) {
  console.error('Set AUDIT_TOOLS to a folder with playwright-core, axe-core and lighthouse installed (see scripts/audit/lib.mjs).');
  process.exit(1);
}
const req = createRequire(join(toolsDir, 'package.json'));
export const tool = (name) => req(name);
export const toolPath = (name) => req.resolve(name);

export function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = join(homedir(), '.cache', 'ms-playwright');
  const dirs = existsSync(cache) ? readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort() : [];
  const dir = dirs.at(-1);
  const exe = dir && join(cache, dir, 'chrome-linux64', 'chrome');
  if (!exe || !existsSync(exe)) throw new Error('No Chromium found. Set CHROME_PATH or run `npx playwright-core install chromium`.');
  return exe;
}

export async function launch() {
  const { chromium } = tool('playwright-core');
  // Real scrollbars on, as on a desktop browser: headless hides them, which hides scrollbar layout shifts.
  return chromium.launch({ executablePath: chromePath(), args: ['--no-sandbox'], ignoreDefaultArgs: ['--hide-scrollbars'] });
}

/** One page per build family: an endgame build, and one leveling build per spec. */
export const PAGES = [
  { name: 'combat/backstab (level 60)', query: '?spec=combat&build=backstab' },
  { name: 'assassination/mutilate (level 60)', query: '?spec=assassination&build=mutilate' },
  { name: 'subtlety/hemo (level 60)', query: '?spec=subtlety&build=hemo' },
  { name: 'combat/questing (leveling)', query: '?spec=combat&build=questing' },
  { name: 'assassination/dungeons (leveling)', query: '?spec=assassination&build=dungeons' },
  { name: 'subtlety/questing (leveling)', query: '?spec=subtlety&build=questing' },
];

export const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844, isMobile: true, hasTouch: true },
];
