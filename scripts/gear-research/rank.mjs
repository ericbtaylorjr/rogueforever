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
/** When no gap filler matches a typical green, one this close (and still an upgrade over the pick before it) is used rather than leave a long gap. */
const GAP_FALLBACK_RATIO = 0.9;
/** Every slot gets this many options in each level bracket (1-20, 21-40, 41-58) for each faction, and never fewer than the floor if anything at all qualifies. */
const MIN_OPTIONS = 3;
const MIN_OPTIONS_FLOOR = 2;
/** Extra options only have to come close to a typical green (the floor accepts a bit less when nothing better exists). */
const OPTION_RATIO = 0.9;
const OPTION_RATIO_FLOOR = 0.5;
/** A Bind on Pickup craft needs a non-crafted alternative this far below / above it, at least this close to a typical green. */
const ALT_BEFORE = 6;
const ALT_AFTER = 3;
const ALT_RATIO = 0.8;
const BRACKETS = [[MIN_LEVEL, 20], [21, 40], [41, MAX_LEVEL]];
/**
 * Source mix: in each bracket a slot should offer a Bind on Equip item (a drop or a craft the player can also buy), a Bind on Pickup
 * quest/dungeon/vendor/reputation reward, and a craft, whenever one exists. The missing kind is added even when it is statistically
 * weaker, down to MIX_RATIO of a typical green (MIX_RATIO_FLOOR when nothing better exists).
 */
const MIX_RATIO = 0.75;
const MIX_RATIO_FLOOR = 0.5;
/** Candidates this close to a typical green get their bind type looked up so the mix pass can classify them. */
const MIX_LOOKUP_RATIO = 0.6;

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

/**
 * What each spec wants from a weapon, as weights that rank the three things in order of
 * importance: top-end damage (the weapon's maximum hit, per reference swing), DPS, and speed
 * (slower is better). The weapon's EP is dpsEp × (top × top-end DPS + dps × DPS), scaled by
 * 1 + speed × (its speed ÷ the reference speed − 1). Combat: highest top-end damage, then DPS,
 * then speed, any non-dagger main hand; off hand DPS then speed, any weapon type. Assassination
 * (Mutilate): daggers, main hand DPS then slow. Subtlety: daggers, plus any weapon type for the
 * weapon swap after the Ambush opener, DPS first with a slight preference for a slow non-dagger.
 * The speed on an off hand is the same direction as the main hand's (an assumption: confirm).
 */
const WEAPON_PREFS = {
  combat: { main: { top: 0.55, dps: 0.45, speed: 0.15 }, off: { top: 0, dps: 1, speed: 0.1 } },
  assassination: { main: { top: 0, dps: 1, speed: 0.2 }, off: { top: 0, dps: 1, speed: 0 } },
  subtlety: { main: { top: 0, dps: 1, speed: 0.15 }, off: { top: 0, dps: 1, speed: 0.1 } },
};
/** A typical weapon's maximum hit is about this multiple of its average hit. */
const TOP_END_SHAPE = 1.3;
const weaponValue = (item, build, hand, family) => {
  const p = WEAPON_PREFS[build.key.split('/')[0]][hand === 'off' ? 'off' : 'main'];
  const ref = REFERENCE_SPEED[family === 'dagger' ? 'dagger' : 'slow'];
  const w = item.weapon;
  const topDps = w.max / TOP_END_SHAPE / ref;
  const mix = p.top * topDps + p.dps * w.dps;
  return mix * (1 + p.speed * (w.speed / ref - 1));
};

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
      return base(weaponValue(item, build, 'main', role.family) * dps.main);
    }
    case 'off': {
      if (item.cls !== 'weapon' || !['Off hand', 'One-hand'].includes(item.slot) || !role.types.includes(item.wtype)) return null;
      return base(weaponValue(item, build, 'off', role.family) * dps.off);
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
    // Thin levels (the database has few greens there) look a little further out before giving up.
    for (const reach of [3, 6]) {
      const near = greens.filter((s) => Math.abs(s.item.level - l) <= reach).map((s) => s.ep).sort((a, b) => a - b);
      if (near.length >= 3) { curve[l] = near[Math.floor(near.length / 2)]; break; }
    }
  }
  // Fill gaps by interpolation, then make it monotonic so a dip never makes an item look better.
  for (let l = 1; l <= 60; l++) {
    if (curve[l] !== undefined) continue;
    const prev = [...Array(l).keys()].reverse().find((k) => curve[k] !== undefined);
    const next = curve.findIndex((v, k) => k > l && v !== undefined);
    // Below the first level with greens, scale down with level (a flat extension would hold level 10 gear to a level 30 bar).
    const first = curve.findIndex((v) => v !== undefined);
    curve[l] = prev !== undefined && next > 0 ? curve[prev] + ((curve[next] - curve[prev]) * (l - prev)) / (next - prev) : prev === undefined && first > 0 ? Math.max(1, (curve[first] * l) / first) : curve[prev ?? next] ?? 1;
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
    const fitsAt = (ratio) => (s, to) => !used.has(s.item.id) && s.item.level >= lo && s.item.level <= to && s.ep >= ratio * base[clampLevel(s.item.level)] && (paired || (s.ep > a.ep && s.ep < b.ep));
    const fits = fitsAt(need);
    const top = (list) => list.sort((x, y) => y.ep - x.ep || y.item.level - x.item.level)[0];
    // Prefer one that closes the gap in a single step, otherwise anything that splits it.
    let pick = top(pool.filter((s) => fits(s, Math.min(a.item.level + MAX_GAP, hi)))) ?? top(pool.filter((s) => fits(s, hi)));
    // Nothing matches a typical green: a slightly weaker upgrade still beats a long gap.
    if (!pick) {
      const loose = fitsAt(GAP_FALLBACK_RATIO);
      pick = top(pool.filter((s) => loose(s, Math.min(a.item.level + MAX_GAP, hi)))) ?? top(pool.filter((s) => loose(s, hi)));
    }
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
const needed = { items: new Set(), quests: new Set(), recipes: new Set(), vendors: new Set(), binds: new Set() };
const flagged = new Map(); // id → name, for effects the model can't value
const questUnverified = new Map(); // quest-reward picks whose accept level hasn't been confirmed by hand
const estimatedLevel = new Map(); // picks whose level is an estimate, not a requirement
const unverified = new Map(); // crafted picks whose recipe source Wowhead doesn't list
const sideUnverified = new Map(); // quest picks whose side the database doesn't record (assumed both)
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
      console.log(`baseline (typical green EP) by level: ${[10, 15, 20, 25, 30, 40, 50, 58].map((l) => `L${l} ${base[l]?.toFixed(0)}`).join(', ')}`);
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
      if (FACTIONS.some((f) => i.avail[f]?.kind === 'crafted') && lookups.binds?.[i.id] === undefined) needed.binds.add(i.id);
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
      const { picks: filled, unfilled } = fillGaps(picks, everything, base, paired);
      const out = filled;
      const have = new Set(out.map((s) => s.item.id));
      const crafted = (s) => s.item.avail[faction]?.kind === 'crafted';
      const unused = (s) => !have.has(s.item.id);
      const add = (s, tag) => { s[tag] = true; out.push(s); have.add(s.item.id); };
      const better = (list) => list.sort((x, y) => y.ep - x.ep || y.item.level - x.item.level)[0];
      // A craft that binds when picked up is no use to someone without the profession: offer a non-crafted alternative nearby.
      for (const p of [...out]) {
        if (!crafted(p)) continue;
        if (lookups.binds?.[p.item.id] === undefined) needed.binds.add(p.item.id);
        if (lookups.binds?.[p.item.id] !== 'pickup') continue;
        const near = (s) => s.item.level >= p.item.level - ALT_BEFORE && s.item.level <= p.item.level + ALT_AFTER;
        if (out.some((q) => q !== p && !crafted(q) && near(q))) continue;
        const alt = better(everything.filter((s) => unused(s) && !crafted(s) && near(s) && s.ep >= ALT_RATIO * base[clampLevel(s.item.level)]));
        if (alt) add(alt, 'alt');
        else warnings.push(`${build.key} · ${role.key} (${faction}): ${p.item.name} binds on pickup (${p.item.avail[faction].text}) and nothing that isn't crafted qualifies within ${ALT_BEFORE} levels below / ${ALT_AFTER} above.`);
      }
      // Source mix: don't leave a bracket with only Bind on Equip items, or only quest/dungeon rewards, or no craft at all.
      const bindOf = (s) => lookups.binds?.[s.item.id];
      const kindsOf = (s) => {
        const c = crafted(s);
        const boe = bindOf(s) === 'equip';
        return { boe, craft: c, reward: !c && !boe };
      };
      for (const s of everything) if (!crafted(s) && s.ep >= MIX_LOOKUP_RATIO * base[clampLevel(s.item.level)] && bindOf(s) === undefined) needed.binds.add(s.item.id);
      // Rewards and BoE items are balanced in 10-level windows (a bracket can hide a stretch that is all BoE); crafts per bracket.
      const MIX_WINDOWS = [[MIN_LEVEL, 20, 'reward', 'boe'], [21, 30, 'reward', 'boe'], [31, 40, 'reward', 'boe'], [41, 50, 'reward', 'boe'], [51, MAX_LEVEL, 'reward', 'boe'], ...BRACKETS.map(([a, b]) => [a, b, 'craft'])];
      for (const [lo, hi, ...kinds] of MIX_WINDOWS) {
        for (const kind of kinds) {
          const inBracket = () => out.filter((s) => s.item.level >= lo && s.item.level <= hi);
          if (!inBracket().length || inBracket().some((s) => kindsOf(s)[kind])) continue;
          for (const r of [MIX_RATIO, MIX_RATIO_FLOOR]) {
            const c = better(everything.filter((s) => unused(s) && s.item.level >= lo && s.item.level <= hi && s.ep >= r * base[clampLevel(s.item.level)] && (crafted(s) || bindOf(s) !== undefined) && kindsOf(s)[kind]));
            if (c) { add(c, 'mix'); break; }
          }
        }
      }
      // Options: at least MIN_OPTIONS per level bracket, taking the best of what's left that is close to a typical green.
      const optionGaps = [];
      for (const [lo, hi] of BRACKETS) {
        const count = () => out.filter((s) => s.item.level >= lo && s.item.level <= hi).length;
        for (const [need, ratio] of [[MIN_OPTIONS, OPTION_RATIO], [MIN_OPTIONS_FLOOR, OPTION_RATIO_FLOOR]]) {
          while (count() < need) {
            const c = better(everything.filter((s) => unused(s) && s.item.level >= lo && s.item.level <= hi && s.ep >= ratio * base[clampLevel(s.item.level)]));
            if (!c) break;
            add(c, 'extra');
          }
        }
        if (count() < MIN_OPTIONS) optionGaps.push({ lo, hi, n: count() });
      }
      return { picks: out.sort((x, y) => x.item.level - y.item.level), unfilled, optionGaps };
    };

    const chosen = new Map(); // id → { s, pickedBy: Set }
    const unfilled = {};
    const optionGaps = {};
    for (const faction of FACTIONS) {
      const { picks, unfilled: gaps, optionGaps: og } = picksFor(faction);
      unfilled[faction] = gaps;
      optionGaps[faction] = og;
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
    coverage.push({ build: build.key, label, optsA: optionGaps.Alliance, optsH: optionGaps.Horde, a: seenA.length, h: seenH.length, gapsA: gapsOf(seenA), gapsH: gapsOf(seenH), candidates: strong.length });
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
      if (i.levelFrom === 'Wowhead quest' || i.levelFrom === 'item level') estimatedLevel.set(i.id, `${i.name} (${i.id}) shown at L${i.level} from the ${i.levelFrom === 'item level' ? 'item level − 4' : "quest's level (usually a few above the level it can be accepted at)"}; check "Requires level" on Wowhead and set curation.json \`level\``);
      for (const f of ['Alliance', 'Horde']) {
        const o = i.avail[f];
        if (o?.kind === 'quest' && !curation.questMinLevel?.[o.questId]) questUnverified.set(o.questId, `${o.text.replace(/^Quest: /, '')} (https://www.wowhead.com/classic/quest=${o.questId}) → ${i.name} (${i.id}): shown at L${i.level} from ${i.levelFrom}; item requires ${i.reqLvl ?? lookups.items?.[i.id]?.reqlevel ?? '?'}, quest level ${lookups.quests?.[o.questId]?.level ?? '?'}`);
      }
      if (i.recipeUnknown) unverified.set(i.id, `${i.name} (${i.id}, L${i.level}, ${(i.avail.Alliance ?? i.avail.Horde).text})`);
      if (i.suffixOptions) suffixPicks.set(i.id, `${i.name} (${i.id}, ${s.suffix.useful}/${s.suffix.total} suffixes help)`);
      const near = strong.filter((o) => o.item.id !== i.id && Math.abs(o.item.level - i.level) <= 3).sort((a, b) => b.ep - a.ep).slice(0, 3);
      for (const o of near) if (o.proc.unmodeled) flagged.set(o.item.id, o.item.name);
      const srcA = i.avail.Alliance?.text, srcH = i.avail.Horde?.text;
      const src = srcA && srcH && srcA !== srcH ? `${srcA} / ${srcH}` : srcA ?? srcH;
      const wt = i.wtype && i.cls !== 'armor' ? ` ${i.wtype} ${i.weapon?.speed ?? ''}` : '';
      const tags = `${flag(s)}${i.suffixOptions ? ' 🎲' : ''}${s.filler ? ' ↔' : ''}${s.alt ? ' ⇄' : ''}${s.extra ? ' +' : ''}${s.mix ? ' ✚' : ''}`;
      report.push(
        `| ${i.level} | [${i.name}](https://www.wowhead.com/forever/item=${i.id}) (${i.id})${wt}${tags} | ${real.toFixed(0)} | ${s.proc.ep ? s.proc.ep.toFixed(0) : ''} | ${(real / base[clampLevel(i.level)]).toFixed(2)}× | ${src} | ${i.faction} | ${near.map((o) => `${o.item.name} (${o.item.id}, ${o.item.level}, ${(o.ep / base[clampLevel(o.item.level)]).toFixed(2)}×${flag(o)})`).join('; ')} |`,
      );
      for (const f of ['Alliance', 'Horde']) {
        const o = i.avail[f];
        if (o?.kind === 'quest' && !o.sideKnown && i.avail.Alliance?.questId === i.avail.Horde?.questId) sideUnverified.set(o.questId, `${o.text.replace(/^Quest: /, '')} (quest ${o.questId}) → ${i.name} (${i.id})`);
      }
      chosenAll.push({ itemId: i.id, build: build.key, slot: role.slot });
      // One entry per item; where the two factions reach it from different places it is two entries, one each.
      const suffixTag = `${i.suffixOptions ? ' · random suffix' : ''}`;
      const craftedBop = FACTIONS.some((f) => i.avail[f]?.kind === 'crafted') && lookups.binds?.[i.id] === 'pickup';
      const mk = (faction, text) => {
        const e = { level: i.level, slot: role.slot, itemId: i.id, name: i.name, quality: QUALITY[i.quality], source: `${curation.source?.[i.id] ?? text}${suffixTag}`, faction };
        const wh = wowhead[i.id];
        if (wh?.boe) e.boe = true;
        if (craftedBop) e.bop = true;
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

// Rows must be unique (the Handbook keys its rows on these fields).
for (const [k, rows] of Object.entries(emitted)) {
  const seen = new Set();
  for (const e of rows) {
    const key = [e.level, e.slot, e.itemId, e.faction, e.source].join('|');
    if (seen.has(key)) problems.push(`${k}: duplicate row ${e.name} (${e.itemId}) at level ${e.level}, ${e.slot}, ${e.faction}`);
    seen.add(key);
  }
}
// Items the last published lists had that the database no longer has (it drops and adds items as the client is cleaned up).
{
  const ids = new Set(db.items.map((i) => i.id));
  const prev = existsSync(here('../../src/content/leveling-gear.json')) ? JSON.parse(readFileSync(here('../../src/content/leveling-gear.json'), 'utf8')).builds : {};
  const gone = new Map();
  for (const rows of Object.values(prev)) for (const e of rows) if (e.itemId && !ids.has(e.itemId) && !(curation.include ?? []).some((x) => x.item.itemId === e.itemId)) gone.set(e.itemId, `${e.name} (${e.itemId}, ${e.slot} L${e.level})`);
  if (gone.size) warnings.push(`${gone.size} items in the last published lists are no longer in the database, so they drop out: ${[...gone.values()].join('; ')}`);
}

// Manual includes go in as written, for the builds that can use them.
for (const inc of curation.include ?? []) for (const key of inc.builds ?? Object.keys(emitted)) emitted[key].push(inc.item);

// ---------------------------------------------------------------- checks and output

const pendingTotal = needed.items.size + needed.quests.size + needed.recipes.size;
const neededOut = { items: [...needed.items].filter((id) => !lookups.items[id]), quests: [...needed.quests], recipes: [...needed.recipes].filter((id) => !lookups.recipes[id]), vendors: [...needed.vendors], binds: [...needed.binds].filter((id) => lookups.binds?.[id] === undefined) };
writeFileSync(here('./cache/lookups-needed.json'), JSON.stringify(neededOut));
const pending = neededOut.items.length + neededOut.quests.length + neededOut.recipes.length + neededOut.vendors.length + neededOut.binds.length;
const unchecked = [...new Set(chosenAll.map((c) => c.itemId))].filter((id) => !wowhead[id]);
writeFileSync(here('./cache/picks.json'), JSON.stringify(chosenAll));
if (emit && unchecked.length) problems.push(`${unchecked.length} picks have no Wowhead link check yet (run links.mjs): ${unchecked.slice(0, 12).join(', ')}${unchecked.length > 12 ? '…' : ''}`);

const unlinked = [...new Set(chosenAll.map((c) => c.itemId))].filter((id) => wowhead[id] && !wowhead[id].found);
const gapRows = coverage.filter((c) => c.gapsA.length || c.gapsH.length);
const optionRows = coverage.flatMap((c) => ['Alliance', 'Horde'].flatMap((f) => (f === 'Alliance' ? c.optsA : c.optsH).map((g) => ({ ...g, build: c.build, label: c.label, f }))));
const optionLines = optionRows.map((g) => `- ${g.build} · ${g.label} · ${g.f}: levels ${g.lo}–${g.hi} has ${g.n}`);
const underFloor = optionRows.filter((g) => g.n < MIN_OPTIONS_FLOOR).length;
const levelFrom = {};
for (const id of new Set(chosenAll.map((c) => c.itemId))) levelFrom[byId.get(id).levelFrom] = (levelFrom[byId.get(id).levelFrom] ?? 0) + 1;
const header = [
  `# Leveling gear research report`,
  ``,
  `Generated ${new Date().toISOString().slice(0, 16)}Z from the Forever database: master ${forever.head?.slice(0, 10) ?? '?'} (${forever.headDate?.slice(0, 10) ?? '?'}), database last changed ${forever.dbDate?.slice(0, 10) ?? '?'}; ${db.items.length} items, ${items.length} Rogue-usable candidates, ${Object.keys(procData).length} with proc or use data.`,
  `EP uses each build's own weights from the Handbook (Stamina floored at ${STAMINA_EP}). "vs green" is EP over the typical fixed-stat green at that level. In the tables: ~ = on-hit rate assumed (${DEFAULT_PPM} PPM), ⚠ = has an effect the model can't value (scored 0), 🎲 = random-suffix item (average of the suffixes that help), ↔ = gap filler, ⇄ = non-crafted alternative to a Bind on Pickup craft, + = extra option to reach the per-bracket minimum, ✚ = added so the bracket mixes Bind on Equip items, quest/dungeon rewards and crafts.`,
  `Levels come from: ${Object.entries(levelFrom).map(([k, v]) => `${k} ${v}`).join(', ')}.`,
  pending ? `\n**Lookups pending (${neededOut.items.length} item levels, ${neededOut.quests.length} quests, ${neededOut.recipes.length} recipes, ${neededOut.vendors.length} vendor items):** run \`node scripts/gear-research/lookups.mjs\`, then rerun this. The picks below are provisional.` : '',
  problems.length ? `\n### Problems (these stop --emit)\n\n${problems.map((t) => `- ${t}`).join('\n')}` : '',
  warnings.length ? `\n### Warnings\n\n${warnings.map((t) => `- ${t}`).join('\n')}` : '',
  optionLines.length ? `\n### Brackets with fewer than ${MIN_OPTIONS} options (${underFloor} with fewer than ${MIN_OPTIONS_FLOOR})\n\nNothing else available qualifies (close to a typical green) in these stretches, usually because the database has no source for the items there.\n\n${optionLines.join('\n')}` : '',
  `\n### Coverage\n\nA recommendation at least every ${MAX_GAP} levels from ${MIN_LEVEL} to ${MAX_LEVEL}. Picks each faction sees per slot; gaps are stretches no qualifying upgrade could fill.\n\n| Build | Slot | Alliance | Horde | Gaps (Alliance) | Gaps (Horde) |\n|---|---|---|---|---|---|\n${coverage.map((c) => `| ${c.build} | ${c.label} | ${c.a} | ${c.h} | ${c.gapsA.join(', ') || '·'} | ${c.gapsH.join(', ') || '·'} |`).join('\n')}`,
  pinReport.length ? `\n### Pinned items\n\n| Build | Slot | Item | Lvl | EP | vs green | Result | Why pinned |\n|---|---|---|---|---|---|---|---|\n${pinReport.join('\n')}` : '',
  unlinked.length ? `\n### Picks Wowhead doesn't list yet (shown with a tooltip, no link)\n\n${unlinked.map((id) => `- ${byId.get(id).name} (${id})`).join('\n')}` : '',
  suffixPicks.size ? `\n### Random-suffix picks\n\nScored as the average of the suffixes that help the build; you can't choose the suffix.\n\n${[...suffixPicks.values()].sort().map((t) => `- ${t}`).join('\n')}` : '',
  sideUnverified.size ? `\n### Quest picks whose side the database doesn't record (shown as both factions)\n\nCheck "Side" on each quest's Wowhead page; set \`questSide\` in curation.json for any that is one faction's.\n\n${[...sideUnverified.values()].sort().map((t) => `- ${t}`).join('\n')}` : '',
  keptOut.size ? `\n### Strong items kept out: not available (or an unconfirmed epic)\n\nAllow an epic with \`allowEpic\` in curation.json; remove a zone from \`notAtLaunch\` when it opens.\n\n${[...keptOut.values()].sort().map((t) => `- ${t}`).join('\n')}` : '',
  questUnverified.size ? `\n### Quest rewards whose accept level isn't verified\n\nThe database has no quest accept level and Wowhead blocks scripts, so read "Requires level" on each quest page (the item's own requirement can be lower) and add it to curation.json \`questMinLevel\` {questId: level}. Verified quests drop off this list.\n\n${[...questUnverified.values()].sort().map((t) => `- ${t}`).join('\n')}` : '',
  estimatedLevel.size ? `\n### Picks whose level is an estimate\n\nNo required level in the database or on Wowhead's item page.\n\n${[...estimatedLevel.values()].sort().map((t) => `- ${t}`).join('\n')}` : '',
  unverified.size ? `\n### Crafted picks whose recipe source Wowhead doesn't list\n\nUsually new Forever recipes. Check each in game or on Wowhead; \`exclude\` any that aren't obtainable.\n\n${[...unverified.values()].sort().map((t) => `- ${t}`).join('\n')}` : '',
  flagged.size ? `\n### Picks and runners-up with effects the model can't value\n\n${[...flagged].map(([id, n]) => `- [${n}](https://www.wowhead.com/forever/item=${id})`).join('\n')}` : '',
];
writeFileSync(here('./cache/report.md'), [...header, ...report].join('\n') + '\n');
console.log(`Report: scripts/gear-research/cache/report.md (${new Set(chosenAll.map((c) => c.itemId)).size} distinct picks, ${gapRows.length} slots with a gap, ${optionRows.length} slot brackets under ${MIN_OPTIONS} options, ${pending} lookups pending).`);
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
