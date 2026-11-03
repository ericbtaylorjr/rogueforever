#!/usr/bin/env node
/**
 * Proc and use-effect data for the leveling gear research (see README.md here).
 *
 * Wowhead's tooltip says "Chance on hit: grants an extra attack" but not how often. The
 * game's own tables (via wago.tools) have it, so this reads them for the current Forever
 * build and writes cache/procs.json: per item, each on-hit / use effect with its proc rate
 * and what it does, in plain numbers rank.mjs can value.
 *
 *   node scripts/gear-research/procs.mjs                # newest Forever build
 *   node scripts/gear-research/procs.mjs --build 1.60.1.70753
 *
 * Tables (CSV, one request each, cached per build in cache/db2/): ItemXItemEffect,
 * ItemEffect, SpellEffect, SpellAuraOptions, SpellProcsPerMinute, SpellMisc, SpellDuration.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const UA = { 'User-Agent': 'Mozilla/5.0 (RogueHandbook gear research)' };
const buildArg = process.argv.includes('--build') ? process.argv[process.argv.indexOf('--build') + 1] : undefined;

async function forever() {
  const r = await fetch('https://wago.tools/api/builds', { headers: UA });
  const j = await r.json();
  const v = j.wowf?.[0]?.version; // wago's product code for WoW: Forever
  if (!v) throw new Error('No Forever build found at wago.tools/api/builds (product "wowf")');
  return v;
}

const build = buildArg ?? (await forever());
const dir = here(`./cache/db2/${build}/`);
mkdirSync(dir, { recursive: true });

/** Minimal CSV reader: quoted fields, doubled quotes, newlines inside quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') (field += '"', i++);
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') (row.push(field), (field = ''));
    else if (c === '\n') (row.push(field), rows.push(row), (row = []), (field = ''));
    else if (c !== '\r') field += c;
  }
  if (field || row.length) (row.push(field), rows.push(row));
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

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

const items = JSON.parse(readFileSync(here('./cache/items.json'), 'utf8')).items;
const wanted = new Set(Object.keys(items).filter((id) => items[id].procs?.length));

const [ixe, ie, se, sao, ppmT, misc, dur] = await Promise.all(
  ['ItemXItemEffect', 'ItemEffect', 'SpellEffect', 'SpellAuraOptions', 'SpellProcsPerMinute', 'SpellMisc', 'SpellDuration'].map(table),
);
const by = (rows, key) => {
  const m = new Map();
  for (const r of rows) (m.get(r[key]) ?? m.set(r[key], []).get(r[key])).push(r);
  return m;
};
const itemEffects = new Map(ie.map((r) => [r.ID, r]));
const effectsOfItem = by(ixe, 'ItemID');
const effectsOfSpell = by(se, 'SpellID');
const auraOf = new Map(sao.map((r) => [r.SpellID, r]));
const ppm = new Map(ppmT.map((r) => [r.ID, Number(r.BaseProcRate)]));
const miscOf = new Map(misc.map((r) => [r.SpellID, r]));
const durMs = new Map(dur.map((r) => [r.ID, Number(r.Duration)]));

// Spell effect ids / aura ids this model understands (game constants).
const EFFECT = { SCHOOL_DAMAGE: 2, APPLY_AURA: 6, TRIGGER_SPELL: 64, EXTRA_ATTACKS: 19 };
const AURA = { PERIODIC_DAMAGE: 3, MOD_STAT: 29, MOD_ATTACK_POWER: 99, MOD_MELEE_HASTE: 138, MOD_CRIT: 52, MOD_HIT: 54 };
const STAT_BY_MISC = { 0: 'str', 1: 'agi', 2: 'sta' };

/** What one effect of a spell does, in numbers. `unmodeled` carries the raw effect/aura ids so the report can show it. */
function describe(spellId, depth = 0) {
  const out = [];
  const duration = (durMs.get(miscOf.get(spellId)?.DurationIndex) ?? 0) / 1000;
  for (const e of effectsOfSpell.get(spellId) ?? []) {
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

const TRIGGER = { 0: 'use', 1: 'equip', 2: 'onHit' };
const result = {};
let found = 0;
for (const id of wanted) {
  const list = [];
  for (const x of effectsOfItem.get(id) ?? []) {
    const e = itemEffects.get(x.ItemEffectID);
    if (!e || !(e.TriggerType in TRIGGER)) continue;
    const trig = TRIGGER[e.TriggerType];
    if (trig === 'equip') continue; // permanent auras are in the tooltip stats
    const a = auraOf.get(e.SpellID);
    const rate = a && Number(a.SpellProcsPerMinuteID) ? { ppm: ppm.get(a.SpellProcsPerMinuteID) } : a && Number(a.ProcChance) && Number(a.ProcChance) < 100 ? { chance: Number(a.ProcChance) / 100 } : { assumed: true };
    list.push({
      trigger: trig,
      spell: Number(e.SpellID),
      cooldown: Math.max(Number(e.CoolDownMSec), Number(e.CategoryCoolDownMSec), 0) / 1000,
      ...(trig === 'onHit' ? { rate } : {}),
      effects: describe(e.SpellID),
    });
  }
  if (list.length) (result[id] = list, found++);
}
writeFileSync(here('./cache/procs.json'), JSON.stringify({ build, generated: new Date().toISOString(), items: result }));
console.log(`Build ${build}: ${found} of ${wanted.size} items with procs or use effects have data → cache/procs.json`);
const assumed = Object.values(result).flat().filter((e) => e.trigger === 'onHit' && e.rate.assumed).length;
console.log(`${assumed} on-hit effects have no proc data (rank.mjs assumes the default rate).`);
