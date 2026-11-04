#!/usr/bin/env node
/**
 * Step 2 (and 4) of the leveling gear research (see README.md here): score every cached
 * item, find the upgrades worth chasing in each slot, and write a report.
 *
 *   node scripts/gear-research/rank.mjs            # report + shortlist for sources.mjs
 *   node scripts/gear-research/rank.mjs --emit     # also write src/content/leveling-gear.json
 *
 * Method (the one agreed for the Handbook):
 *  1. EP per item, per leveling build, from that build's own stat weights (weights.mjs reads
 *     them from src/content/builds), in Attack Power units. Weapons add their damage: main
 *     hand counts DPS heavily and favours slower weapons (Sinister Strike, Backstab, Ambush
 *     and Mutilate all hit with weapon damage), off hand less. Procs and use effects are
 *     valued from the game's own proc data (procs.mjs) as damage per second, then as EP.
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
import { loadBuildWeights } from './weights.mjs';
import { describeSource } from './zones.mjs';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const cache = JSON.parse(readFileSync(here('./cache/items.json'), 'utf8'));
const sources = existsSync(here('./cache/sources.json')) ? JSON.parse(readFileSync(here('./cache/sources.json'), 'utf8')) : {};
const curation = JSON.parse(readFileSync(here('./curation.json'), 'utf8'));
const procData = existsSync(here('./cache/procs.json')) ? JSON.parse(readFileSync(here('./cache/procs.json'), 'utf8')).items : {};
const recipes = existsSync(here('./cache/recipes.json')) ? JSON.parse(readFileSync(here('./cache/recipes.json'), 'utf8')) : {};
const builds = loadBuildWeights();
const emit = process.argv.includes('--emit');

// ---------------------------------------------------------------- knobs

/** Stamina counts for a little in leveling even though the sim gives it ~0 (survival). */
const STAMINA_EP = 0.3;
/** EP per point of weapon skill for the build's weapon type (about 0.04% hit and crit per point at 60). */
const SKILL_EP = 4;
/** EP per point of weapon DPS by hand. Ranged only matters for pulling. */
const DPS_EP = { main: 20, off: 9, ranged: 1 };

// Proc model (see README "Procs"). Everything is converted to damage per second, then to EP.
/** Procs per minute for an on-hit effect the game data gives no rate for (the classic default for "Chance on hit"). */
const DEFAULT_PPM = 1;
/** An extra attack is a full white swing, which also carries Attack Power: weapon average × this. */
const EXTRA_ATTACK_FACTOR = 1.3;
/** Flat proc and use damage doesn't scale with abilities or crit like weapon DPS does; it counts at this share of a main-hand DPS point. */
const FLAT_DAMAGE_SHARE = 0.85;
/** Resists and misses shave a little off magic proc damage. */
const MAGIC_DAMAGE_TAKEN = 0.9;
/** EP per 1% of melee haste or damage (used for the rare "+% attack speed" effects). */
const PCT_DAMAGE_EP = 12;
/** Hit and crit ratings per 1% (same conversion parse.mjs applies to tooltip percentages). */
const RATING_PER_PCT = { hit: 10, crit: 14 };
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
/** Where a recipe may come from and still be chaseable (a mob drop or vendor is fine for a recipe, unlike for gear). */
const RECIPE_OK = new Set(['quest', 'dungeon', 'crafted', 'vendor', 'drop', 'world']);
const notAtLaunch = new Set(curation.notAtLaunch?.zones ?? []);
const allowEpic = new Set(curation.allowEpic ?? []);

// ---------------------------------------------------------------- scoring

const excluded = new Set(curation.exclude.map((e) => e.id));
const items = Object.values(cache.items)
  .filter((i) => !excluded.has(i.id) && !i.random && !isJunkName(i.name))
  .map((i) => {
    const raw = sources[i.id];
    let source = raw?.codes ? describeSource(raw.codes, raw.more) : undefined;
    let recipePending = false;
    let recipeUnknown = false;
    const unavailable = (text) => (source = { kind: 'unavailable', text });
    // Content that isn't in the game at launch (curation.json notAtLaunch.zones: e.g. Dire Maul).
    if (source && raw.codes.some((c, k) => c === 2 && notAtLaunch.has(raw.more[k]?.z))) unavailable(`Not at launch: ${source.text}`);
    // A crafted item is only as available as its recipe; no recipe item means a trainer teaches it.
    if (source?.kind === 'crafted' && recipes[i.id]?.recipes.length) {
      const found = recipes[i.id].recipes.map((rid) => (sources[rid]?.codes ? describeSource(sources[rid].codes, sources[rid].more) : undefined));
      const droppedInLaunchZone = (rid) => sources[rid].codes.some((c, k) => c === 2 && notAtLaunch.has(sources[rid].more[k]?.z));
      // ok: a known, chaseable recipe source. unknown: Wowhead lists none (new Forever recipes often have none), which isn't evidence it's unavailable.
      const status = recipes[i.id].recipes.map((rid, k) => (!found[k] ? 'pending' : found[k].kind === 'unknown' ? 'unknown' : RECIPE_OK.has(found[k].kind) && !droppedInLaunchZone(rid) ? 'ok' : 'bad'));
      if (status.includes('pending')) recipePending = true;
      else if (!status.includes('ok')) {
        if (status.includes('unknown')) recipeUnknown = true;
        else unavailable(`Not at launch: recipe is ${found.map((f) => f.text).join(' / ')}`);
      }
    }
    // Epics below level 60 are mostly raid-era or post-launch rewards: they stay out until curation.json allowEpic says otherwise.
    if (source && i.quality >= 4 && !allowEpic.has(i.id) && (i.reqlevel ?? 0) < 60 && !['unavailable'].includes(source.kind)) source = { kind: 'unconfirmed', text: `Epic, not confirmed for launch (${source.text})` };
    const faction =
      curation.faction?.[i.id] ?? (raw?.side === 1 ? 'Alliance' : raw?.side === 2 ? 'Horde' : source?.faction ?? 'Both');
    const reqlevel = i.reqlevel ?? raw?.reqlevel;
    // A quest reward is reached at the quest's level, not the (often lower) level it requires.
    // When Wowhead doesn't give the quest's level, rewards run about 2 item levels above their quest.
    const questLevel = source?.kind === 'quest' ? (raw.questLevel ?? (i.ilvl ? i.ilvl - 2 : 0)) : 0;
    const reached = Math.max(reqlevel ?? 0, questLevel) || undefined;
    return { ...i, source, recipePending, recipeUnknown, faction: raw ? faction : undefined, reqlevel, level: curation.level?.[i.id] ?? reached ?? Math.max(1, (i.ilvl ?? 5) - 4) };
  });

const QUALITY = ['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
const isWeapon = (i) => i.cls === 2;
const weaponType = (i) => WEAPON_TYPES[i.sub];

const dpsEp = (build) => ({ ...DPS_EP, ...(curation.dpsEp?.[build.key] ?? {}) });

function statsEP(i, build, skillType) {
  let ep = 0;
  for (const [k, w] of Object.entries(build.weights)) ep += (i.stats[k] ?? 0) * (k === 'sta' ? Math.max(w, STAMINA_EP) : w);
  const skill = i.stats.skill;
  if (skill && skillType && skill.type.startsWith(skillType)) ep += skill.value * SKILL_EP;
  return ep;
}

/** Swing speed assumed for an on-hit effect on something that isn't a weapon (a ring or trinket). */
const NON_WEAPON_SWING = 2;

/**
 * What an item's on-hit and use effects are worth, in EP for one build: each effect becomes
 * damage per second (or an average stat), then EP. `assumed` marks a rate the game data
 * doesn't give; `unmodeled` counts effects this model can't value (they score 0).
 */
function procEP(i, build) {
  const effects = procData[i.id];
  const out = { ep: 0, assumed: false, unmodeled: 0 };
  if (!effects) return out;
  const w = build.weights;
  const dps = dpsEp(build);
  const swing = i.weapon?.speed ?? NON_WEAPON_SWING;
  const avgHit = i.weapon ? (i.weapon.min + i.weapon.max) / 2 : 0;
  for (const e of effects) {
    let perSec = 0;
    if (e.trigger === 'onHit') {
      if (curation.ppm?.[i.id] !== undefined) perSec = curation.ppm[i.id] / 60;
      else if (e.rate.ppm !== undefined) perSec = e.rate.ppm / 60;
      else if (e.rate.chance !== undefined) perSec = e.rate.chance / swing;
      else ((perSec = DEFAULT_PPM / 60), (out.assumed = true));
    } else if (e.cooldown > 0) perSec = 1 / e.cooldown; // a use effect, once per cooldown
    for (const f of e.effects) {
      if (f.kind === 'extraAttack') out.ep += perSec * f.count * avgHit * EXTRA_ATTACK_FACTOR * dps.main;
      else if (f.kind === 'damage') out.ep += perSec * f.amount * MAGIC_DAMAGE_TAKEN * dps.main * FLAT_DAMAGE_SHARE;
      else if (f.kind === 'buff' && f.amount > 0) {
        const uptime = Math.min(1, perSec * f.duration);
        const key = f.stat === 'critPct' ? 'crit' : f.stat === 'hitPct' ? 'hit' : f.stat;
        const perPoint = f.stat === 'critPct' || f.stat === 'hitPct' ? RATING_PER_PCT[key] : 1;
        out.ep += f.amount * perPoint * uptime * (w[key] ?? 0);
      } else if (f.kind === 'haste' && f.pct > 0) out.ep += f.pct * Math.min(1, perSec * f.duration) * PCT_DAMAGE_EP;
      else if (f.kind === 'buff' || f.kind === 'haste') continue; // a debuff on the target, not a gain
      else out.unmodeled++;
    }
  }
  return out;
}

/** Score for one role and build, `{ ep, proc }`; `null` when the item can't fill it. */
function scoreFor(i, role, build) {
  const w = i.weapon;
  const dps = dpsEp(build);
  const withProc = (base) => {
    const proc = procEP(i, build);
    return { ep: base + proc.ep, proc };
  };
  switch (role.hand) {
    case 'armor':
      return !isWeapon(i) && i.slot === role.slot ? withProc(statsEP(i, build)) : null;
    case 'ranged':
      return i.slot === 'Ranged' ? { ep: statsEP(i, build) + (w?.dps ?? 0) * dps.ranged, proc: { ep: 0, assumed: false, unmodeled: 0 } } : null;
    case 'main': {
      if (!w || !['Main hand', 'One-hand'].includes(i.slot) || !role.types.includes(weaponType(i))) return null;
      const speedBonus = role.family === 'slow' ? 0.7 + 0.3 * (w.speed / REFERENCE_SPEED.slow) : role.family === 'dagger' ? 0.7 + 0.3 * (w.speed / REFERENCE_SPEED.dagger) : 1;
      return withProc(statsEP(i, build, role.skill) + w.dps * dps.main * speedBonus);
    }
    case 'off': {
      if (!w || !['Off hand', 'One-hand'].includes(i.slot) || !role.types.includes(weaponType(i))) return null;
      return withProc(statsEP(i, build, role.skill) + w.dps * dps.off);
    }
  }
}

const ARMOR_SLOTS = ['Head', 'Neck', 'Shoulders', 'Back', 'Chest', 'Wrists', 'Hands', 'Waist', 'Legs', 'Feet', 'Ring', 'Trinket'];
const MELEE = ['Sword', 'Axe', 'Mace', 'Fist Weapon', 'Dagger'];
/** Which weapons each build's rotation needs: Mutilate wants a dagger in each hand; Backstab and Ambush a dagger in the main hand; Sinister Strike (Combat Questing and Dungeons) a slow main hand. Subtlety Questing and Dungeons swap weapons, so they get both a dagger list and a slow list. */
const MAIN = {
  dagger: { key: 'Main hand', hand: 'main', slot: 'Main hand', family: 'dagger', types: ['Dagger'], skill: 'Daggers', group: 'weapon' },
  slow: { key: 'Main hand', hand: 'main', slot: 'Main hand', family: 'slow', types: ['Sword', 'Axe', 'Mace', 'Fist Weapon'], group: 'weapon' },
};
const OFF = {
  dagger: { key: 'Off hand', hand: 'off', slot: 'Off hand', family: 'dagger', types: ['Dagger'], skill: 'Daggers', group: 'weapon' },
  any: { key: 'Off hand', hand: 'off', slot: 'Off hand', family: 'any', types: MELEE, group: 'weapon' },
};
const WEAPONS = {
  'assassination/questing': [MAIN.dagger, OFF.dagger],
  'assassination/dungeons': [MAIN.dagger, OFF.dagger],
  'combat/questing': [MAIN.slow, OFF.any],
  'combat/dungeons': [MAIN.slow, OFF.any],
  // Subtlety weapon-swaps: a dagger for Ambush/Backstab and a slow weapon, each with its own main-hand picks.
  'subtlety/questing': [MAIN.dagger, MAIN.slow, OFF.any],
  'subtlety/dungeons': [MAIN.dagger, MAIN.slow, OFF.any],
};
const rolesFor = (build) => [
  ...ARMOR_SLOTS.map((slot) => ({ key: slot, hand: 'armor', slot, group: SLOT_GROUP[slot] })),
  { key: 'Ranged', hand: 'ranged', slot: 'Ranged', group: 'minor' },
  ...WEAPONS[build.key],
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

const report = [];
const shortlist = new Set();
const missingSources = new Set();
const emitted = {};
const unparsed = new Map();
for (const i of items) for (const line of i.unparsed ?? []) unparsed.set(line, (unparsed.get(line) ?? 0) + 1);
const pins = curation.pins ?? [];
const pinReport = [];
const flagged = new Map(); // id → "name (builds)" for effects the model can't value
const unverified = new Map(); // crafted picks whose recipe source Wowhead doesn't list
const blocked = new Map(); // id → why: strong items kept out because they aren't available at launch

for (const build of builds) {
  emitted[build.key] = [];
  report.push(`\n# ${build.key}\n`);
  report.push(`Weights: ${Object.entries(build.weights).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  /** Main-hand picks, so this build's off hand gets a different weapon. */
  const mainHandPicks = new Set();

  for (const role of rolesFor(build)) {
    const scored = items
      .map((item) => {
        const r = scoreFor(item, role, build);
        return r && r.ep > 0 ? { item, ep: r.ep, proc: r.proc } : null;
      })
      .filter(Boolean);
    const base = baselineCurve(scored, role.group === 'weapon');
    const taken = (s) => role.hand === 'off' && mainHandPicks.has(s.item.id);
    const forced = new Set(pins.filter((p) => p.force !== false && (!p.roles || p.roles.includes(role.key)) && (!p.builds || p.builds.includes(build.key))).map((p) => p.id));
    const strong = scored.filter(
      (s) => forced.has(s.item.id) || (s.ep >= MIN_RATIO[role.group] * base[Math.min(60, Math.max(1, s.item.level))] && accessible(s.item) && !taken(s)),
    );
    for (const s of scored) {
      const k = s.item.source?.kind;
      if ((k === 'unavailable' || k === 'unconfirmed') && s.item.level >= MIN_LEVEL && s.item.level <= MAX_LEVEL && s.ep >= MIN_RATIO[role.group] * base[Math.min(60, s.item.level)])
        blocked.set(s.item.id, `${s.item.name} (${s.item.id}, L${s.item.level}, ${role.key}): ${s.item.source.text}`);
    }
    const cadence = CADENCE[role.group];
    // Every strong candidate needs a source before picks can be trusted, so shortlist them all.
    for (const s of strong) if (!s.item.source || s.item.recipePending) (shortlist.add(s.item.id), missingSources.add(s.item.id));

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
    const chosen = new Map();
    for (const s of pickPasses(strong.filter(both))) chosen.set(s.item.id, { s, factions: new Set(['Alliance', 'Horde']) });
    for (const faction of ['Alliance', 'Horde']) {
      for (const s of pickPasses(strong.filter((o) => both(o) || o.item.faction === faction))) {
        if (!both(s)) chosen.set(s.item.id, { s, factions: new Set([faction]) });
      }
    }
    // Pinned items go in regardless of what the model thinks (unless a pin says force: false).
    for (const s of scored) if (forced.has(s.item.id) && !chosen.has(s.item.id)) chosen.set(s.item.id, { s, factions: new Set(['Alliance', 'Horde']) });

    const rows = [...chosen.values()].sort((a, b) => a.s.item.level - b.s.item.level);
    report.push(`\n## ${build.key} · ${role.key}${role.hand === 'main' ? ` (${role.family})` : ''}\n`);
    report.push('| Lvl | Item | EP | of which proc | vs green | Source | Faction | Runners-up (±3 lvls) |');
    report.push('|---|---|---|---|---|---|---|---|');
    const flag = (s) => (s.proc.unmodeled ? ' ⚠' : s.proc.assumed ? ' ~' : '');
    for (const { s, factions } of rows) {
      const i = s.item;
      if (role.hand === 'main') mainHandPicks.add(i.id);
      shortlist.add(i.id);
      if (!i.source || i.recipePending) missingSources.add(i.id);
      if (s.proc.unmodeled) flagged.set(i.id, i.name);
      if (i.recipeUnknown) unverified.set(i.id, `${i.name} (${i.id}, L${i.level}, ${i.source.text})`);
      const near = strong
        .filter((o) => o.item.id !== i.id && Math.abs(o.item.level - i.level) <= 3)
        .sort((a, b) => b.ep - a.ep)
        .slice(0, 3);
      for (const o of near) {
        shortlist.add(o.item.id);
        if (!o.item.source || o.item.recipePending) missingSources.add(o.item.id);
        if (o.proc.unmodeled) flagged.set(o.item.id, o.item.name);
      }
      const faction = i.faction && i.faction !== 'Both' ? i.faction : 'Both';
      const w = i.weapon ? ` ${weaponType(i)} ${i.weapon.speed}` : '';
      report.push(
        `| ${i.level} | [${i.name}](https://www.wowhead.com/forever/item=${i.id}) (${i.id})${w}${flag(s)} | ${s.ep.toFixed(0)} | ${s.proc.ep ? s.proc.ep.toFixed(0) : ''} | ${(s.ep / base[i.level]).toFixed(2)}× | ${i.source?.text ?? '?'} | ${faction} | ${near.map((o) => `${o.item.name} (${o.item.id}, ${o.item.level}, ${(o.ep / base[o.item.level]).toFixed(2)}×${flag(o)})`).join('; ')} |`,
      );
      if (i.source && accessible(i)) {
        const out = curation.source?.[i.id] ?? i.source.text;
        const entry = { level: i.level, slot: role.slot, itemId: i.id, name: i.name, quality: QUALITY[i.quality], source: out, faction: i.faction ?? 'Both' };
        if (!emitted[build.key].some((e) => e.itemId === i.id && e.slot === role.slot)) emitted[build.key].push(entry);
      }
    }

    // Pins: did the items the curator expects to matter land where they should?
    for (const p of pins) {
      const s = scored.find((o) => o.item.id === p.id);
      if (!s) continue;
      const better = scored.filter((o) => o.item.level <= s.item.level + 3 && o.item.level >= s.item.level - 3 && o.ep > s.ep && accessible(o.item)).length;
      pinReport.push(
        `| ${build.key} | ${role.key} | ${s.item.name} (${p.id}) | ${s.item.level} | ${s.ep.toFixed(0)} (proc ${s.proc.ep.toFixed(0)}${s.proc.assumed ? ', assumed rate' : ''}) | ${(s.ep / base[Math.min(60, s.item.level)]).toFixed(2)}× | ${chosen.has(p.id) ? 'picked' : `not picked: ${s.item.source && !accessible(s.item) ? `source isn't chaseable (${s.item.source.text})` : !s.item.source ? 'no source yet' : s.ep < MIN_RATIO[role.group] * base[Math.min(60, s.item.level)] ? 'under the green baseline' : `${better} better within ±3 levels, or the cadence rule`}`} | ${p.why ?? ''} |`,
      );
    }
  }
}

// Manual includes go in as written, for the builds that can use them.
for (const inc of curation.include ?? []) for (const key of inc.builds ?? Object.keys(emitted)) emitted[key].push(inc.item);

const header = [
  `# Leveling gear research report`,
  ``,
  `Generated ${new Date().toISOString().slice(0, 16)}Z from ${Object.keys(cache.items).length} cached items (scanned ${cache.scannedAt?.slice(0, 10)}), ${Object.keys(procData).length} with proc or use data.`,
  `EP uses each build's own weights from the Handbook. "vs green" is EP over the typical fixed-stat green at that level. In the tables: ~ = on-hit rate assumed (${DEFAULT_PPM} PPM), ⚠ = has an effect the model can't value (scored 0).`,
  missingSources.size ? `\n**${missingSources.size} items still need sources:** run \`node scripts/gear-research/sources.mjs\`, then rerun this.` : '',
  pinReport.length ? `\n### Pinned items\n\n| Build | Slot | Item | Lvl | EP | vs green | Result | Why pinned |\n|---|---|---|---|---|---|---|---|\n${pinReport.join('\n')}` : '',
  blocked.size ? `\n### Strong items kept out: not available at launch (or an unconfirmed epic)\n\nAllow an epic with \`allowEpic\` in curation.json; remove a zone from \`notAtLaunch\` when it opens.\n\n${[...blocked.values()].sort().map((t) => `- ${t}`).join('\n')}` : '',
  unverified.size ? `\n### Crafted picks whose recipe source Wowhead doesn't list\n\nUsually new Forever recipes. Check each in game or on Wowhead; \`exclude\` any that aren't obtainable.\n\n${[...unverified.values()].sort().map((t) => `- ${t}`).join('\n')}` : '',
  flagged.size ? `\n### Picks and runners-up with effects the model can't value\n\n${[...flagged].map(([id, n]) => `- [${n}](https://www.wowhead.com/forever/item=${id})`).join('\n')}` : '',
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
  // Tag bind-on-equip items so the Handbook can mark them; everything else stays untagged.
  for (const k of Object.keys(emitted)) for (const e of emitted[k]) if (cache.items[e.itemId]?.bind === 'BoE') e.boe = true;
  for (const k of Object.keys(emitted)) emitted[k].sort((a, b) => a.level - b.level || a.slot.localeCompare(b.slot));
  // Builds without stat weights yet keep the list they have.
  const previous = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')).builds : {};
  const all = { ...previous, ...emitted };
  writeFileSync(out, `${JSON.stringify({ generated: new Date().toISOString().slice(0, 10), builds: all }, null, 2)}\n`);
  console.log(`Wrote src/content/leveling-gear.json: ${Object.entries(emitted).map(([k, v]) => `${k} ${v.length}`).join(', ')}.`);
}
