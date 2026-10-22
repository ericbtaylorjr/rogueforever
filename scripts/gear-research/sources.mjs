#!/usr/bin/env node
/**
 * Step 3 of the leveling gear research (see README.md here): where each shortlisted
 * item comes from (boss and dungeon, quest, profession, vendor) and its faction.
 *
 *   node scripts/gear-research/sources.mjs             # every item in cache/shortlist.json
 *   node scripts/gear-research/sources.mjs 6504 2041   # specific ids
 *   node scripts/gear-research/sources.mjs --refresh   # refetch ones already looked up
 *
 * Only Wowhead's www XML feed (`/forever/item=<id>&xml`) carries sources, and CloudFront
 * blocks it after a burst (roughly 70–200 quick requests), so this goes one item at a
 * time with a pause between, and when blocked waits two minutes and carries on. It
 * saves as it goes, so stopping it and rerunning later loses nothing.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const CACHE = here('./cache/items.json');
/** Kept apart from items.json so a scan running at the same time can't overwrite it. */
const SOURCES = here('./cache/sources.json');
const SHORTLIST = here('./cache/shortlist.json');
const PAUSE_MS = 1500;
/** After a block: wait this long and try again, this many times, before giving up. */
const BLOCK_WAIT_MS = 120_000;
const BLOCK_RETRIES = 10;
const UA = { 'User-Agent': 'Mozilla/5.0 (rogue-handbook gear research)' };

const cache = JSON.parse(readFileSync(CACHE, 'utf8'));
const sources = existsSync(SOURCES) ? JSON.parse(readFileSync(SOURCES, 'utf8')) : {};
const args = process.argv.slice(2);
const refresh = args.includes('--refresh');
const named = args.filter((a) => /^\d+$/.test(a)).map(Number);
const ids = named.length ? named : existsSync(SHORTLIST) ? JSON.parse(readFileSync(SHORTLIST, 'utf8')) : [];
const todo = ids.filter((id) => cache.items[id] && (refresh || !sources[id]?.codes));

const block = (xml, tag) => xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))?.[1];
const save = () => writeFileSync(SOURCES, JSON.stringify(sources));

console.log(`Looking up sources for ${todo.length} items (${ids.length - todo.length} already known)…`);
let n = 0;
let blocks = 0;
for (const id of todo) {
  let xml;
  for (;;) {
    const res = await fetch(`https://www.wowhead.com/forever/item=${id}&xml`, { headers: UA }).catch(() => null);
    xml = res ? await res.text() : '';
    if (res && res.status !== 403 && xml.includes('<wowhead>')) break;
    save();
    if (++blocks > BLOCK_RETRIES) {
      console.log(`Still blocked after ${BLOCK_RETRIES} waits (${n} done). Saved; rerun later to continue.`);
      process.exit(2);
    }
    console.log(`  blocked after ${n}; waiting ${BLOCK_WAIT_MS / 60000} min…`);
    await new Promise((r) => setTimeout(r, BLOCK_WAIT_MS));
  }
  const body = block(xml, 'json');
  if (body) {
    const json = JSON.parse(`{${body}}`);
    // Raw, so rank.mjs (via zones.mjs) can change how sources read without refetching.
    sources[id] = {
      reqlevel: json.reqlevel, // tooltips omit it on some quest rewards
      side: json.side,
      codes: json.source ?? [],
      more: json.sourcemore ?? [],
      checked: new Date().toISOString().slice(0, 10),
    };
  }
  if (++n % 25 === 0) {
    save();
    console.log(`  ${n}/${todo.length}…`);
  }
  await new Promise((r) => setTimeout(r, PAUSE_MS));
}
save();
console.log(`Done: ${n} looked up.`);

// Quest rewards often require a much lower level than the quest itself (Wingblade: 10 vs a
// level 25 quest), so record each quest's level. The tooltip API is fine with quick reads.
const quests = Object.values(sources).filter((s) => s.codes?.[0] === 4 && s.more?.[0]?.ti && s.questLevel === undefined);
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (quests.length) {
      const s = quests.shift();
      const d = await fetch(`https://nether.wowhead.com/forever/tooltip/quest/${s.more[0].ti}`)
        .then((r) => r.json())
        .catch(() => ({}));
      s.questLevel = Number(d.tooltip?.match(/Level (\d+)/)?.[1]) || null;
    }
  }),
);
save();
