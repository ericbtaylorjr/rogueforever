import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { config } from './src/config.ts';

/**
 * The pre-paint theme script (src/theme-init.js) is inlined into index.html so it doesn't
 * cost a render-blocking request, and allowed by its exact hash: any other inline script
 * is still refused. The hash is computed from the file at build time, so edits can't drift.
 */
const themeInit = readFileSync(new URL('./src/theme-init.js', import.meta.url), 'utf8').trim();
const themeInitHash = `'sha256-${createHash('sha256').update(themeInit).digest('base64')}'`;

const inlineThemeInit = (): Plugin => ({
  name: 'inline-theme-init',
  transformIndexHtml: (html) => {
    const tag = '<script src="/theme-init.js"></script>';
    if (!html.includes(tag)) throw new Error('index.html no longer loads /theme-init.js');
    return html.replace(tag, () => `<script>${themeInit}</script>`);
  },
});

/**
 * Preload the fonts the first screen paints with (hero title + intro text), so the largest
 * paint doesn't wait for the stylesheet to discover them. Filenames are hashed, hence a plugin.
 */
const PRELOAD_FONTS = ['archivo-var-latin', 'source-sans-var-latin'];

const preloadFonts = (): Plugin => ({
  name: 'preload-fonts',
  apply: 'build',
  transformIndexHtml: (_html, ctx) =>
    Object.keys(ctx.bundle ?? {})
      .filter((file) => file.endsWith('.woff2') && PRELOAD_FONTS.some((f) => file.includes(`/${f}-`)))
      .map((file) => ({
        tag: 'link',
        attrs: { rel: 'preload', href: `/${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
        injectTo: 'head' as const,
      })),
});

/**
 * GitHub Pages can't set response headers, so the CSP ships as a <meta> tag.
 * Everything is first-party (fonts included), apart from Wowhead's tooltip API, which
 * live item and spell tooltips fetch JSON from (src/lib/wowhead.ts). `style-src` needs 'unsafe-inline'
 * because the design sets many inline style attributes; `script-src` does not
 * (the one inline script is pinned by hash, above). Google Analytics hosts are added
 * only when `config.analyticsId` is set, Cloudflare's only when `config.cfBeaconToken` is.
 * Build-only: the dev server injects inline scripts + a websocket for HMR.
 * `frame-ancestors` can't be set from a meta tag — see README > Security.
 */
/** Google Analytics hosts, allowed only when an analytics ID is set (src/lib/analytics.ts). */
const ga = config.analyticsId
  ? {
      script: ' https://www.googletagmanager.com',
      beacon: ' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com',
    }
  : { script: '', beacon: '' };

/** Cloudflare Web Analytics hosts, allowed only when a beacon token is set (see cfBeacon below). */
const cf = config.cfBeaconToken
  ? { script: ' https://static.cloudflareinsights.com', beacon: ' https://cloudflareinsights.com' }
  : { script: '', beacon: '' };

const csp = [
  "default-src 'self'",
  `script-src 'self' ${themeInitHash}${ga.script}${cf.script}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data:${ga.beacon}`,
  "font-src 'self'",
  `connect-src 'self' https://nether.wowhead.com${ga.beacon}${cf.beacon}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "manifest-src 'self'",
].join('; ');

const contentSecurityPolicy = (): Plugin => ({
  name: 'content-security-policy',
  apply: 'build',
  transformIndexHtml: () => [
    {
      tag: 'meta',
      attrs: { 'http-equiv': 'Content-Security-Policy', content: csp },
      injectTo: 'head-prepend',
    },
  ],
});

/**
 * Cloudflare Web Analytics: cookieless, aggregate visit counts for everyone (it stores nothing
 * on the device, so it sits outside the consent banner, unlike GA). Build-only, so local dev
 * isn't counted. An external script with a data attribute, not inline, so the CSP holds.
 * `spa: false`: the page rewrites its URL for ?spec= and #section, and those aren't new visits.
 */
const cfBeacon = (): Plugin => ({
  name: 'cloudflare-web-analytics',
  apply: 'build',
  transformIndexHtml: () =>
    config.cfBeaconToken
      ? [
          {
            tag: 'script',
            attrs: {
              // Cloudflare's current snippet loads it as a module (deferred by default).
              type: 'module',
              // Analytics shouldn't share the first-load bandwidth the app's own JS needs.
              fetchpriority: 'low',
              src: 'https://static.cloudflareinsights.com/beacon.min.js',
              'data-cf-beacon': JSON.stringify({ token: config.cfBeaconToken, spa: false }),
            },
            injectTo: 'body' as const,
          },
        ]
      : [],
});

/**
 * Search engine data, built from content.json so it can't drift from the page:
 * - JSON-LD (schema.org) in <head>: the site, the guide (author, published and updated
 *   dates from the changelog) and the FAQ. A data block, not a script, so the CSP allows it.
 * - dist/sitemap.xml with <lastmod> from the newest changelog entry, replacing public/'s copy.
 */
const SITE = 'https://wowrogue.gg/';

const seo = (): Plugin => {
  const content = JSON.parse(readFileSync(new URL('./src/content/content.json', import.meta.url), 'utf8'));
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  const meta = (attr: string) => html.match(new RegExp(`${attr}"\\s+content="([^"]+)"`))?.[1]?.replace(/&amp;/g, '&');
  // Changelog dates read "Oct 22nd, 2026"; newest first.
  const isoDate = (d: string) => new Date(`${d.replace(/(\d+)(st|nd|rd|th)/, '$1')} UTC`).toISOString().slice(0, 10);
  const dates = (content.changelog as { date: string }[]).map((c) => isoDate(c.date)).sort();
  const author = { '@type': 'Person', name: 'The Comfy Wizard' };

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}#website`,
        url: SITE,
        name: 'Rogue Handbook',
        alternateName: 'wowrogue.gg',
        inLanguage: 'en',
      },
      {
        '@type': 'Article',
        '@id': `${SITE}#guide`,
        headline: meta('property="og:title'),
        description: meta('name="description'),
        image: `${SITE}og-image.png`,
        url: SITE,
        mainEntityOfPage: SITE,
        isPartOf: { '@id': `${SITE}#website` },
        inLanguage: 'en',
        author,
        publisher: author,
        datePublished: dates[0],
        dateModified: dates.at(-1),
        about: { '@type': 'VideoGame', name: 'World of Warcraft' },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE}#faq`,
        isPartOf: { '@id': `${SITE}#website` },
        mainEntity: (content.faqs as { q: string; a: string }[]).map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  let outDir = '';
  return {
    name: 'seo',
    apply: 'build',
    configResolved: (c) => {
      outDir = resolve(c.root, c.build.outDir);
    },
    transformIndexHtml: () => [
      {
        tag: 'script',
        attrs: { type: 'application/ld+json' },
        // `<` escaped so no answer text can close the tag early.
        children: JSON.stringify(graph).replace(/</g, '\\u003c'),
        injectTo: 'head',
      },
    ],
    closeBundle: () => {
      writeFileSync(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}</loc>
    <lastmod>${dates.at(-1)}</lastmod>
  </url>
</urlset>
`,
      );
    },
  };
};

/**
 * Writes dist/sw.js (src/sw.js plus this build's file lists), which src/main.tsx registers.
 * `assets` are the hashed build files, `shell` the ones index.html starts with, `files`
 * everything else the site serves that a page asks for (art, icons, favicons). The lists
 * change with each deploy, so each deploy's worker replaces the last and prunes its cache.
 */
const SW_SKIP = /^(index\.html|sw\.js|CNAME|robots\.txt|sitemap\.xml)$/;

const serviceWorker = (): Plugin => {
  let outDir = '';
  return {
    name: 'service-worker',
    apply: 'build',
    configResolved: (c) => {
      outDir = resolve(c.root, c.build.outDir);
    },
    closeBundle: () => {
      const all = readdirSync(outDir, { recursive: true, withFileTypes: true })
        .filter((f) => f.isFile())
        .map((f) => `/${relative(outDir, join(f.parentPath, f.name)).split('\\').join('/')}`);
      const html = readFileSync(join(outDir, 'index.html'), 'utf8');
      const build = {
        shell: [...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]))],
        assets: all.filter((f) => f.startsWith('/assets/')),
        files: all.filter((f) => !f.startsWith('/assets/') && !SW_SKIP.test(f.slice(1))),
      };
      const src = readFileSync(new URL('./src/sw.js', import.meta.url), 'utf8');
      writeFileSync(join(outDir, 'sw.js'), `const BUILD = ${JSON.stringify(build)};\n${src}`);
    },
  };
};

// Served from the wowrogue.gg custom domain root, so base stays '/'.
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    inlineThemeInit(),
    preloadFonts(),
    contentSecurityPolicy(),
    cfBeacon(),
    seo(),
    serviceWorker(),
  ],
});
