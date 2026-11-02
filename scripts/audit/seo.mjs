#!/usr/bin/env node
/**
 * SEO audit of the production build (served by `vite preview`, AUDIT_URL):
 * title and description length, canonical, robots, Open Graph and Twitter cards, JSON-LD
 * validity, sitemap/robots.txt/manifest, the rendered heading outline, image alts, link text,
 * and Lighthouse's SEO category. Exit code 1 on any failure.
 *
 *   AUDIT_TOOLS=/tmp/audit-tools node scripts/audit/seo.mjs
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { URL_BASE, chromePath, launch, toolPath } from './lib.mjs';

const root = new URL('../../', import.meta.url).pathname;
let failed = false;
const ok = (m) => console.log(`✓ ${m}`);
const fail = (m) => {
  failed = true;
  console.log(`✗ ${m}`);
};
const warn = (m) => console.log(`! ${m}`);
const check = (c, good, bad) => (c ? ok(good) : fail(bad));

const html = readFileSync(join(root, 'dist/index.html'), 'utf8');
const meta = (attr, name) => html.match(new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`, 'i'))?.[1]?.replaceAll('&amp;', '&');
const title = html.match(/<title>([^<]*)<\/title>/)?.[1].replaceAll('&amp;', '&') ?? '';
const description = meta('name', 'description') ?? '';
const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1];
const siteUrl = canonical ?? 'https://wowrogue.gg/';

// Head
check(title.length >= 30 && title.length <= 65, `title is ${title.length} characters: "${title}"`, `title is ${title.length} characters (aim for 30–65): "${title}"`);
check(description.length >= 70 && description.length <= 160, `meta description is ${description.length} characters`, `meta description is ${description.length} characters (aim for 70–160)`);
check(!!canonical && canonical.startsWith('https://'), `canonical is ${canonical}`, 'missing or non-https canonical link');
check(!/noindex/i.test(meta('name', 'robots') ?? ''), `robots meta allows indexing (${meta('name', 'robots')})`, 'robots meta contains noindex');
check(/<html[^>]*lang="[a-z-]+"/i.test(html), 'html has a lang attribute', '<html> has no lang attribute');
check(/name="viewport"/.test(html), 'viewport meta is set', 'no viewport meta');
for (const p of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:image:alt']) check(!!meta('property', p), `${p} is set`, `${p} is missing`);
for (const n of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) check(!!meta('name', n), `${n} is set`, `${n} is missing`);
check(meta('property', 'og:url') === canonical, 'og:url matches the canonical', `og:url (${meta('property', 'og:url')}) differs from canonical (${canonical})`);

// Structured data
const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (!ld.length) warn('no JSON-LD structured data (optional: WebSite or Article schema)');
for (const raw of ld) {
  try {
    const j = JSON.parse(raw);
    const nodes = j['@graph'] ?? [j];
    ok(`JSON-LD parses (${nodes.map((n) => n['@type']).join(', ')})`);
    for (const n of nodes) if (n.url && n.url !== canonical) fail(`JSON-LD ${n['@type']} url ${n.url} differs from canonical ${canonical}`);
  } catch (e) {
    fail(`JSON-LD does not parse: ${e.message}`);
  }
}

// Files
const dist = (f) => existsSync(join(root, 'dist', f));
const robots = dist('robots.txt') ? readFileSync(join(root, 'dist/robots.txt'), 'utf8') : '';
check(/^Sitemap:\s*https:\/\/\S+/m.test(robots) && !/^Disallow:\s*\/\s*$/m.test(robots), 'robots.txt allows crawling and lists the sitemap', 'robots.txt is missing, blocks everything, or lacks a Sitemap line');
const sitemap = dist('sitemap.xml') ? readFileSync(join(root, 'dist/sitemap.xml'), 'utf8') : '';
check(sitemap.includes(`<loc>${siteUrl}</loc>`), 'sitemap.xml lists the canonical URL', `sitemap.xml does not list ${siteUrl}`);
const lastmod = sitemap.match(/<lastmod>([^<]+)</)?.[1];
if (!lastmod) warn('sitemap has no <lastmod> (optional; update it with each content change if added)');
check(dist('site.webmanifest') && dist('favicon.ico') && dist('og-image.png') && dist('apple-touch-icon.png'), 'manifest, favicon, apple-touch-icon and og-image exist', 'a manifest or icon file is missing from dist');

// Rendered page
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
const res = await page.goto(`${URL_BASE}/`, { waitUntil: 'networkidle' });
check(res.status() === 200, 'the page returns 200', `the page returned ${res.status()}`);
const dom = await page.evaluate(() => {
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({ level: +h.tagName[1], text: h.textContent.trim().slice(0, 50) }));
  const noAlt = [...document.querySelectorAll('img')].filter((i) => i.getAttribute('alt') === null).map((i) => i.currentSrc.split('/').pop());
  const emptyLinks = [...document.querySelectorAll('a')].filter((a) => !(a.textContent.trim() || a.getAttribute('aria-label') || a.querySelector('img[alt]:not([alt=""])'))).length;
  const badHref = [...document.querySelectorAll('a[href]')].filter((a) => a.getAttribute('href') === '#' || a.getAttribute('href') === '').map((a) => a.textContent.trim().slice(0, 30));
  return { hs, noAlt, emptyLinks, badHref, textLength: document.body.innerText.length, main: !!document.querySelector('main'), titleNow: document.title };
});
const h1s = dom.hs.filter((h) => h.level === 1);
check(h1s.length === 1, `exactly one h1: "${h1s[0]?.text}"`, `${h1s.length} h1 elements on the page`);
const skips = dom.hs.filter((h, i) => i > 0 && h.level > dom.hs[i - 1].level + 1).map((h) => `${h.text} (h${h.level})`);
check(!skips.length, `heading levels never skip (${dom.hs.length} headings)`, `heading level skips at: ${skips.slice(0, 5).join(', ')}`);
check(!dom.noAlt.length, 'every image has an alt attribute', `images without alt: ${dom.noAlt.join(', ')}`);
check(dom.emptyLinks === 0, 'every link has a name', `${dom.emptyLinks} links have no text or label`);
if (dom.badHref.length) warn(`links with href "#" (crawlers skip them): ${dom.badHref.join(', ')}`);
check(dom.main && dom.textLength > 2000, `rendered content is ${dom.textLength} characters in a <main>`, 'the page renders little or no text');
console.log(`  note: the page is client-rendered; the first HTML has only a <noscript> summary (see README > Performance, "Not done, on purpose").`);
await browser.close();

// Lighthouse SEO
const lighthouse = (await import(pathToFileURL(toolPath('lighthouse')).href)).default;
const port = 9334;
const chrome = spawn(chromePath(), ['--headless=new', `--remote-debugging-port=${port}`, '--no-sandbox', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));
const { lhr } = await lighthouse(`${URL_BASE}/`, { port, onlyCategories: ['seo', 'best-practices'], output: 'json', logLevel: 'error' });
chrome.kill();
for (const cat of ['seo', 'best-practices']) {
  const score = Math.round(lhr.categories[cat].score * 100);
  check(score >= 95, `Lighthouse ${cat}: ${score}`, `Lighthouse ${cat}: ${score} (< 95)`);
  for (const ref of lhr.categories[cat].auditRefs) {
    const a = lhr.audits[ref.id];
    if (a.id === 'errors-in-console' && a.score < 1 && /cloudflareinsights/.test(JSON.stringify(a.details ?? {}))) {
      console.log("   ! Console errors are Cloudflare's beacon being refused a CORS preflight on localhost: expected when previewing locally, not on wowrogue.gg");
      continue;
    }
    if (a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'notApplicable') console.log(`   ${a.score === 0 ? '✗' : '!'} ${a.title}${a.displayValue ? ` — ${a.displayValue}` : ''}`);
  }
}
process.exit(failed ? 1 : 0);
