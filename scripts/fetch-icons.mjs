#!/usr/bin/env node
/**
 * Resolve every item/spell the page names to its Wowhead (Forever) id + icon, download
 * the icons into public/icons/, and write src/content/icons.json.
 *
 *   npm run icons
 *   npm run icons -- --fresh   # re-resolve everything instead of keeping known ids
 *
 * Icons are self-hosted so the page makes no third-party requests at runtime (see the
 * CSP in vite.config.ts). Re-run after adding consumables, poisons, buffs or gear.
 * Names Wowhead can't resolve are listed at the end and simply render without an icon.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const UA = { 'User-Agent': 'Mozilla/5.0 (rogue-handbook icon fetch)' };
const ITEM = 3;
const SPELL = 6;

const content = JSON.parse(readFileSync(root('src/content/content.json'), 'utf8'));
// Item ids live in gear.ts (shared leveling lists) and in each build's own gear lists.
const gearSrc = [
  'src/content/gear.ts',
  ...readdirSync(root('src/content/builds')).map((f) => `src/content/builds/${f}`),
]
  .map((p) => readFileSync(root(p), 'utf8'))
  .join('\n');
const manifestPath = root('src/content/icons.json');
const fresh = process.argv.includes('--fresh');
const prev = !fresh && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};

/** Display names carry faction tags like "[A]"; Wowhead doesn't. */
const clean = (n) => n.replace(/\s*\[[AH]\]\s*$/, '').replace(/[’‘]/g, "'").trim();

const wanted = [
  ...content.consumables.map((c) => ({ name: c.n, type: ITEM })),
  ...content.poisons.map((p) => ({ name: p.name, type: ITEM })),
  ...content.buffGroups.flatMap((g) => g.items.map((i) => ({ name: i.n, type: SPELL }))),
  // Named in prose sections (copy.ts), not in content.json.
  ...['Expose Armor', 'Sunder Armor'].map((name) => ({ name, type: SPELL })),
];
// Generated leveling lists (scripts/gear-research) live in JSON.
const levelingJson = JSON.parse(readFileSync(root('src/content/leveling-gear.json'), 'utf8'));
const levelingItems = ['shared', 'slow', 'daggers'].flatMap((k) => levelingJson[k] ?? []);
const gearIds = [
  ...new Set([...[...gearSrc.matchAll(/itemId: (\d+)/g)].map((m) => Number(m[1])), ...levelingItems.map((i) => i.itemId)]),
];

async function search(name, type) {
  const url = `https://www.wowhead.com/forever/search/suggestions-template?q=${encodeURIComponent(clean(name))}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) return null;
  const { results = [] } = await res.json();
  const exact = (r) => r.name.toLowerCase() === clean(name).toLowerCase();
  const hit = results.find((r) => r.type === type && exact(r)) ?? results.find((r) => exact(r));
  return hit ? { id: hit.id, icon: hit.icon, kind: hit.type === SPELL ? 'spell' : 'item' } : null;
}

async function tooltip(id) {
  const res = await fetch(`https://nether.wowhead.com/forever/tooltip/item/${id}`, { headers: UA });
  if (!res.ok) return null;
  const d = await res.json();
  return d.icon && !d.error ? { id, icon: d.icon, kind: 'item' } : null;
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

// Item links are coloured from the `quality` written in gear.ts; Wowhead's tooltip colours the
// name from its own data. Check they agree so a link never shows one colour and its tooltip another.
const QUALITIES = ['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
const authored = [
  ...[...gearSrc.matchAll(/itemId: (\d+), name: (['"])(.*?)\2, quality: '(\w+)'/g)],
  ...levelingItems.map((i) => [null, String(i.itemId), null, i.name, i.quality]),
];
const wrongQuality = [];
for (const [, id, , name, quality] of new Map(authored.map((m) => [m[1], m])).values()) {
  const res = await fetch(`https://nether.wowhead.com/forever/tooltip/item/${id}`, { headers: UA });
  const d = res.ok ? await res.json() : {};
  const actual = QUALITIES[d.quality];
  if (actual && actual !== quality) wrongQuality.push(`${name} (${id}) is ${actual}, not ${quality}`);
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Resolved ${Object.keys(manifest).length} names; ${new Set(Object.values(manifest).map((m) => m.icon)).size} icons in public/icons/.`);
if (missed.length) console.log(`Not found (render without an icon): ${missed.join(', ')}`);
if (wrongQuality.length) {
  console.log(`Quality doesn't match Wowhead Forever, fix it in gear.ts, builds/ or by rerunning scripts/gear-research:\n  ${wrongQuality.join('\n  ')}`);
  process.exitCode = 1;
}
