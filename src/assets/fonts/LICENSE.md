# Font licenses

Archivo (Omnibus-Type), Literata (TypeTogether), Source Sans 3 (Adobe) and IBM Plex Mono
(IBM Corp.) are licensed under the
SIL Open Font License 1.1 — https://openfontlicense.org. They are the Latin subset, WOFF2, as
served by Google Fonts (which declare no Reserved Font Names). Source Sans 3 and IBM Plex Mono are
unmodified. Archivo and Literata are instanced to the axis ranges the site uses, every glyph kept,
to cut their download (HarfBuzz hb-subset, via the `subset-font` npm package):

- Archivo: weight pinned to 900, width limited to 68–80%.
- Literata: weight limited to 400–700, optical size to 12–40.

To use a weight or width outside those ranges, start again from the Google Fonts files.
