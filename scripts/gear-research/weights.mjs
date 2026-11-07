/**
 * Reads each leveling build's stat weights out of src/content/builds/*.ts, so the gear
 * research always uses what the Handbook shows (update them with the update-stat-weights
 * skill, not here). Returns one entry per leveling build:
 *   { key: 'combat/questing', spec, id, weights: { agi, str, ap, hit, crit, haste, exp, arpen, pierce, sta } }
 * Weights are EP per rating point, Attack Power = 1, the same units the Forever database
 * gives item stats in (so no conversion is needed).
 *
 * Every leveling build must have weights: a build whose stats are still `noStats` stops the
 * run, because a silently skipped build would keep a stale gear list.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Handbook stat name → short key. */
const STAT_KEYS = {
  Agility: 'agi',
  Strength: 'str',
  'Attack Power': 'ap',
  'Hit Rating': 'hit',
  'Crit Rating': 'crit',
  'Haste Rating': 'haste',
  'Expertise Rating': 'exp',
  'Armor Penetration': 'arpen',
  'Spell Piercing': 'pierce',
  Stamina: 'sta',
};

/** Short key → numeric id of the stat in the Forever database (proto Stat enum). */
export const STAT_IDS = { str: 0, agi: 1, sta: 2, pierce: 12, ap: 14, hit: 17, crit: 18, haste: 19, arpen: 20, exp: 21 };
/** Ranged Attack Power counts only on the ranged slot. */
export const RANGED_AP_ID = 15;

export function loadBuildWeights() {
  const out = [];
  const missing = [];
  for (const spec of ['assassination', 'combat', 'subtlety']) {
    const src = readFileSync(fileURLToPath(new URL(`../../src/content/builds/${spec}.ts`, import.meta.url)), 'utf8');
    // `const questingStats: StatPriority = { … stats: [ { stat: 'Agility', ep: 1.52 }, … ] }`
    const consts = {};
    for (const m of src.matchAll(/const (\w+): StatPriority = \{([\s\S]*?)\n\};/g)) {
      const w = {};
      for (const [, stat, ep] of m[2].matchAll(/stat: '([^']+)', ep: ([\d.]+)/g)) if (STAT_KEYS[stat]) w[STAT_KEYS[stat]] = Number(ep);
      consts[m[1]] = w;
    }
    // Each build object: `id: '…'`, then its `stats: <const>` further down.
    const builds = [...src.matchAll(/\n    id: '([\w-]+)',\n    spec: '(\w+)',\n    phase: '(\w+)'[\s\S]*?\n    stats: (\w+),/g)];
    for (const [, id, , phase, statsConst] of builds) {
      if (phase !== 'leveling') continue;
      if (statsConst === 'noStats') {
        missing.push(`${spec}/${id}`);
        continue;
      }
      if (!consts[statsConst]) throw new Error(`${spec}/${id}: stats const ${statsConst} not found in ${spec}.ts`);
      out.push({ key: `${spec}/${id}`, spec, id, weights: consts[statsConst] });
    }
  }
  if (missing.length) {
    throw new Error(`These leveling builds have no stat weights yet: ${missing.join(', ')}. Run the update-stat-weights skill for them first.`);
  }
  if (out.length !== 6) throw new Error(`Expected 6 leveling builds, found ${out.length}: ${out.map((b) => b.key).join(', ')}`);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const b of loadBuildWeights()) console.log(b.key.padEnd(24), JSON.stringify(b.weights));
}
