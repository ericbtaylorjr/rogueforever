#!/usr/bin/env node
/**
 * Rogue talent trees from Wowhead's Forever talent calculator, for the Talents section's
 * tree preview. Writes src/content/talent-trees.json and downloads the talent icons,
 * tree backgrounds and tree icons into public/talents/.
 *
 *   npm run talents            # refresh the trees, then check every build's calculator link
 *   npm run talents -- --check # just check the links against the current trees
 *
 * Builds point at a calculator link (`link` in src/content/builds/*.ts); the preview
 * decodes it with src/lib/talentCalc.ts. Re-run after Wowhead updates Forever's talents
 * (new talents, moved talents, rank changes): a link whose ranks no longer fit is listed.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const UA = { 'User-Agent': 'Mozilla/5.0 (rogue-handbook talent fetch)' };
const DATA_URL = 'https://nether.wowhead.com/forever/data/talents-classic';
const IMG = 'https://wow.zamimg.com/images/wow';
const outPath = root('src/content/talent-trees.json');

/** The calculator's tab order, which is also the order of a link's `-`-separated trees. */
const TREES = [
  { id: 182, name: 'Assassination', icon: 'ability_rogue_eviscerate' },
  { id: 181, name: 'Combat', icon: 'ability_backstab' },
  { id: 183, name: 'Subtlety', icon: 'ability_stealth' },
];

async function get(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res;
}

/** The data file is a script that calls `WH.setPageData(key, data)`; read the call's argument. */
async function loadCalcData() {
  const src = await (await get(DATA_URL)).text();
  const calls = [];
  const WH = { setPageData: (key, data) => calls.push([key, data]), Gatherer: { addData() {} } };
  new Function('WH', src)(WH);
  const hit = calls.find(([key, data]) => key.endsWith('.data') && data?.talents);
  if (!hit) throw new Error('talent data not found in the calculator script');
  return hit[1];
}

/** Wowhead's rank text is light HTML (line breaks, colour spans, plural comments); keep the words. */
const plain = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

async function download(url, file) {
  if (existsSync(file)) return;
  writeFileSync(file, Buffer.from(await (await get(url)).arrayBuffer()));
}

async function refresh() {
  const data = await loadCalcData();
  const trees = TREES.map((t) => {
    const raw = data.talents[t.id];
    if (!raw) throw new Error(`tree ${t.id} (${t.name}) missing from Wowhead's data`);
    const talents = Object.values(raw)
      // Link digits run row by row, left to right.
      .sort((a, b) => a.row - b.row || a.col - b.col)
      .map((x) => ({
        id: x.id,
        name: x.name,
        row: x.row,
        col: x.col,
        icon: x.icon,
        max: x.ranks.length,
        /** Spell per rank, and the talent definition Wowhead's tooltip API takes as `def`. */
        spells: x.ranks,
        def: x.definition,
        /** Each rank's text, shown until (or instead of) Wowhead's live tooltip. */
        text: x.ranks.map((_, r) => plain(x.descriptions[r + 1] ?? '')),
        requires: x.requires.map((r) => ({ id: r.id, ranks: r.qty })),
        /** Points needed in this tree before the talent unlocks. */
        tierPoints: x.requiredPoints,
      }));
    return { ...t, talents };
  });

  mkdirSync(root('public/talents'), { recursive: true });
  const icons = new Set(trees.flatMap((t) => [t.icon, ...t.talents.map((x) => x.icon)]));
  for (const icon of icons) await download(`${IMG}/icons/large/${icon}.jpg`, root(`public/talents/${icon}.jpg`));
  for (const t of trees)
    await download(`${IMG}/talents/backgrounds/classicplus/${t.id}.jpg`, root(`public/talents/bg-${t.id}.jpg`));

  writeFileSync(outPath, `${JSON.stringify({ source: DATA_URL, trees }, null, 2)}\n`);
  console.log(`Wrote ${trees.map((t) => `${t.name} ${t.talents.length}`).join(', ')} talents; ${icons.size} icons.`);
  return trees;
}

/** Talent letters in a learning order (Crockford base32 without the digits). */
const ORDER_LETTERS = 'abcdefghjkmnpqrstvwxyz';

/** Same rules as src/lib/talentCalc.ts. */
function check(trees) {
  const src = readdirSync(root('src/content/builds'))
    .map((f) => readFileSync(root(`src/content/builds/${f}`), 'utf8'))
    .join('\n');
  let bad = 0;
  for (const [, link] of src.matchAll(/link: '([^']*talent-calc[^']*)'/g)) {
    const m = link.match(/\/talent-calc\/rogue\/v2([0-9-]*)(?:[_/]|$)/);
    const problems = [];
    const totals = [];
    if (!m) problems.push('not a v2 Rogue calculator link');
    else {
      const parts = m[1].split('-');
      if (parts.length > trees.length) problems.push('more trees than the Rogue has');
      parts.forEach((digits, i) => {
        let sum = 0;
        [...digits].forEach((d, j) => {
          const t = trees[i]?.talents[j];
          if (!t) problems.push(`${trees[i]?.name ?? `tree ${i + 1}`} has no talent #${j + 1}`);
          else if (+d > t.max) problems.push(`${t.name} ${d}/${t.max}`);
          sum += +d;
        });
        totals.push(sum);
      });
    }
    const order = link.match(/\/talent-calc\/rogue\/v2[0-9-]*[^/]*\/([0-9a-zA-Z]+)/)?.[1];
    if (m && order) {
      // Same rules as decodeTalentOrder: the learning order has to finish on the link's ranks.
      const got = trees.map((t) => t.talents.map(() => 0));
      let tree = 0;
      for (const ch of order) {
        if (/[0-9]/.test(ch)) {
          tree = +ch;
          continue;
        }
        const j = ORDER_LETTERS.indexOf(ch.toLowerCase());
        const t = trees[tree]?.talents[j];
        if (!t) {
          problems.push(`order: no talent for "${ch}"`);
          break;
        }
        got[tree][j] = ch === ch.toUpperCase() ? t.max : got[tree][j] + 1;
      }
      const want = m[1].split('-').map((d) => [...d].map(Number));
      const off = got.some((r, i) => r.some((n, j) => n !== (want[i]?.[j] ?? 0)));
      if (off) problems.push("talent order doesn't add up to the link's ranks");
    }
    if (problems.length) bad++;
    console.log(`${problems.length ? '✗' : '✓'} ${totals.join('/').padEnd(9)} ${link.split('/talent-calc/')[1]}${problems.length ? `\n    ${problems.join('; ')}` : ''}`);
  }
  if (bad) {
    console.log(`\n${bad} link(s) don't fit the current trees.`);
    process.exitCode = 1;
  }
}

const trees = process.argv.includes('--check') ? JSON.parse(readFileSync(outPath, 'utf8')).trees : await refresh();
check(trees);
