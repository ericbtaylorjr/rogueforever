---
name: audit-seo
description: Audit the Rogue Handbook's search engine optimization (meta tags, canonical, Open Graph, JSON-LD, sitemap, robots, headings, link text, Lighthouse SEO). Use when asked to audit or improve SEO, or after changing the title, description, headings or content structure.
---

# SEO audit

One canonical URL (`https://wowrogue.gg/`); everything else is a query (`?spec=&build=`) or a
hash on the same page. The page is client-rendered, with a `<noscript>` summary; prerendering
was left out on purpose (README > Performance), so don't recommend it again without new
information (for example, Search Console reporting indexing problems).

## Run

    npm run build && npx vite preview --port 4173 --strictPort &
    npm run audit:seo                 # needs AUDIT_TOOLS, see audit-accessibility

It checks: title 30–65 chars, meta description 70–160, canonical (https), robots meta, `lang`,
viewport, Open Graph and Twitter card tags (and `og:url` = canonical), JSON-LD parses and its
URLs match the canonical, `robots.txt` (allows crawling, lists the sitemap), `sitemap.xml`
lists the canonical, manifest and icons exist, then in the rendered page: exactly one `h1`,
heading levels never skip, every image has `alt`, every link has a name, enough text in
`<main>`; plus Lighthouse SEO and Best Practices (≥ 95). A console error from Cloudflare's
beacon on localhost is expected.

## By hand

- Keep title, `og:title`, `twitter:title` and the JSON-LD headline identical; same for the
  description. They are in `index.html`; the JSON-LD `dateModified` should track the changelog.
- New content that should rank (builds, specs, races) belongs in headings and visible text,
  not only in images or tooltips.
- `og-image.png` is 1200×630 with alt text; check the preview in Discord/X after changing it.
- Search Console and Bing Webmaster: submit the sitemap, read Coverage, Core Web Vitals and
  Queries; if the user shares them, treat them as the field data.
- Don't add `noindex`, hash-only routes for content, or duplicate URLs without a canonical.

## Record

Add the date and score to README (SEO has no section yet: add "SEO" next to Performance).
