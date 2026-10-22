#!/usr/bin/env node
/**
 * Step 2 (and 4) of the leveling gear research (see README.md here): score every cached
 * item, find the upgrades worth chasing in each slot, and write a report.
 *
 *   node scripts/gear-research/rank.mjs            # report + shortlist for sources.mjs
 *   node scripts/gear-research/rank.mjs --emit     # also write src/content/leveling-gear.json
 *
 * Method (the one agreed for the Handbook):
 *  1. EP per item from the site's own stat weights, in Attack Power units. Weapons add
 *     their damage: main hand counts DPS heavily and favours slower weapons (Sinister
 *     Strike, Backstab, Ambush and Mutilate all hit with weapon damage), off hand less.
 *  2. A baseline per slot and level: what a typical fixed-stat green gives there.
 *  3. Per slot, pick the upgrades that add the most "better than green" over levels
 *     10–58, where every pick costs a little and picks in one slot sit a minimum number
 *     of levels apart (weapons closest, accessories furthest). That favours items that
 *     are both much stronger and stay best for a long time.
 *  4. Run once per faction, so a faction-only pick gets the other side's best answer.
 *
 * Hand corrections live in curation.json (exclude, include, level, source overrides)
 * so a rerun keeps them. Tune the knobs below, not the code, when the list feels off.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isJunkName, WEAPON_TYPES } from './parse.mjs';
import { describeSource } from './zones.mjs';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const cache = JSON.parse(readFileSync(here('./cache/items.json'), 'utf8'));
const sources = existsSync(here('./cache/sources.json')) ? JSON.parse(readFileSync(here('./cache/sources.json'), 'utf8')) : {};
const curation = JSON.parse(readFileSync(here('./curation.json'), 'utf8'));
const emit = process.argv.includes('--emit');

// ---------------------------------------------------------------- knobs

/** EP per point, Attack Power = 1. Matches the site's stat priority; Stamina gets a little for leveling survival. */
const WEIGHTS = { agi: 2.08, str: 1.1, ap: 1, hit: 2.73, crit: 2.03, sta: 0.3 };
/** EP per point of weapon skill for the build's weapon type (about 0.04% hit and crit per point at 60). */
const SKILL_EP = 4;
/** EP per point of weapon DPS by hand. Ranged only matters for pulling. */
const DPS_EP = { main: 20, off: 9, ranged: 1 };
/** Main-hand speed the "speed bonus" is measured against, per weapon family. */
const REFERENCE_SPEED = { slow: 2.4, dagger: 1.7 };

/** First level the list covers; below it greens barely have stats, so everything looks like an upgrade. */
const MIN_LEVEL = 10;
/** Last level the leveling list covers; items needing 59–60 belong to pre-raid BiS. */
const MAX_LEVEL = 58;
/** Picks keep earning value until 60: a level 58 item is worn for the last levels, not just one. */
const WORN_UNTIL = 60;
/** An item must beat the green baseline at its level by this much to be considered. Weapons differ less (mostly DPS). */
const MIN_RATIO = { weapon: 1.05, major: 1.1, minor: 1.1, trinket: 1.1 };

/** Per slot group: minimum levels between picks, and the cost of one pick (in "levels × fraction better than green"). */
const CADENCE = {
  weapon: { gap: 5, cost: 0.35 },
  major: { gap: 8, cost: 1.0 },
  minor: { gap: 10, cost: 1.4 },
  trinket: { gap: 10, cost: 1.5 },
};
const SLOT_GROUP = {
  Head: 'major', Shoulders: 'major', Chest: 'major', Legs: 'major', Hands: 'major',
  Neck: 'minor', Back: 'minor', Wrists: 'minor', Waist: 'minor', Feet: 'minor', Ring: 'minor', Ranged: 'minor',
  Trinket: 'trinket',
};
/**
 * Source kinds a leveling player can reasonably chase. Left out: world drops, open-world
 * rare spawns ('drop'), vendors (in practice battleground and reputation quartermasters),
 * raids and PvP. curation.json `allow` lets a specific one back in.
 */
const ACCESSIBLE = new Set(['quest', 'dungeon', 'crafted']);

// ---------------------------------------------------------------- scoring

const excluded = new Set(curation.exclude.map((e) => e.id));
const items = Object.values(cache.items)
  .filter((i) => !excluded.has(i.id) && !i.random && !isJunkName(i.name))
  .map((i) => {
    const raw = sources[i.id];
    const source = raw?.codes ? describeSource(raw.codes, raw.more) : undefined;
    const faction =
      curation.faction?.[i.id] ?? (raw?.side === 1 ? 'Alliance' : raw?.side === 2 ? 'Horde' : source?.faction ?? 'Both');
    const reqlevel = i.reqlevel ?? raw?.reqlevel;
    // A quest reward is reached at the quest's level, not the (often lower) level it requires.
    // When Wowhead doesn't give the quest's level, rewards run about 2 item levels above their quest.
    const questLevel = source?.kind === 'quest' ? (raw.questLevel ?? (i.ilvl ? i.ilvl - 2 : 0)) : 0;
    const reached = Math.max(reqlevel ?? 0, questLevel) || undefined;
    return { ...i, source, faction: raw ? faction : undefined, reqlevel, level: curation.level?.[i.id] ?? reached ?? Math.max(1, (i.ilvl ?? 5) - 4) };
  });

const QUALITY = ['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
const isWeapon = (i) => i.cls === 2;
const weaponType = (i) => WEAPON_TYPES[i.sub];

function statsEP(i, skillType) {
  let ep = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) ep += (i.stats[k] ?? 0) * w;
  const skill = i.stats.skill;
  if (skill && skillType && skill.type.startsWith(skillType)) ep += skill.value * SKILL_EP;
  return ep;
}

/** Score for one role. `null` when the item can't fill it. */
function scoreFor(i, role) {
  const w = i.weapon;
  switch (role.hand) {
    case 'armor':
      return !isWeapon(i) && i.slot === role.slot ? statsEP(i) : null;
    case 'ranged':
      return i.slot === 'Ranged' ? statsEP(i) + (w?.dps ?? 0) * DPS_EP.ranged : null;
    case 'main': {
      if (!w || !['Main hand', 'One-hand'].includes(i.slot) || !role.types.includes(weaponType(i))) return null;
      const speedBonus = 0.7 + 0.3 * (w.speed / REFERENCE_SPEED[role.family]);
      return statsEP(i, role.skill) + w.dps * DPS_EP.main * speedBonus;
    }
    case 'off': {
      if (!w || !['Off hand', 'One-hand'].includes(i.slot) || !role.types.includes(weaponType(i))) return null;
      return statsEP(i, role.skill) + w.dps * DPS_EP.off;
    }
  }
}

const ARMOR_SLOTS = ['Head', 'Neck', 'Shoulders', 'Back', 'Chest', 'Wrists', 'Hands', 'Waist', 'Legs', 'Feet', 'Ring', 'Trinket'];
/** Every slot list the leveling builds need. `list` is the gear.ts export it feeds. */
const ROLES = [
  ...ARMOR_SLOTS.map((slot) => ({ key: slot, list: 'shared', hand: 'armor', slot, group: SLOT_GROUP[slot] })),
  { key: 'Ranged', list: 'shared', hand: 'ranged', slot: 'Ranged', group: 'minor' },
  // Sinister Strike: any one-hander, slow main hand preferred. Daggers are left to the dagger builds.
  { key: 'Main hand (slow)', list: 'slow', hand: 'main', slot: 'Main hand', family: 'slow', types: ['Sword', 'Axe', 'Mace', 'Fist Weapon'], group: 'weapon' },
  { key: 'Off hand (slow builds)', list: 'slow', hand: 'off', slot: 'Off hand', family: 'slow', types: ['Sword', 'Axe', 'Mace', 'Fist Weapon', 'Dagger'], group: 'weapon' },
  // Mutilate needs a dagger in each hand; Backstab and Ambush need one in the main hand.
  { key: 'Main hand (dagger)', list: 'daggers', hand: 'main', slot: 'Main hand', family: 'dagger', types: ['Dagger'], skill: 'Daggers', group: 'weapon' },
  { key: 'Off hand (dagger)', list: 'daggers', hand: 'off', slot: 'Off hand', family: 'dagger', types: ['Dagger'], skill: 'Daggers', group: 'weapon' },
];

// ---------------------------------------------------------------- baseline

/** Stats a Rogue actually wants; a green counts toward the baseline only if it has one (caster greens would drag it down). */
const ROGUE_STATS = ['agi', 'str', 'ap', 'hit', 'crit'];

/** Median EP of fixed-stat Rogue greens a few levels either side, made non-decreasing. */
function baselineCurve(scored, weapons) {
  const greens = scored.filter((s) => s.item.quality === 2 && (weapons || ROGUE_STATS.some((k) => s.item.stats[k])));
  const curve = [];
  for (let l = 1; l <= 60; l++) {
    const near = greens.filter((s) => Math.abs(s.item.level - l) <= 3).map((s) => s.ep).sort((a, b) => a - b);
    curve[l] = near.length >= 3 ? near[Math.floor(near.length / 2)] : undefined;
  }
  // Fill gaps by interpolation, then make it monotonic so a dip never makes an item look better.
  let last;
  for (let l = 1; l <= 60; l++) if (curve[l] !== undefined) last = l;
  for (let l = 1; l <= 60; l++) {
    if (curve[l] !== undefined) continue;
    const prev = [...Array(l).keys()].reverse().find((k) => curve[k] !== undefined);
    const next = curve.findIndex((v, k) => k > l && v !== undefined);
    curve[l] = prev !== undefined && next > 0 ? curve[prev] + ((curve[next] - curve[prev]) * (l - prev)) / (next - prev) : curve[prev ?? next] ?? 1;
  }
  for (let l = 2; l <= 60; l++) curve[l] = Math.max(curve[l], curve[l - 1], 1);
  return curve;
}

// ---------------------------------------------------------------- selection

const allowed = new Set(curation.allow ?? []);
const accessible = (i) => !i.source || ACCESSIBLE.has(i.source.kind) || allowed.has(i.id);

/** Best set of picks for one role and faction: maximises Σ levels × (EP / baseline − 1) minus a cost per pick. */
function choose(cands, base, { gap, cost }) {
  const c = cands.filter((s) => s.item.level >= MIN_LEVEL && s.item.level <= MAX_LEVEL).sort((a, b) => a.item.level - b.item.level);
  const gain = (s, from, to) => {
    let v = 0;
    for (let l = Math.max(from, MIN_LEVEL); l < to; l++) v += Math.max(0, s.ep / base[l] - 1);
    return v;
  };
  const memo = new Map();
  const best = (i) => {
    if (memo.has(i)) return memo.get(i);
    const s = c[i];
    let top = { value: gain(s, s.item.level, WORN_UNTIL + 1), next: -1 };
    for (let j = i + 1; j < c.length; j++) {
      if (c[j].item.level - s.item.level < gap || c[j].ep <= s.ep) continue;
      const v = gain(s, s.item.level, c[j].item.level) + best(j).value - cost;
      if (v > top.value) top = { value: v, next: j };
    }
    memo.set(i, top);
    return top;
  };
  let start = { value: 0, first: -1 };
  for (let i = 0; i < c.length; i++) {
    const v = best(i).value - cost;
    if (v > start.value) start = { value: v, first: i };
  }
  const picks = [];
  for (let i = start.first; i >= 0; i = best(i).next) picks.push(c[i]);
  return picks;
}

// ---------------------------------------------------------------- run

/** Main-hand picks per list, so the off hand of the same build gets a different weapon. */
const mainHandPicks = { slow: new Set(), daggers: new Set() };
const takenMainHand = (role, item) => role.hand === 'off' && mainHandPicks[role.list]?.has(item.id);

const report = [];
const shortlist = new Set();
const missingSources = new Set();
const emitted = { shared: [], slow: [], daggers: [] };
const unparsed = new Map();
for (const i of items) for (const line of i.unparsed ?? []) unparsed.set(line, (unparsed.get(line) ?? 0) + 1);

for (const role of ROLES) {
  const scored = items.map((item) => ({ item, ep: scoreFor(item, role) })).filter((s) => s.ep != null && s.ep > 0);
  const base = baselineCurve(scored, role.group === 'weapon');
  const strong = scored.filter(
    (s) => s.ep >= MIN_RATIO[role.group] * base[Math.min(60, Math.max(1, s.item.level))] && accessible(s.item) && !takenMainHand(role, s.item),
  );
  const cadence = CADENCE[role.group];
  // Every strong candidate needs a source before picks can be trusted, so shortlist them all.
  for (const s of strong) if (!s.item.source) (shortlist.add(s.item.id), missingSources.add(s.item.id));

  // Paired slots get two passes: the second ring and trinket can't reuse the first's picks.
  const passes = role.slot === 'Ring' || role.slot === 'Trinket' ? 2 : 1;
  const pickPasses = (pool) => {
    const out = [];
    for (let p = 0; p < passes; p++) {
      const picks = choose(pool, base, cadence);
      out.push(...picks);
      const used = new Set(picks.map((s) => s.item.id));
      pool = pool.filter((s) => !used.has(s.item.id));
    }
    return out;
  };
  // Picks both factions share come from items both can get. Then each faction's run may add
  // its own faction-only items where they beat those: the other side's answer at that level.
  const both = (s) => !s.item.faction || s.item.faction === 'Both';
  const chosen = new Map(); // id → { s, factions: Set }
  for (const s of pickPasses(strong.filter(both))) chosen.set(s.item.id, { s, factions: new Set(['Alliance', 'Horde']) });
  for (const faction of ['Alliance', 'Horde']) {
    for (const s of pickPasses(strong.filter((o) => both(o) || o.item.faction === faction))) {
      if (!both(s)) chosen.set(s.item.id, { s, factions: new Set([faction]) });
    }
  }

  const rows = [...chosen.values()].sort((a, b) => a.s.item.level - b.s.item.level);
  report.push(`\n## ${role.key}\n`);
  report.push('| Lvl | Item | EP | vs green | Source | Faction | Runners-up (±3 lvls) |');
  report.push('|---|---|---|---|---|---|---|');
  for (const { s, factions } of rows) {
    const i = s.item;
    if (role.hand === 'main') mainHandPicks[role.list].add(i.id);
    shortlist.add(i.id);
    if (!i.source) missingSources.add(i.id);
    const near = strong
      .filter((o) => o.item.id !== i.id && Math.abs(o.item.level - i.level) <= 3)
      .sort((a, b) => b.ep - a.ep)
      .slice(0, 3);
    for (const o of near) {
      shortlist.add(o.item.id);
      if (!o.item.source) missingSources.add(o.item.id);
    }
    const faction = i.faction && i.faction !== 'Both' ? i.faction : 'Both';
    const w = i.weapon ? ` ${weaponType(i)} ${i.weapon.speed}` : '';
    report.push(
      `| ${i.level} | [${i.name}](https://www.wowhead.com/forever/item=${i.id}) (${i.id})${w} | ${s.ep.toFixed(0)} | ${(s.ep / base[i.level]).toFixed(2)}× | ${i.source?.text ?? '?'} | ${faction} | ${near.map((o) => `${o.item.name} (${o.item.id}, ${o.item.level}, ${(o.ep / base[o.item.level]).toFixed(2)}×)`).join('; ')} |`,
    );
    if (i.source && accessible(i)) {
      const out = curation.source?.[i.id] ?? i.source.text;
      const slot = role.slot;
      const entry = { level: i.level, slot, itemId: i.id, name: i.name, quality: QUALITY[i.quality], source: out, faction: i.faction ?? 'Both' };
      if (!emitted[role.list].some((e) => e.itemId === i.id && e.slot === slot)) emitted[role.list].push(entry);
    }
  }
}

// Manual includes go in as written.
for (const inc of curation.include ?? []) emitted[inc.list].push(inc.item);

const header = [
  `# Leveling gear research report`,
  ``,
  `Generated ${new Date().toISOString().slice(0, 16)}Z from ${Object.keys(cache.items).length} cached items (scanned ${cache.scannedAt?.slice(0, 10)}).`,
  `EP uses the site's weights; "vs green" is EP over the typical fixed-stat green at that level.`,
  missingSources.size ? `\n**${missingSources.size} items still need sources:** run \`node scripts/gear-research/sources.mjs\`, then rerun this.` : '',
  unparsed.size ? `\n### Equip lines the parser doesn't score yet\n\n${[...unparsed].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([l, n]) => `- ${l} (${n})`).join('\n')}` : '',
];
writeFileSync(here('./cache/report.md'), [...header, ...report].join('\n') + '\n');
writeFileSync(here('./cache/shortlist.json'), JSON.stringify([...shortlist]));
console.log(`Report: scripts/gear-research/cache/report.md (${shortlist.size} shortlisted, ${missingSources.size} without sources).`);

if (emit) {
  if (missingSources.size) {
    console.log('Not emitting: some picks have no source yet. Run sources.mjs first.');
    process.exit(1);
  }
  const out = here('../../src/content/leveling-gear.json');
  for (const k of Object.keys(emitted)) emitted[k].sort((a, b) => a.level - b.level || a.slot.localeCompare(b.slot));
  writeFileSync(out, `${JSON.stringify({ generated: new Date().toISOString().slice(0, 10), ...emitted }, null, 2)}\n`);
  console.log(`Wrote src/content/leveling-gear.json: ${emitted.shared.length} shared, ${emitted.slow.length} slow-weapon, ${emitted.daggers.length} dagger items.`);
}
