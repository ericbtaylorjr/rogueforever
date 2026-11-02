#!/usr/bin/env node
/**
 * Security audit of the source and the production build (run `npm run build` first):
 * dependencies (npm audit), the CSP in dist/index.html, inline script hashes, third-party
 * origins, dangerous patterns in src/, link hygiene, CI pinning, committed secrets and
 * source maps. Exit code 1 on any failure. Needs no browser, so no AUDIT_TOOLS.
 *
 *   node scripts/audit/security.mjs
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../../', import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), 'utf8');
let failed = false;
const ok = (msg) => console.log(`✓ ${msg}`);
const fail = (msg) => {
  failed = true;
  console.log(`✗ ${msg}`);
};
const warn = (msg) => console.log(`! ${msg}`);
const check = (cond, good, bad) => (cond ? ok(good) : fail(bad));

const walk = (dir, out = []) => {
  for (const name of readdirSync(join(root, dir))) {
    const rel = join(dir, name);
    if (name === 'node_modules' || name === '.git' || name === 'dist') continue;
    if (statSync(join(root, rel)).isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
};
const src = walk('src').filter((f) => /\.(tsx?|js|css)$/.test(f));

// 1. Dependencies
for (const scope of [['--omit=dev', 'runtime'], [[], 'all']]) {
  try {
    const out = execFileSync('npm', ['audit', '--json', ...[scope[0]].flat()], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const v = JSON.parse(out).metadata.vulnerabilities;
    check(v.total === 0, `npm audit (${scope[1]} dependencies): no known vulnerabilities`, `npm audit (${scope[1]}): ${JSON.stringify(v)}`);
  } catch (e) {
    try {
      const v = JSON.parse(e.stdout).metadata.vulnerabilities;
      fail(`npm audit (${scope[1]}): ${JSON.stringify(v)}`);
    } catch {
      warn(`npm audit (${scope[1]}) could not run (offline?)`);
    }
  }
}

// 2. CSP and the built page
if (!existsSync(join(root, 'dist/index.html'))) {
  fail('dist/index.html is missing: run `npm run build` first');
} else {
  const html = read('dist/index.html');
  const csp = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)?.[1]?.replaceAll('&#39;', "'").replaceAll('&amp;', '&');
  check(!!csp, 'CSP meta tag is in the build', 'no Content-Security-Policy meta tag in dist/index.html');
  if (csp) {
    const dirs = Object.fromEntries(csp.split(';').map((d) => d.trim().split(/\s+/)).map(([k, ...v]) => [k, v]));
    const script = dirs['script-src'] ?? [];
    check(!script.includes("'unsafe-inline'") && !script.includes("'unsafe-eval'"), "script-src has no 'unsafe-inline' or 'unsafe-eval'", "script-src allows 'unsafe-inline' or 'unsafe-eval'");
    for (const d of ['default-src', 'object-src', 'base-uri', 'form-action']) check(!!dirs[d], `${d} is set`, `${d} is missing from the CSP`);
    check(dirs['object-src']?.includes("'none'"), "object-src is 'none'", "object-src should be 'none'");
    // Every inline script must be pinned by hash.
    // (JSON-LD blocks are data, not script, so the CSP doesn't apply to them.)
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    for (const body of inline) {
      const hash = `'sha256-${createHash('sha256').update(body).digest('base64')}'`;
      check(script.includes(hash), 'inline script is allowed by its SHA-256 hash', `inline script hash ${hash} is not in script-src`);
    }
    // Third-party origins: every one must be a known, documented host.
    const known = ['https://nether.wowhead.com', 'https://static.cloudflareinsights.com', 'https://cloudflareinsights.com', 'https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com'];
    const origins = [...new Set(Object.values(dirs).flat().filter((v) => v.startsWith('https://')))];
    for (const o of origins) (known.includes(o) ? ok : fail)(`CSP origin ${o}${known.includes(o) ? ' is a known host' : ' is NEW: add it to this script and the README only if it is intended'}`);
  }
  check(!/\son[a-z]+\s*=\s*["']/i.test(html) && !/javascript:/i.test(html), 'no inline event handlers or javascript: URLs in the page', 'inline handler or javascript: URL in dist/index.html');
  const external = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]).filter((u) => !u.includes('wowrogue.gg'));
  for (const u of external) {
    const tag = html.match(new RegExp(`<[^>]+${u.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}[^>]*>`))?.[0] ?? '';
    if (/<script/.test(tag) && !/integrity=/.test(tag)) warn(`external script without SRI: ${u} (expected only for Cloudflare's beacon, which can't be pinned)`);
  }
  const maps = walk('dist').filter((f) => f.endsWith('.map'));
  check(!maps.length, 'no source maps are published', `source maps in dist: ${maps.join(', ')}`);
  const leaks = walk('dist').filter((f) => /(^|\/)\.(env|git)/.test(f) || /\.(pem|key)$/.test(f));
  check(!leaks.length, 'no dotfiles or keys in dist', `sensitive files in dist: ${leaks.join(', ')}`);
}

// 3. Dangerous patterns in the source
const grep = (re) => src.flatMap((f) => read(f).split('\n').map((l, i) => ({ f, i: i + 1, l })).filter(({ l }) => re.test(l)));
const html = grep(/dangerouslySetInnerHTML|\.innerHTML\s*=/);
check(html.every((h) => h.f.endsWith('Tooltip.tsx') || h.f.endsWith('WowheadText.tsx') || h.f.includes('wowhead')), 'innerHTML is used only for sanitized Wowhead tooltips', `unexpected innerHTML: ${html.map((h) => `${h.f}:${h.i}`).join(', ')}`);
const evalUse = grep(/\beval\(|new Function\(|document\.write\(/);
check(!evalUse.length, 'no eval, new Function or document.write in src', `dynamic code: ${evalUse.map((h) => `${h.f}:${h.i}`).join(', ')}`);
const links = src.filter((f) => f.endsWith('.tsx')).flatMap((f) => [...read(f).matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/g)].filter((m) => !/rel=["'][^"']*noreferrer/.test(m[0]) && !/rel=\{/.test(m[0])).map((m) => `${f}: ${m[0].slice(0, 70)}`));
check(!links.length, 'every target="_blank" link has rel="noreferrer"', `links missing rel: ${links.join(' | ')}`);
const keys = [...new Set(grep(/localStorage\.(get|set|remove)Item/).flatMap((h) => [...h.l.matchAll(/['"`](rc:[a-z-]+)['"`]/g)].map((m) => m[1])))];
console.log(`  localStorage keys in use: ${keys.join(', ') || '(set through constants)'}`);

// 4. CI
const wf = read('.github/workflows/deploy.yml');
const unpinned = [...wf.matchAll(/uses:\s*([^\s@]+)@([^\s#]+)/g)].filter((m) => !/^[0-9a-f]{40}$/.test(m[2]));
check(!unpinned.length, 'every GitHub Action is pinned to a commit SHA', `unpinned actions: ${unpinned.map((m) => m[0]).join(', ')}`);
check(/^permissions:\s*\n\s+contents:\s*read/m.test(wf), 'workflow defaults to read-only permissions', 'workflow lacks top-level `permissions: contents: read`');

// 5. Committed secrets
const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter((f) => f && !/\.(png|jpe?g|webp|woff2?|ico|jpg)$/.test(f) && f !== 'package-lock.json');
const secretRe = /(AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|ghp_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{10,}|sk-[A-Za-z0-9]{32,}|AIza[0-9A-Za-z_-]{35})/;
const secrets = files.filter((f) => existsSync(join(root, f)) && secretRe.test(read(f)));
check(!secrets.length, 'no secrets or private keys in tracked files', `possible secrets in: ${secrets.join(', ')}`);
check(!files.some((f) => /(^|\/)\.env/.test(f)), 'no .env files are tracked', '.env file is tracked');

process.exit(failed ? 1 : 0);
