import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

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
 * Everything is first-party (fonts included). `style-src` needs 'unsafe-inline'
 * because the design sets many inline style attributes; `script-src` does not
 * (the one inline script is pinned by hash, above).
 * Build-only: the dev server injects inline scripts + a websocket for HMR.
 * `frame-ancestors` can't be set from a meta tag — see README > Security.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' ${themeInitHash}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
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

// Served from the wowrogue.gg custom domain root, so base stays '/'.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), inlineThemeInit(), preloadFonts(), contentSecurityPolicy()],
});
