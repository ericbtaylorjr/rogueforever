#!/usr/bin/env node
/**
 * Step 1 of the leveling gear research (see README.md here): pull every item a Rogue
 * can equip out of Wowhead's Forever database into a local cache.
 *
 *   node scripts/gear-research/scan.mjs                 # ids 1–25000 (the original game)
 *   node scripts/gear-research/scan.mjs 200000 300000   # any other range
 *   node scripts/gear-research/scan.mjs --missing       # re-check only ids that were "not found" last time
 *   node scripts/gear-research/scan.mjs --recheck "armor type"   # re-check ids skipped for a reason (after a parse.mjs fix)
 *
 * Reads Wowhead's tooltip API (nether.wowhead.com, the same JSON the site's tooltips
 * use), which tolerates bulk reads. The www XML feed has richer data but CloudFront
 * blocks bursts, so sources.mjs only asks it about the shortlist, slowly.
 *
 * Encrypted (not yet datamined) items answer "not found" until Wowhead decrypts them,
 * which is what `--missing` is for: run it after launch patches to pick up new items.
 *
 * Output: cache/items.json (gitignored). Usable items are kept parsed (parse.mjs);
 * everything else is kept as a reason, so reruns know what they've already seen.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseTooltip, rejectReason } from './parse.mjs';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const CACHE = here('./cache/items.json');
const CONCURRENCY = 6;

const args = process.argv.slice(2);
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : { items: {}, skipped: {}, missing: [] };

const onlyMissing = args.includes('--missing');
const recheck = args.includes('--recheck') ? args[args.indexOf('--recheck') + 1] : undefined;
let ids;
if (onlyMissing) {
  ids = cache.missing;
} else if (recheck) {
  ids = Object.entries(cache.skipped).filter(([, why]) => why === recheck).map(([id]) => Number(id));
} else {
  const [from = 1, to = 25000] = args.map(Number);
  ids = Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/** The tooltip JSON, `null` for an item Wowhead doesn't have, or `undefined` after repeated failures. */
async function fetchTip(id) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(`https://nether.wowhead.com/forever/tooltip/item/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      return d.error ? null : d;
    } catch {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
  return undefined;
}

const missing = new Set(cache.missing);
let done = 0;
let found = 0;
let added = 0;
let failed = 0;

async function scanOne(id) {
  const tip = await fetchTip(id);
  if (++done % 2000 === 0) console.log(`  ${done}/${ids.length}…`);
  if (tip === undefined) {
    failed++;
    return; // network trouble: leave whatever the cache had
  }
  if (tip === null) {
    missing.add(id);
    return;
  }
  missing.delete(id);
  found++;
  const item = { id, ...parseTooltip(tip), seen: new Date().toISOString().slice(0, 10) };
  const reason = rejectReason(item);
  if (reason) {
    cache.skipped[id] = reason;
    delete cache.items[id];
    return;
  }
  delete cache.skipped[id];
  if (!cache.items[id]) added++;
  cache.items[id] = item; // source and faction live in cache/sources.json (sources.mjs)
}

console.log(`Scanning ${ids.length} ids…`);
const queue = [...ids];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await scanOne(queue.shift());
  }),
);

cache.missing = [...missing].sort((a, b) => a - b);
cache.scannedAt = new Date().toISOString();
mkdirSync(here('./cache'), { recursive: true });
writeFileSync(CACHE, JSON.stringify(cache));
console.log(
  `Found ${found} items, ${added} newly Rogue-usable${failed ? `, ${failed} failed (rerun to retry)` : ''}. ` +
    `Cache: ${Object.keys(cache.items).length} usable, ${cache.missing.length} not found.`,
);
