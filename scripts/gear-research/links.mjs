#!/usr/bin/env node
/**
 * Checks which picks Wowhead (Forever) lists, so the Handbook can link them (see README.md here).
 *
 *   node scripts/gear-research/links.mjs            # picks from the last rank.mjs run + every item in leveling-gear.json
 *   node scripts/gear-research/links.mjs --all      # recheck items that were already found too
 *
 * An item in the database that Wowhead doesn't list yet is still a valid pick: the Handbook
 * shows the same tooltip (built from the database, tooltip.mjs) but doesn't link out. So every
 * run rechecks each item without a link, and items with one only when the check is over a
 * week old (Forever re-itemizes). Writes cache/wowhead.json: { "<id>": { found, quality, boe, checked } }.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const UA = { 'User-Agent': 'Mozilla/5.0 (rogue-handbook gear research)' };
const WEEK = 7 * 24 * 3600 * 1000;
const all = process.argv.includes('--all');
const FILE = here('./cache/wowhead.json');

const known = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : {};
const ids = new Set(existsSync(here('./cache/picks.json')) ? JSON.parse(readFileSync(here('./cache/picks.json'), 'utf8')).map((p) => p.itemId) : []);
const emitted = here('../../src/content/leveling-gear.json');
if (existsSync(emitted)) for (const list of Object.values(JSON.parse(readFileSync(emitted, 'utf8')).builds)) for (const e of list) ids.add(e.itemId);

const stale = (id) => {
  const k = known[id];
  return all || !k || !k.found || Date.now() - Date.parse(k.checked) > WEEK;
};
const todo = [...ids].filter(stale);
let found = 0;
let missing = 0;
let failed = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (todo.length) {
      const id = todo.shift();
      const res = await fetch(`https://nether.wowhead.com/forever/tooltip/item/${id}`, { headers: UA }).catch(() => null);
      if (!res || res.status >= 500) {
        failed++; // can't tell: keep what we knew
        continue;
      }
      const d = res.ok ? await res.json().catch(() => ({})) : {};
      const ok = !!d.tooltip && !d.error;
      known[id] = { found: ok, quality: ok ? d.quality : undefined, boe: ok ? /Binds when equipped/.test(d.tooltip) : undefined, checked: new Date().toISOString() };
      ok ? found++ : missing++;
    }
  }),
);
writeFileSync(FILE, JSON.stringify(known));
const unlinked = [...ids].filter((id) => known[id] && !known[id].found);
console.log(`Checked ${found + missing + failed} of ${ids.size} items on Wowhead: ${found} found, ${missing} not listed${failed ? `, ${failed} couldn't be checked (kept as they were)` : ''}.`);
console.log(`${unlinked.length} listed items have no Wowhead link yet${unlinked.length ? `: ${unlinked.slice(0, 30).join(', ')}${unlinked.length > 30 ? '…' : ''}` : ''}.`);
