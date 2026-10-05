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
  plugins: [react(), tailwindcss(), inlineThemeInit(), contentSecurityPolicy()],
});
