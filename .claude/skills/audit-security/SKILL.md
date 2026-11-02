---
name: audit-security
description: Audit the Rogue Handbook for security (dependencies, CSP, inline scripts, third-party hosts, dangerous patterns, CI pinning, secrets). Use when asked to audit security, after adding a dependency, third-party script, external host or analytics, or before a launch.
---

# Security audit

A static site on GitHub Pages: no backend, no user accounts. The risks are supply chain,
third-party scripts, XSS through content (Wowhead tooltip HTML), and CSP drift. Read
README > Security first, including "Limits of GitHub Pages" (no response headers, so no
`frame-ancestors`, HSTS or `X-Content-Type-Options`: say so, don't flag them as new).

## Run

    npm run build
    npm run audit:security            # no browser needed

It checks: `npm audit` (runtime and all), the CSP meta tag (no `unsafe-inline`/`unsafe-eval`
in `script-src`, `object-src 'none'`, base-uri, form-action), that every inline script is
pinned by SHA-256 hash, that every CSP origin is a known host, no inline handlers or
`javascript:` URLs, no source maps or dotfiles in `dist/`, `innerHTML` only for the sanitized
Wowhead tooltips, no `eval`/`new Function`/`document.write`, `rel="noreferrer"` on every
`target="_blank"`, GitHub Actions pinned to commit SHAs with read-only default permissions,
and no committed secrets.

A new CSP origin fails on purpose: add it to `known` in `scripts/audit/security.mjs` and to
README > Security only if it is intended, and update the privacy policy (`copy.ts` `privacy`).
Cloudflare's beacon can't have SRI (it changes); that warning is expected.

## By hand

- Wowhead sanitizer (`src/lib/wowhead.ts`): still an allowlist of tags and `class` only?
- Storage: keys are `rc:prefs`, `rc:theme`, `rc:consent`; URL params (`spec`, `build`) are
  validated against known ids. Any new stored value or param must be validated too.
- Analytics: GA only after consent, GPC honoured; Cloudflare beacon is cookieless. The privacy
  policy and its `updated` date must match what the code does.
- Service worker (`src/sw.js`): same-origin only, never caches cross-origin or POST.
- `npm outdated` / Dependabot PRs: major bumps need a build and the a11y audit.
- Dependency install scripts: new packages should not need `postinstall`.

## Record

Update README > Security with the date and what changed. Report anything that needs hosting
changes (headers) as a recommendation for when the site moves behind Cloudflare.
