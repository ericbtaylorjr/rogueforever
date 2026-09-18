import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * GitHub Pages can't set response headers, so the CSP ships as a <meta> tag.
 * Everything is first-party (fonts included). `style-src` needs 'unsafe-inline'
 * because the design sets many inline style attributes; `script-src` does not.
 * Build-only: the dev server injects inline scripts + a websocket for HMR.
 * `frame-ancestors` can't be set from a meta tag — see README > Security.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self'",
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
  plugins: [react(), tailwindcss(), contentSecurityPolicy()],
});
