#!/usr/bin/env node
/**
 * Resolve every item/spell the page names to its Wowhead (Classic) id + icon, download
 * the icons into public/icons/, and write src/content/icons.json.
 *
 *   npm run icons
 *
 * Icons are self-hosted so the page makes no third-party requests at runtime (see the
 * CSP in vite.config.ts). Re-run after adding consumables, poisons, buffs or gear.
 * Names Wowhead can't resolve are listed at the end and simply render without an icon.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const UA = { 'User-Agent': 'Mozilla/5.0 (rogue-handbook icon fetch)' };
const ITEM = 3;
const SPELL = 6;

const content = JSON.parse(readFileSync(root('src/content/content.json'), 'utf8'));
const gearSrc = readFileSync(root('src/content/gear.ts'), 'utf8');
const manifestPath = root('src/content/icons.json');
const prev = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};

/** Display names carry faction tags like "[A]"; Wowhead doesn't. */
const clean = (n) => n.replace(/\s*\[[AH]\]\s*$/, '').replace(/[’‘]/g, "'").trim();

const wanted = [
  ...content.consumables.map((c) => ({ name: c.n, type: ITEM })),
  ...content.poisons.map((p) => ({ name: p.name, type: ITEM })),
  ...content.buffGroups.flatMap((g) => g.items.map((i) => ({ name: i.n, type: SPELL }))),
  // Named in prose sections (copy.ts), not in content.json.
  ...['Expose Armor', 'Sunder Armor'].map((name) => ({ name, type: SPELL })),
];
const gearIds = [...gearSrc.matchAll(/itemId: (\d+)/g)].map((m) => Number(m[1]));

async function search(name, type) {
  const url = `https://www.wowhead.com/classic/search/suggestions-template?q=${encodeURIComponent(clean(name))}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) return null;
  const { results = [] } = await res.json();
  const exact = (r) => r.name.toLowerCase() === clean(name).toLowerCase();
  const hit = results.find((r) => r.type === type && exact(r)) ?? results.find((r) => exact(r));
  return hit ? { id: hit.id, icon: hit.icon, kind: hit.type === SPELL ? 'spell' : 'item' } : null;
}

async function tooltip(id) {
  const res = await fetch(`https://nether.wowhead.com/tooltip/item/${id}?dataEnv=4&locale=0`, { headers: UA });
  if (!res.ok) return null;
  const d = await res.json();
  return d.icon ? { id, icon: d.icon, kind: 'item' } : null;
}

async function download(icon) {
  const file = root(`public/icons/${icon}.jpg`);
  if (existsSync(file)) return;
  const res = await fetch(`https://wow.zamimg.com/images/wow/icons/medium/${icon}.jpg`, { headers: UA });
  if (!res.ok) throw new Error(`icon ${icon}: HTTP ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

mkdirSync(root('public/icons'), { recursive: true });
const manifest = {};
const missed = [];

for (const w of wanted) {
  const hit = prev[w.name] ?? (await search(w.name, w.type));
  if (hit) manifest[w.name] = hit;
  else missed.push(w.name);
}
for (const id of gearIds) {
  const key = `item:${id}`;
  const hit = prev[key] ?? (await tooltip(id));
  if (hit) manifest[key] = hit;
  else missed.push(key);
}
for (const icon of new Set(Object.values(manifest).map((m) => m.icon))) await download(icon);

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Resolved ${Object.keys(manifest).length} names; ${new Set(Object.values(manifest).map((m) => m.icon)).size} icons in public/icons/.`);
if (missed.length) console.log(`Not found (render without an icon): ${missed.join(', ')}`);
