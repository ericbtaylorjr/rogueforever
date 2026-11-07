#!/usr/bin/env node
/**
 * The few things the Forever database doesn't carry, looked up on Wowhead for just the
 * items that need them (see README.md here). rank.mjs writes cache/lookups-needed.json
 * (candidates that are strong enough to pick); this reads it and fills cache/lookups.json:
 *
 *  - items: the required level Wowhead lists for an item the database has no level for
 *    (mostly quest rewards), from the www XML feed.
 *  - quests: the quest's level, from the tooltip API, which shows it for some quests only.
 *    (Wowhead's quest pages don't expose the level to scripts, and "level needed to accept"
 *    isn't available anywhere scripts can reach, so the quest level is the closest signal.)
 *  - vendors: the reputation a vendor-sold item requires ("Requires Silverwing Sentinels - Honored"
 *    in its Wowhead tooltip), which the database doesn't record for vendor items. Battleground
 *    reputations are PvP gear (curation.json excludeReps); the rest are limited by maxRepLevel.
 *  - recipes: where a crafted pick's recipe item comes from, from the XML feed, so a recipe
 *    that only drops in content that isn't open yet can be ruled out.
 *
 *   node scripts/gear-research/lookups.mjs             # everything in lookups-needed.json that isn't cached
 *   node scripts/gear-research/lookups.mjs --refresh   # refetch those even if cached
 *
 * Results are cached for good (quest levels and recipe sources don't change). The www XML
 * feed is blocked by CloudFront after a burst, so it goes one request per 1.5 s and waits
 * out blocks by itself; it saves as it goes, so stopping and rerunning loses nothing.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const UA = { 'User-Agent': 'Mozilla/5.0 (rogue-handbook gear research)' };
const PAUSE_MS = 1500;
const BLOCK_WAIT_MS = 120_000;
const BLOCK_RETRIES = 10;
const refresh = process.argv.includes('--refresh');

export const LOOKUPS = here('./cache/lookups.json');
export const readLookups = () => (existsSync(LOOKUPS) ? JSON.parse(readFileSync(LOOKUPS, 'utf8')) : { items: {}, quests: {}, recipes: {}, vendors: {} });

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const needed = existsSync(here('./cache/lookups-needed.json')) ? JSON.parse(readFileSync(here('./cache/lookups-needed.json'), 'utf8')) : { items: [], quests: [], recipes: [], vendors: [] };
  needed.vendors ??= [];
  const lk = readLookups();
  lk.items ??= {};
  lk.quests ??= {};
  lk.recipes ??= {};
  lk.vendors ??= {};
  const save = () => writeFileSync(LOOKUPS, JSON.stringify(lk));
  const today = () => new Date().toISOString().slice(0, 10);
  const block = (xml, tag) => xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))?.[1];

  // Quest levels: the tooltip API tolerates quick reads.
  const quests = needed.quests.filter((q) => refresh || lk.quests[q] === undefined);
  console.log(`Quest levels to read: ${quests.length}`);
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (quests.length) {
        const q = quests.shift();
        const d = await fetch(`https://nether.wowhead.com/forever/tooltip/quest/${q}`, { headers: UA }).then((r) => r.json()).catch(() => null);
        if (!d) continue; // network hiccup: try again next run
        const text = (d.tooltip ?? '').replace(/<[^>]+>/g, ' ');
        lk.quests[q] = { level: Number(text.match(/Level (\d+)/)?.[1]) || null, checked: today() };
      }
    }),
  );
  save();

  // Reputation a vendor item needs, from its tooltip.
  const REP = ['Neutral', 'Friendly', 'Honored', 'Revered', 'Exalted'];
  const vendors = needed.vendors.filter((id) => refresh || lk.vendors[id] === undefined);
  console.log(`Vendor reputation requirements to read: ${vendors.length}`);
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (vendors.length) {
        const id = vendors.shift();
        const d = await fetch(`https://nether.wowhead.com/forever/tooltip/item/${id}`, { headers: UA }).then((r) => r.json()).catch(() => null);
        if (!d) continue;
        const text = (d.tooltip ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        const m = text.match(/Requires ((?:(?!Requires)[A-Za-z' ])+?) - (Neutral|Friendly|Honored|Revered|Exalted)/);
        lk.vendors[id] = m ? { faction: m[1].trim(), level: REP.indexOf(m[2]) + 4, standing: m[2] } : null;
      }
    }),
  );
  save();

  // Item levels and recipe sources: the www XML feed, politely.
  const xmlIds = [
    ...needed.items.filter((id) => refresh || !lk.items[id]).map((id) => ['items', id]),
    ...needed.recipes.filter((id) => refresh || !lk.recipes[id]).map((id) => ['recipes', id]),
  ];
  console.log(`Wowhead XML lookups: ${xmlIds.length} (${needed.items.length + needed.recipes.length - xmlIds.length} already known)`);
  let n = 0;
  let blocks = 0;
  for (const [kind, id] of xmlIds) {
    let xml;
    for (;;) {
      const res = await fetch(`https://www.wowhead.com/forever/item=${id}&xml`, { headers: UA }).catch(() => null);
      xml = res ? await res.text() : '';
      if (res && res.status !== 403 && /<wowhead/.test(xml)) break;
      save();
      if (++blocks > BLOCK_RETRIES) {
        console.log(`Still blocked after ${BLOCK_RETRIES} waits (${n} done). Saved; rerun later to continue.`);
        process.exit(2);
      }
      console.log(`  blocked after ${n}; waiting ${BLOCK_WAIT_MS / 60000} min…`);
      await new Promise((r) => setTimeout(r, BLOCK_WAIT_MS));
    }
    const body = block(xml, 'json');
    const json = body ? JSON.parse(`{${body}}`) : null;
    if (kind === 'items') lk.items[id] = { reqlevel: json?.reqlevel ?? null, checked: today() };
    else lk.recipes[id] = { codes: json?.source ?? [], more: json?.sourcemore ?? [], checked: today() };
    if (++n % 25 === 0) {
      save();
      console.log(`  ${n}/${xmlIds.length}…`);
    }
    await new Promise((r) => setTimeout(r, PAUSE_MS));
  }
  save();
  console.log(`Done: ${n} XML lookups, cache/lookups.json now has ${Object.keys(lk.items).length} item levels, ${Object.keys(lk.quests).length} quests, ${Object.keys(lk.recipes).length} recipes.`);
}
