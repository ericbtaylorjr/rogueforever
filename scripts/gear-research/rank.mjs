#!/usr/bin/env node
/**
 * Scores every Rogue-usable item in the Forever database for each leveling build, picks the
 * milestone upgrades per slot and faction, and writes a report (see README.md here).
 *
 *   node scripts/gear-research/rank.mjs            # report, picks, and the lookups still needed
 *   node scripts/gear-research/rank.mjs --emit     # also write src/content/leveling-gear.json
 *
 * Exit codes: 0 done; 3 lookups.mjs has work to do first (the picks so far are provisional);
 * 4 --emit refused because a check failed (the report lists which).
 *
 * Method:
 *  1. EP per item, per leveling build, from that build's own stat weights (weights.mjs reads
 *     them from src/content/builds), in Attack Power units. The database gives stats in
 *     rating points, the same unit as the weights, so there is no conversion. Weapons add
 *     their damage (main hand heavily, favouring slower weapons for the builds that hit with
 *     weapon damage; off hand less). Procs and use effects are valued as damage per second or
 *     an average stat, then EP. Random-suffix items ("of the Tiger") count as the average of
 *     the suffixes useful to the build, and are tagged.
 *  2. A baseline per slot and level: what a typical fixed-stat green gives there.
 *  3. Per slot and faction, pick the upgrades that add the most "better than green" over
 *     levels 10–58 (each pick has a small cost, and picks sit a minimum number of levels apart).
 *  4. Fill gaps: no slot goes more than MAX_GAP levels without a recommendation, using the best
 *     item that is still an upgrade. A gap with no such item is reported, not papered over.
 *  5. Checks before --emit: both weapon families where a build uses both, every pick's Wowhead
 *     link status known, no lookups pending.
 *
 * Hand corrections live in curation.json so a rerun keeps them. Tune the knobs below, not the code.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadDb } from './forever.mjs';
import { buildCandidates, QUALITY, ROGUE_STATS } from './items.mjs';
import { readLookups } from './lookups.mjs';
import { buildTooltip } from './tooltip.mjs';
import { loadBuildWeights, STAT_IDS } from './weights.mjs';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const readJson = (p, fallback) => (existsSync(here(p)) ? JSON.parse(readFileSync(here(p), 'utf8')) : fallback);
const emit = process.argv.includes('--emit');
/** `--debug "combat/questing|Head"` prints every scored candidate for one build and slot, to see why a gap exists. */
const debugArg = process.argv.includes('--debug') ? process.argv[process.argv.indexOf('--debug') + 1] : undefined;

const curation = readJson('./curation.json');
const procData = readJson('./cache/procs.json', { items: {} }).items;
const recipes = readJson('./cache/recipes.json', {});
const lookups = readLookups();
const wowhead = readJson('./cache/wowhead.json', {});
const forever = readJson('./cache/forever.json', {});
const builds = loadBuildWeights();
const { db } = loadDb();
const { items } = buildCandidates({ db, curation, recipes, lookups });
const byId = new Map(items.map((i) => [i.id, i]));

// ---------------------------------------------------------------- knobs

/** Stamina counts for a little in leveling even though the sim gives it ~0 (survival): the floor under a build's own weight. */
const STAMINA_EP = 0.1;
/** EP per point of weapon DPS by hand. Ranged only matters for pulling. */
const DPS_EP = { main: 20, off: 9, ranged: 1 };

// Proc model (see README "Procs"). Everything is converted to damage per second, then to EP.
/** Procs per minute for an on-hit effect the database gives no rate for (the classic default for "Chance on hit"). */
const DEFAULT_PPM = 1;
/** An extra attack is a full white swing, which also carries Attack Power: weapon average × this. */
const EXTRA_ATTACK_FACTOR = 1.3;
/** Flat proc and use damage doesn't scale with abilities or crit like weapon DPS does; it counts at this share of a main-hand DPS point. */
const FLAT_DAMAGE_SHARE = 0.85;
/** Resists and misses shave a little off magic proc damage. */
const MAGIC_DAMAGE_TAKEN = 0.9;
/** EP per 1% of melee haste or damage (used for the rare "+% attack speed" effects). */
const PCT_DAMAGE_EP = 12;
/** Hit and crit ratings per 1% (the sim's own level 60 constants), for effects that grant a percentage. */
const RATING_PER_PCT = { hit: 10, crit: 14 };
/** Main-hand speed the "speed bonus" is measured against, per weapon family. */
const REFERENCE_SPEED = { slow: 2.4, dagger: 1.7 };
/** Swing speed assumed for an on-hit effect on something that isn't a weapon (a ring or trinket). */
const NON_WEAPON_SWING = 2;

/** A random-suffix item counts only if at least this share of its suffixes help the build. */
const MIN_USEFUL_SUFFIX_SHARE = 0.34;

/** First level the list covers; below it greens barely have stats, so everything looks like an upgrade. */
const MIN_LEVEL = 10;
/** Last level the leveling list covers; items needing 59–60 belong to pre-raid BiS. */
const MAX_LEVEL = 58;
/** Picks keep earning value until 60: a level 58 item is worn for the last levels, not just one. */
const WORN_UNTIL = 60;
/** The most levels a slot may go without a recommendation (the list aims for one every 5–6). */
const MAX_GAP = 6;
/** A gap filler sits at least this many levels from its neighbours. */
const MIN_STEP = 2;
/** Selection weight of an item only one faction can get, against items both can: the neutral item wins unless the exclusive one is clearly better. */
const FACTION_ONLY_DISCOUNT = 0.92;
/** A gap filler only has to match a typical green at its level (it still has to be an upgrade over the pick before it). */
const FILL_RATIO = 1.0;
/** An item must beat the green baseline at its level by this much to be considered. Weapons differ less (mostly DPS). */
const MIN_RATIO = { weapon: 1.05, major: 1.1, minor: 1.1, trinket: 1.1 };

/** Per slot group: minimum levels between picks, and the cost of one pick (in "levels × fraction better than green"). */
const CADENCE = {
  weapon: { gap: 4, cost: 0.25 },
  major: { gap: 5, cost: 0.5 },
  minor: { gap: 5, cost: 0.6 },
  trinket: { gap: 5, cost: 0.6 },
};
const SLOT_GROUP = {
  Head: 'major', Shoulders: 'major', Chest: 'major', Legs: 'major', Hands: 'major',
  Neck: 'minor', Back: 'minor', Wrists: 'minor', Waist: 'minor', Feet: 'minor', Ring: 'minor', Ranged: 'minor',
  Trinket: 'trinket',
};

// ---------------------------------------------------------------- scoring

const FACTIONS = ['Alliance', 'Horde'];
const clampLevel = (l) => Math.min(60, Math.max(1, l));
const dpsEp = (build) => ({ ...DPS_EP, ...(curation.dpsEp?.[build.key] ?? {}) });
const weightsOf = (build) => ({ ...build.weights, sta: Math.max(build.weights.sta ?? 0, STAMINA_EP) });
const KEY_BY_ID = Object.fromEntries(Object.entries(STAT_IDS).map(([k, id]) => [id, k]));

function statsEP(stats, w, ranged) {
  let ep = 0;
  for (const [k, v] of Object.entries(stats)) ep += v * (k === 'rap' ? (ranged ? w.ap ?? 0 : 0) : w[k] ?? 0);
  return ep;
}

/** Extra EP from a random suffix: the average over the suffixes that help this build, and how many do. */
function suffixEP(item, w) {
  const opts = item.suffixOptions;
  if (!opts?.length) return { gain: 0, share: 1 };
  const useful = opts.map((o) => ({ gain: statsEP(o.stats, w, item.cls === 'ranged'), real: statsEP({ ...o.stats, sta: 0 }, w, item.cls === 'ranged') })).filter((o) => o.real > 0);
  return { gain: useful.length ? useful.reduce((a, o) => a + o.gain, 0) / useful.length : 0, share: useful.length / opts.length, useful: useful.length, total: opts.length };
}

/**
 * What an item's on-hit and use effects are worth, in EP for one build: each effect becomes
 * damage per second (or an average stat), then EP. `assumed` marks a rate the database
 * doesn't give; `unmodeled` counts effects this model can't value (they score 0).
 */
function procEP(item, build, w) {
  const effects = procData[item.id];
  const out = { ep: 0, assumed: false, unmodeled: 0 };
  if (!effects) return out;
  const dps = dpsEp(build);
  const swing = item.weapon?.speed ?? NON_WEAPON_SWING;
  const avgHit = item.weapon ? (item.weapon.min + item.weapon.max) / 2 : 0;
  for (const e of effects) {
    let perSec = 0;
    if (e.trigger === 'onHit') {
      if (curation.ppm?.[item.id] !== undefined) perSec = curation.ppm[item.id] / 60;
      else if (e.rate.ppm !== undefined) perSec = e.rate.ppm / 60;
      else if (e.rate.chance !== undefined) perSec = e.rate.chance / swing;
      else ((perSec = DEFAULT_PPM / 60), (out.assumed = true));
    } else if (e.trigger === 'use' && e.cooldown > 0) perSec = 1 / e.cooldown;
    const uptimeOf = (duration) => (e.trigger === 'equip' ? 1 : Math.min(1, perSec * duration));
    for (const f of e.effects) {
      if (f.kind === 'extraAttack') out.ep += perSec * f.count * avgHit * EXTRA_ATTACK_FACTOR * dps.main;
      else if (f.kind === 'damage') out.ep += perSec * f.amount * MAGIC_DAMAGE_TAKEN * dps.main * FLAT_DAMAGE_SHARE;
      else if (f.kind === 'stats') {
        const uptime = uptimeOf(f.duration);
        for (const [id, amount] of Object.entries(f.stats)) out.ep += amount * uptime * (w[KEY_BY_ID[id]] ?? 0);
      } else if (f.kind === 'buff' && f.amount > 0) {
        const key = f.stat === 'critPct' ? 'crit' : f.stat === 'hitPct' ? 'hit' : f.stat;
        const perPoint = f.stat === 'critPct' || f.stat === 'hitPct' ? RATING_PER_PCT[key] : 1;
        out.ep += f.amount * perPoint * uptimeOf(f.duration) * (w[key] ?? 0);
      } else if (f.kind === 'haste' && f.pct > 0) out.ep += f.pct * uptimeOf(f.duration) * PCT_DAMAGE_EP;
      else if (f.kind === 'buff' || f.kind === 'haste') continue; // a debuff on the target, not a gain
      else out.unmodeled++;
    }
  }
  return out;
}

/** Score for one role and build, `{ ep, proc, suffix }`; `null` when the item can't fill it. */
function scoreFor(item, role, build, w) {
  const dps = dpsEp(build);
  const base = (extra = 0) => {
    const suffix = suffixEP(item, w);
    if (item.suffixOptions && suffix.share < MIN_USEFUL_SUFFIX_SHARE) return null;
    const proc = procEP(item, build, w);
    return { ep: statsEP(item.stats, w, item.cls === 'ranged') + suffix.gain + proc.ep + extra, proc, suffix };
  };
  switch (role.hand) {
    case 'armor':
      return item.cls === 'armor' && item.slot === role.slot ? base() : null;
    case 'ranged':
      return item.cls === 'ranged' ? base((item.weapon?.dps ?? 0) * dps.ranged) : null;
    case 'main': {
      if (item.cls !== 'weapon' || !['Main hand', 'One-hand'].includes(item.slot) || !role.types.includes(item.wtype)) return null;
      const speedBonus = role.family === 'slow' ? 0.7 + 0.3 * (item.weapon.speed / REFERENCE_SPEED.slow) : role.family === 'dagger' ? 0.7 + 0.3 * (item.weapon.speed / REFERENCE_SPEED.dagger) : 1;
      return base(item.weapon.dps * dps.main * speedBonus);
    }
    case 'off': {
      if (item.cls !== 'weapon' || !['Off hand', 'One-hand'].includes(item.slot) || !role.types.includes(item.wtype)) return null;
      return base(item.weapon.dps * dps.off);
    }
  }
}

const ARMOR_SLOTS = ['Head', 'Neck', 'Shoulders', 'Back', 'Chest', 'Wrists', 'Hands', 'Waist', 'Legs', 'Feet', 'Ring', 'Trinket'];
const MELEE = ['Sword', 'Axe', 'Mace', 'Fist Weapon', 'Dagger'];
/**
 * Which weapons each build's rotation needs: Mutilate wants a dagger in each hand; Backstab
 * and Ambush a dagger in the main hand; Sinister Strike (Combat Questing and Dungeons) a slow
 * main hand. Subtlety Questing and Dungeons swap weapons, so they get both a dagger list and a
 * slow list, each picked, spaced and gap-filled on its own.
 */
const MAIN = {
  dagger: { key: 'Main hand', hand: 'main', slot: 'Main hand', family: 'dagger', types: ['Dagger'], group: 'weapon' },
  slow: { key: 'Main hand', hand: 'main', slot: 'Main hand', family: 'slow', types: ['Sword', 'Axe', 'Mace', 'Fist Weapon'], group: 'weapon' },
};
const OFF = {
  dagger: { key: 'Off hand', hand: 'off', slot: 'Off hand', family: 'dagger', types: ['Dagger'], group: 'weapon' },
  any: { key: 'Off hand', hand: 'off', slot: 'Off hand', family: 'any', types: MELEE, group: 'weapon' },
};
const WEAPONS = {
  'assassination/questing': [MAIN.dagger, OFF.dagger],
  'assassination/dungeons': [MAIN.dagger, OFF.dagger],
  'combat/questing': [MAIN.slow, OFF.any],
  'combat/dungeons': [MAIN.slow, OFF.any],
  'subtlety/questing': [MAIN.dagger, MAIN.slow, OFF.any],
  'subtlety/dungeons': [MAIN.dagger, MAIN.slow, OFF.any],
};
const rolesFor = (build) => [
  ...ARMOR_SLOTS.map((slot) => ({ key: slot, hand: 'armor', slot, group: SLOT_GROUP[slot] })),
  { key: 'Ranged', hand: 'ranged', slot: 'Ranged', group: 'minor' },
  ...WEAPONS[build.key],
];

// ---------------------------------------------------------------- baseline

/** Median EP of fixed-stat Rogue greens a few levels either side, made non-decreasing. */
function baselineCurve(scored, weapons) {
  const greens = scored.filter((s) => s.item.quality === 2 && !s.item.suffixOptions && (weapons || ROGUE_STATS.some((k) => s.item.stats[k])));
  const curve = [];
  for (let l = 1; l <= 60; l++) {
    const near = greens.filter((s) => Math.abs(s.item.level - l) <= 3).map((s) => s.ep).sort((a, b) => a - b);
    curve[l] = near.length >= 3 ? near[Math.floor(near.length / 2)] : undefined;
  }
  // Fill gaps by interpolation, then make it monotonic so a dip never makes an item look better.
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

/**
 * Closes gaps longer than MAX_GAP levels between picks (and from level 10 to the first, and from
 * the last to 58) with the strongest item that is still an upgrade: stronger than the pick
 * before it and weaker than the one after, so the list stays a chain of upgrades. Paired slots
 * (rings, trinkets) only need the item to beat the green baseline. Gaps nothing can fill are returned.
 */
function fillGaps(picks, pool, base, paired) {
  const out = [...picks].sort((a, b) => a.item.level - b.item.level);
  const used = new Set(out.map((s) => s.item.id));
  const stuck = new Set();
  const unfilled = [];
  const need = FILL_RATIO;
  for (let guard = 0; guard < 80; guard++) {
    const seq = [{ item: { level: MIN_LEVEL }, ep: 0, start: true }, ...out, { item: { level: MAX_LEVEL }, ep: Infinity, end: true }];
    let gap;
    for (let k = 1; k < seq.length; k++) {
      const a = seq[k - 1], b = seq[k];
      if (b.item.level - a.item.level > MAX_GAP && !stuck.has(`${a.item.level}-${b.item.level}`)) {
        gap = [a, b];
        break;
      }
    }
    if (!gap) break;
    const [a, b] = gap;
    const lo = a.start ? MIN_LEVEL : a.item.level + MIN_STEP;
    const hi = b.end ? MAX_LEVEL : b.item.level - MIN_STEP;
    const fits = (s, to) => !used.has(s.item.id) && s.item.level >= lo && s.item.level <= to && s.ep >= need * base[clampLevel(s.item.level)] && (paired || (s.ep > a.ep && s.ep < b.ep));
    const top = (list) => list.sort((x, y) => y.ep - x.ep || y.item.level - x.item.level)[0];
    // Prefer one that closes the gap in a single step, otherwise anything that splits it.
    const pick = top(pool.filter((s) => fits(s, Math.min(a.item.level + MAX_GAP, hi)))) ?? top(pool.filter((s) => fits(s, hi)));
    if (!pick) {
      stuck.add(`${a.item.level}-${b.item.level}`);
      unfilled.push({ from: a.item.level, to: b.item.level });
      continue;
    }
    used.add(pick.item.id);
    pick.filler = true;
    out.push(pick);
    out.sort((x, y) => x.item.level - y.item.level);
  }
  return { picks: out, unfilled };
}

// ---------------------------------------------------------------- run

const report = [];
const emitted = {};
const chosenAll = []; // every pick, for links.mjs
const needed = { items: new Set(), quests: new Set(), recipes: new Set(), vendors: new Set() };
const flagged = new Map(); // id → name, for effects the model can't value
const unverified = new Map(); // crafted picks whose recipe source Wowhead doesn't list
const keptOut = new Map(); // id → why: strong items that aren't available
const coverage = []; // table rows
const problems = [];
const warnings = [];
const pinReport = [];
const pins = curation.pins ?? [];
const suffixPicks = new Map();

for (const pin of pins) if (!byId.has(pin.id)) warnings.push(`Pinned item ${pin.id}${pin.why ? ` (${pin.why.split(':')[0]})` : ''} isn't a Rogue-usable item in the database, so the pin does nothing yet.`);

for (const build of builds) {
  emitted[build.key] = [];
  const w = weightsOf(build);
  report.push(`\n# ${build.key}\n`);
  report.push(`Weights: ${Object.entries(w).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  /** Main-hand picks, so this build's off hand gets a different weapon. */
  const mainHandPicks = new Set();
  const familyPicks = {};

  for (const role of rolesFor(build)) {
    const scored = items
      .map((item) => {
        const r = scoreFor(item, role, build, w);
        return r && r.ep > 0 ? { item, ep: r.ep, proc: r.proc, suffix: r.suffix } : null;
      })
      .filter(Boolean);
    const base = baselineCurve(scored, role.group === 'weapon');
    if (debugArg === `${build.key}|${role.key}`) {
      for (const s of [...scored].sort((a, b) => a.item.level - b.item.level)) {
        if (s.item.level < MIN_LEVEL || s.item.level > MAX_LEVEL) continue;
        console.log(`L${s.item.level} ${(s.ep / base[clampLevel(s.item.level)]).toFixed(2)}× ep ${s.ep.toFixed(0)} ${s.item.name} (${s.item.id}) q${s.item.quality} ${s.item.faction ?? 'unavailable: ' + (s.item.dropped[0] ?? (s.item.hasSource ? 'source not chaseable' : 'no source'))}${s.item.suffixOptions ? ' [suffix ' + s.suffix.useful + '/' + s.suffix.total + ']' : ''} ${JSON.stringify(s.item.stats)}`);
      }
    }
    const ratio = (s) => s.ep / base[clampLevel(s.item.level)];
    const taken = (s) => role.hand === 'off' && mainHandPicks.has(s.item.id);
    const forced = new Set(pins.filter((p) => p.force !== false && (!p.roles || p.roles.includes(role.key)) && (!p.builds || p.builds.includes(build.key))).map((p) => p.id));
    const strongEnough = (s) => ratio(s) >= MIN_RATIO[role.group];
    const available = (s) => FACTIONS.some((f) => s.item.avail[f]);
    const strong = scored.filter((s) => forced.has(s.item.id) || (strongEnough(s) && available(s) && !taken(s) && s.item.level <= MAX_LEVEL));

    for (const s of scored) {
      const i = s.item;
      if (i.level >= MIN_LEVEL && i.level <= MAX_LEVEL && strongEnough(s) && !available(s) && !forced.has(i.id))
        keptOut.set(i.id, `${i.name} (${i.id}, L${i.level}, ${role.key}): ${i.dropped[0] ?? (i.hasSource ? 'not a chaseable source' : 'no source in the database yet')}`);
    }
    // What still needs a Wowhead lookup before the picks can be trusted.
    for (const s of strong) {
      const i = s.item;
      if (i.needsLevelLookup) needed.items.add(i.id);
      for (const f of FACTIONS) {
        const o = i.avail[f];
        if (o?.kind === 'quest' && lookups.quests?.[o.questId] === undefined) needed.quests.add(o.questId);
      }
      for (const rid of i.pendingRecipes) needed.recipes.add(rid);
      if (i.needsVendorLookup) needed.vendors.add(i.id);
    }

    const cadence = CADENCE[role.group];
    const paired = role.slot === 'Ring' || role.slot === 'Trinket';
    const passes = paired ? 2 : 1;
    /** One faction's picks for this role: the best chain of upgrades, then gap-filled. */
    const picksFor = (faction) => {
      // Items only this faction can get count a little less, so the neutral item wins unless the exclusive one is clearly better.
      const pool = strong.filter((s) => s.item.avail[faction]).map((s) => ({ ...s, real: s.ep, ep: s.ep * (s.item.faction === 'Both' ? 1 : FACTION_ONLY_DISCOUNT) }));
      let rest = pool;
      let picks = [];
      for (let p = 0; p < passes; p++) {
        const got = choose(rest, base, cadence);
        picks.push(...got);
        const used = new Set(got.map((s) => s.item.id));
        rest = rest.filter((s) => !used.has(s.item.id));
      }
      // Pinned items go in regardless of what the model thinks (unless a pin says force: false).
      for (const s of pool) if (forced.has(s.item.id) && !picks.some((x) => x.item.id === s.item.id)) picks.push(s);
      // Gap fillers may come from any available item at least as good as a typical green, not only the strong ones.
      const everything = scored
        .filter((s) => s.item.avail[faction] && !taken(s) && s.item.level >= MIN_LEVEL && s.item.level <= MAX_LEVEL)
        .map((s) => ({ ...s, real: s.ep, ep: s.ep * (s.item.faction === 'Both' ? 1 : FACTION_ONLY_DISCOUNT) }));
      return fillGaps(picks, everything, base, paired);
    };

    const chosen = new Map(); // id → { s, pickedBy: Set }
    const unfilled = {};
    for (const faction of FACTIONS) {
      const { picks, unfilled: gaps } = picksFor(faction);
      unfilled[faction] = gaps;
      for (const s of picks) {
        const entry = chosen.get(s.item.id) ?? { s, pickedBy: new Set() };
        entry.pickedBy.add(faction);
        entry.s = entry.s.real !== undefined ? entry.s : s;
        chosen.set(s.item.id, entry);
      }
    }

    const rows = [...chosen.values()].sort((a, b) => a.s.item.level - b.s.item.level);
    const label = `${role.key}${role.hand === 'main' ? ` (${role.family})` : ''}`;
    // Effective list per faction: what that faction's reader sees (items labelled for them or both).
    const sees = (f) => rows.filter(({ s }) => s.item.avail[f]).map(({ s }) => s.item.level).sort((a, b) => a - b);
    const gapsOf = (levels) => {
      const seq = [MIN_LEVEL, ...levels, MAX_LEVEL];
      const out = [];
      for (let k = 1; k < seq.length; k++) if (seq[k] - seq[k - 1] > MAX_GAP) out.push(`${seq[k - 1]}→${seq[k]}`);
      return out;
    };
    const seenA = sees('Alliance'), seenH = sees('Horde');
    coverage.push({ build: build.key, label, a: seenA.length, h: seenH.length, gapsA: gapsOf(seenA), gapsH: gapsOf(seenH), candidates: strong.length });
    if (!rows.length && strong.length) problems.push(`${build.key} · ${label}: ${strong.length} candidates but no picks`);
    if (role.hand === 'main') familyPicks[role.family] = rows.length;

    report.push(`\n## ${build.key} · ${label}\n`);
    report.push('| Lvl | Item | EP | of which proc | vs green | Source | Faction | Runners-up (±3 lvls) |');
    report.push('|---|---|---|---|---|---|---|---|');
    const flag = (s) => (s.proc.unmodeled ? ' ⚠' : s.proc.assumed ? ' ~' : '');
    for (const { s } of rows) {
      const i = s.item;
      const real = s.real ?? s.ep;
      if (role.hand === 'main') mainHandPicks.add(i.id);
      if (s.proc.unmodeled) flagged.set(i.id, i.name);
      if (i.recipeUnknown) unverified.set(i.id, `${i.name} (${i.id}, L${i.level}, ${(i.avail.Alliance ?? i.avail.Horde).text})`);
      if (i.suffixOptions) suffixPicks.set(i.id, `${i.name} (${i.id}, ${s.suffix.useful}/${s.suffix.total} suffixes help)`);
      const near = strong.filter((o) => o.item.id !== i.id && Math.abs(o.item.level - i.level) <= 3).sort((a, b) => b.ep - a.ep).slice(0, 3);
      for (const o of near) if (o.proc.unmodeled) flagged.set(o.item.id, o.item.name);
      const srcA = i.avail.Alliance?.text, srcH = i.avail.Horde?.text;
      const src = srcA && srcH && srcA !== srcH ? `${srcA} / ${srcH}` : srcA ?? srcH;
      const wt = i.wtype && i.cls !== 'armor' ? ` ${i.wtype} ${i.weapon?.speed ?? ''}` : '';
      const tags = `${flag(s)}${i.suffixOptions ? ' 🎲' : ''}${s.filler ? ' ↔' : ''}`;
      report.push(
        `| ${i.level} | [${i.name}](https://www.wowhead.com/forever/item=${i.id}) (${i.id})${wt}${tags} | ${real.toFixed(0)} | ${s.proc.ep ? s.proc.ep.toFixed(0) : ''} | ${(real / base[clampLevel(i.level)]).toFixed(2)}× | ${src} | ${i.faction} | ${near.map((o) => `${o.item.name} (${o.item.id}, ${o.item.level}, ${(o.ep / base[clampLevel(o.item.level)]).toFixed(2)}×${flag(o)})`).join('; ')} |`,
      );
      chosenAll.push({ itemId: i.id, build: build.key, slot: role.slot });
      // One entry per item; where the two factions reach it from different places it is two entries, one each.
      const suffixTag = i.suffixOptions ? ' · random suffix' : '';
      const mk = (faction, text) => {
        const e = { level: i.level, slot: role.slot, itemId: i.id, name: i.name, quality: QUALITY[i.quality], source: `${curation.source?.[i.id] ?? text}${suffixTag}`, faction };
        const wh = wowhead[i.id];
        if (wh?.boe) e.boe = true;
        if (wh && !wh.found) Object.assign(e, { noWowhead: true, icon: i.icon, tooltip: buildTooltip(i) });
        return e;
      };
      const entries = i.faction === 'Both' && srcA !== srcH ? [mk('Alliance', srcA), mk('Horde', srcH)] : [mk(i.faction, srcA ?? srcH)];
      for (const e of entries) if (!emitted[build.key].some((x) => x.itemId === e.itemId && x.slot === e.slot && x.faction === e.faction)) emitted[build.key].push(e);
    }

    // Pins: did the items the curator expects to matter land where they should?
    for (const p of pins) {
      const s = scored.find((o) => o.item.id === p.id);
      if (!s) continue;
      const better = scored.filter((o) => Math.abs(o.item.level - s.item.level) <= 3 && o.ep > s.ep && available(o)).length;
      pinReport.push(
        `| ${build.key} | ${label} | ${s.item.name} (${p.id}) | ${s.item.level} | ${s.ep.toFixed(0)} (proc ${s.proc.ep.toFixed(0)}${s.proc.assumed ? ', assumed rate' : ''}) | ${ratio(s).toFixed(2)}× | ${chosen.has(p.id) ? 'picked' : `not picked: ${!available(s) ? `no chaseable source (${s.item.dropped[0] ?? 'none in the database'})` : !strongEnough(s) ? 'under the green baseline' : `${better} better within ±3 levels, or the cadence rule`}`} | ${p.why ?? ''} |`,
      );
    }
  }
  // Builds that use both weapon families need picks in both.
  if (WEAPONS[build.key].filter((r) => r.hand === 'main').length > 1) for (const [fam, n] of Object.entries(familyPicks)) if (!n) problems.push(`${build.key}: no ${fam} main-hand picks, but the build uses both weapon families`);
}

// Manual includes go in as written, for the builds that can use them.
for (const inc of curation.include ?? []) for (const key of inc.builds ?? Object.keys(emitted)) emitted[key].push(inc.item);

// ---------------------------------------------------------------- checks and output

const pendingTotal = needed.items.size + needed.quests.size + needed.recipes.size;
const neededOut = { items: [...needed.items].filter((id) => !lookups.items[id]), quests: [...needed.quests], recipes: [...needed.recipes].filter((id) => !lookups.recipes[id]), vendors: [...needed.vendors] };
writeFileSync(here('./cache/lookups-needed.json'), JSON.stringify(neededOut));
const pending = neededOut.items.length + neededOut.quests.length + neededOut.recipes.length + neededOut.vendors.length;
const unchecked = [...new Set(chosenAll.map((c) => c.itemId))].filter((id) => !wowhead[id]);
writeFileSync(here('./cache/picks.json'), JSON.stringify(chosenAll));
if (emit && unchecked.length) problems.push(`${unchecked.length} picks have no Wowhead link check yet (run links.mjs): ${unchecked.slice(0, 12).join(', ')}${unchecked.length > 12 ? '…' : ''}`);

const unlinked = [...new Set(chosenAll.map((c) => c.itemId))].filter((id) => wowhead[id] && !wowhead[id].found);
const gapRows = coverage.filter((c) => c.gapsA.length || c.gapsH.length);
const levelFrom = {};
for (const id of new Set(chosenAll.map((c) => c.itemId))) levelFrom[byId.get(id).levelFrom] = (levelFrom[byId.get(id).levelFrom] ?? 0) + 1;
const header = [
  `# Leveling gear research report`,
  ``,
  `Generated ${new Date().toISOString().slice(0, 16)}Z from the Forever database: master ${forever.head?.slice(0, 10) ?? '?'} (${forever.headDate?.slice(0, 10) ?? '?'}), database last changed ${forever.dbDate?.slice(0, 10) ?? '?'}; ${db.items.length} items, ${items.length} Rogue-usable candidates, ${Object.keys(procData).length} with proc or use data.`,
  `EP uses each build's own weights from the Handbook (Stamina floored at ${STAMINA_EP}). "vs green" is EP over the typical fixed-stat green at that level. In the tables: ~ = on-hit rate assumed (${DEFAULT_PPM} PPM), ⚠ = has an effect the model can't value (scored 0), 🎲 = random-suffix item (average of the suffixes that help), ↔ = gap filler.`,
  `Levels come from: ${Object.entries(levelFrom).map(([k, v]) => `${k} ${v}`).join(', ')}.`,
  pending ? `\n**Lookups pending (${neededOut.items.length} item levels, ${neededOut.quests.length} quests, ${neededOut.recipes.length} recipes, ${neededOut.vendors.length} vendor items):** run \`node scripts/gear-research/lookups.mjs\`, then rerun this. The picks below are provisional.` : '',
  problems.length ? `\n### Problems (these stop --emit)\n\n${problems.map((t) => `- ${t}`).join('\n')}` : '',
  warnings.length ? `\n### Warnings\n\n${warnings.map((t) => `- ${t}`).join('\n')}` : '',
  `\n### Coverage\n\nA recommendation at least every ${MAX_GAP} levels from ${MIN_LEVEL} to ${MAX_LEVEL}. Picks each faction sees per slot; gaps are stretches no qualifying upgrade could fill.\n\n| Build | Slot | Alliance | Horde | Gaps (Alliance) | Gaps (Horde) |\n|---|---|---|---|---|---|\n${coverage.map((c) => `| ${c.build} | ${c.label} | ${c.a} | ${c.h} | ${c.gapsA.join(', ') || '·'} | ${c.gapsH.join(', ') || '·'} |`).join('\n')}`,
  pinReport.length ? `\n### Pinned items\n\n| Build | Slot | Item | Lvl | EP | vs green | Result | Why pinned |\n|---|---|---|---|---|---|---|---|\n${pinReport.join('\n')}` : '',
  unlinked.length ? `\n### Picks Wowhead doesn't list yet (shown with a tooltip, no link)\n\n${unlinked.map((id) => `- ${byId.get(id).name} (${id})`).join('\n')}` : '',
  suffixPicks.size ? `\n### Random-suffix picks\n\nScored as the average of the suffixes that help the build; you can't choose the suffix.\n\n${[...suffixPicks.values()].sort().map((t) => `- ${t}`).join('\n')}` : '',
  keptOut.size ? `\n### Strong items kept out: not available (or an unconfirmed epic)\n\nAllow an epic with \`allowEpic\` in curation.json; remove a zone from \`notAtLaunch\` when it opens.\n\n${[...keptOut.values()].sort().map((t) => `- ${t}`).join('\n')}` : '',
  unverified.size ? `\n### Crafted picks whose recipe source Wowhead doesn't list\n\nUsually new Forever recipes. Check each in game or on Wowhead; \`exclude\` any that aren't obtainable.\n\n${[...unverified.values()].sort().map((t) => `- ${t}`).join('\n')}` : '',
  flagged.size ? `\n### Picks and runners-up with effects the model can't value\n\n${[...flagged].map(([id, n]) => `- [${n}](https://www.wowhead.com/forever/item=${id})`).join('\n')}` : '',
];
writeFileSync(here('./cache/report.md'), [...header, ...report].join('\n') + '\n');
console.log(`Report: scripts/gear-research/cache/report.md (${new Set(chosenAll.map((c) => c.itemId)).size} distinct picks, ${gapRows.length} slots with a gap, ${pending} lookups pending).`);
for (const p of problems) console.log(`  problem: ${p}`);

if (pending) {
  console.log(`Lookups needed: ${neededOut.items.length} item levels, ${neededOut.quests.length} quests, ${neededOut.recipes.length} recipes, ${neededOut.vendors.length} vendor items → run lookups.mjs.`);
  if (emit) process.exit(3);
  process.exitCode = 3;
}
if (emit) {
  if (problems.length) {
    console.log('Not emitting: fix the problems above first.');
    process.exit(4);
  }
  const out = here('../../src/content/leveling-gear.json');
  for (const k of Object.keys(emitted)) emitted[k].sort((a, b) => a.level - b.level || a.slot.localeCompare(b.slot) || a.faction.localeCompare(b.faction));
  const inputs = createHash('sha1').update(JSON.stringify(builds)).digest('hex');
  writeFileSync(out, `${JSON.stringify({ generated: new Date().toISOString().slice(0, 10), forever: { commit: forever.head, databaseChanged: forever.dbDate }, builds: emitted }, null, 2)}\n`);
  writeFileSync(here('./cache/last-emit.json'), JSON.stringify({ weights: inputs, emitted: new Date().toISOString() }));
  console.log(`Wrote src/content/leveling-gear.json: ${Object.entries(emitted).map(([k, v]) => `${k} ${v.length}`).join(', ')}.`);
}
