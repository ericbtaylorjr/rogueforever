#!/usr/bin/env node
/**
 * Proc and use-effect data for the leveling gear research (see README.md here).
 *
 * The Forever database says *that* an item has a proc or use effect and gives its rate
 * (PPM or chance), internal cooldown, duration and, for stat buffs, the stats it grants.
 * What it doesn't carry is what a damage or extra-attack effect does, so those come from
 * the game's own tables (via wago.tools) for the newest Forever build. Writes
 * cache/procs.json: per item, each effect with its rate and what it does, in plain numbers
 * rank.mjs can value.
 *
 *   node scripts/gear-research/procs.mjs                 # newest Forever build (cached per build)
 *   node scripts/gear-research/procs.mjs --offline       # newest build already in cache/db2
 *   node scripts/gear-research/procs.mjs --build 1.60.1.70753
 *
 * Tables (CSV, one request each, cached per build in cache/db2/): ItemXItemEffect,
 * ItemEffect, SpellEffect, SpellAuraOptions, SpellProcsPerMinute, SpellMisc, SpellDuration.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadDb } from './forever.mjs';
import { parseCsv } from './wago.mjs';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const UA = { 'User-Agent': 'Mozilla/5.0 (RogueHandbook gear research)' };
const offline = process.argv.includes('--offline');
const buildArg = process.argv.includes('--build') ? process.argv[process.argv.indexOf('--build') + 1] : undefined;

async function newestBuild() {
  const cached = existsSync(here('./cache/db2/')) ? readdirSync(here('./cache/db2/')).sort().at(-1) : undefined;
  if (offline) {
    if (!cached) throw new Error('--offline needs a build already in cache/db2; run once online first.');
    return cached;
  }
  try {
    const j = await (await fetch('https://wago.tools/api/builds', { headers: UA })).json();
    const v = j.wowf?.[0]?.version; // wago's product code for WoW: Forever
    if (v) return v;
  } catch {
    /* fall through to the cache */
  }
  if (cached) {
    console.log(`wago.tools unreachable; using the cached game tables for ${cached}.`);
    return cached;
  }
  throw new Error('No Forever build found at wago.tools/api/builds (product "wowf") and nothing cached.');
}

const build = buildArg ?? (await newestBuild());
const dir = here(`./cache/db2/${build}/`);
mkdirSync(dir, { recursive: true });

async function table(name) {
  const file = `${dir}${name}.csv`;
  if (!existsSync(file)) {
    const r = await fetch(`https://wago.tools/db2/${name}/csv?build=${build}`, { headers: UA });
    if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
    writeFileSync(file, await r.text());
    await new Promise((res) => setTimeout(res, 800)); // polite
  }
  return parseCsv(readFileSync(file, 'utf8'));
}

const { db } = loadDb();
const withEffects = db.items.filter((i) => i.itemEffects?.length);

const [ixe, ie, se, sao, ppmT, misc, dur] = await Promise.all(
  ['ItemXItemEffect', 'ItemEffect', 'SpellEffect', 'SpellAuraOptions', 'SpellProcsPerMinute', 'SpellMisc', 'SpellDuration'].map(table),
);
const by = (rows, key) => {
  const m = new Map();
  for (const r of rows) (m.get(r[key]) ?? m.set(r[key], []).get(r[key])).push(r);
  return m;
};
const itemEffectRows = new Map(ie.map((r) => [r.ID, r]));
const effectsOfItem = by(ixe, 'ItemID');
const effectsOfSpell = by(se, 'SpellID');
const miscOf = new Map(misc.map((r) => [r.SpellID, r]));
const durMs = new Map(dur.map((r) => [r.ID, Number(r.Duration)]));

// Spell effect ids / aura ids this model understands (game constants).
const EFFECT = { SCHOOL_DAMAGE: 2, APPLY_AURA: 6, TRIGGER_SPELL: 64, EXTRA_ATTACKS: 19 };
const AURA = { PERIODIC_DAMAGE: 3, MOD_STAT: 29, MOD_ATTACK_POWER: 99, MOD_MELEE_HASTE: 138, MOD_CRIT: 52, MOD_HIT: 54 };
const STAT_BY_MISC = { 0: 'str', 1: 'agi', 2: 'sta' };

/** What one spell does, in numbers. `unmodeled` carries the raw effect/aura ids so the report can show it. */
function describe(spellId, depth = 0) {
  const out = [];
  const duration = (durMs.get(miscOf.get(String(spellId))?.DurationIndex) ?? 0) / 1000;
  for (const e of effectsOfSpell.get(String(spellId)) ?? []) {
    const effect = Number(e.Effect), aura = Number(e.EffectAura), pts = Number(e.EffectBasePointsF) || 0;
    if (effect === EFFECT.EXTRA_ATTACKS) out.push({ kind: 'extraAttack', count: pts || 1 });
    else if (effect === EFFECT.SCHOOL_DAMAGE) out.push({ kind: 'damage', amount: Math.abs(pts) });
    else if (effect === EFFECT.TRIGGER_SPELL && depth < 1 && e.EffectTriggerSpell !== '0') out.push(...describe(e.EffectTriggerSpell, depth + 1));
    else if (effect === EFFECT.APPLY_AURA) {
      const period = Number(e.EffectAuraPeriod) / 1000;
      if (aura === AURA.PERIODIC_DAMAGE && period > 0) out.push({ kind: 'damage', amount: Math.abs(pts) * (duration / period), over: duration });
      else if (aura === AURA.MOD_ATTACK_POWER) out.push({ kind: 'buff', stat: 'ap', amount: pts, duration });
      else if (aura === AURA.MOD_STAT && STAT_BY_MISC[e.EffectMiscValue_0]) out.push({ kind: 'buff', stat: STAT_BY_MISC[e.EffectMiscValue_0], amount: pts, duration });
      else if (aura === AURA.MOD_MELEE_HASTE) out.push({ kind: 'haste', pct: pts, duration });
      else if (aura === AURA.MOD_CRIT) out.push({ kind: 'buff', stat: 'critPct', amount: pts, duration });
      else if (aura === AURA.MOD_HIT) out.push({ kind: 'buff', stat: 'hitPct', amount: pts, duration });
      else out.push({ kind: 'unmodeled', effect, aura });
    } else out.push({ kind: 'unmodeled', effect, aura });
  }
  return out;
}

/** The game's own spell for an item's effect, for when the database's buff id (an aura) has no effects of its own. */
const spellsOfItem = (itemId) => (effectsOfItem.get(String(itemId)) ?? []).map((x) => itemEffectRows.get(x.ItemEffectID)?.SpellID).filter(Boolean);

const result = {};
let found = 0;
for (const item of withEffects) {
  const list = [];
  const gameSpells = spellsOfItem(item.id);
  for (const e of item.itemEffects) {
    const trigger = e.proc ? 'onHit' : e.onUse ? 'use' : 'equip';
    const duration = (e.effectDurationMs ?? 0) / 1000;
    const granted = e.scalingOptions?.['0']?.stats ?? (e.stackingAura?.scalingOptions?.['0']?.stats && Object.fromEntries(Object.entries(e.stackingAura.scalingOptions['0'].stats).map(([k, v]) => [k, v * ((e.maxCumulativeStacks ?? 1) / 2)])));
    let effects;
    if (granted && Object.keys(granted).length) effects = [{ kind: 'stats', stats: granted, duration }];
    else {
      effects = describe(e.buffId);
      if (!effects.length || effects.every((f) => f.kind === 'unmodeled')) for (const s of gameSpells) if (String(s) !== String(e.buffId)) effects = [...effects.filter((f) => f.kind !== 'unmodeled'), ...describe(s)];
    }
    // Permanent (equip) auras are mostly set bonuses and enchant-like text: only keep ones the model can value.
    if (trigger === 'equip') effects = effects.filter((f) => f.kind !== 'unmodeled' && !(f.kind === 'damage'));
    if (!effects.length && trigger === 'equip') continue;
    const rate = trigger !== 'onHit' ? undefined : e.proc.ppm !== undefined ? { ppm: e.proc.ppm } : e.proc.procChance !== undefined ? { chance: e.proc.procChance } : { assumed: true };
    list.push({
      trigger,
      spell: e.buffId,
      name: e.buffName,
      cooldown: trigger === 'use' ? (e.onUse.cooldownMs ?? 0) / 1000 : 0,
      icd: e.proc?.icdMs ? e.proc.icdMs / 1000 : 0,
      duration,
      ...(rate ? { rate } : {}),
      effects,
    });
  }
  if (list.length) (result[item.id] = list, found++);
}
writeFileSync(here('./cache/procs.json'), JSON.stringify({ build, generated: new Date().toISOString(), items: result }));
console.log(`Game tables ${build}: ${found} of ${withEffects.length} items with effects have data → cache/procs.json`);
const assumed = Object.values(result).flat().filter((e) => e.trigger === 'onHit' && e.rate.assumed).length;
console.log(`${assumed} on-hit effects have no rate in the database (rank.mjs assumes the default).`);
