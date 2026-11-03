/**
 * Reads each leveling build's stat weights out of src/content/builds/*.ts, so the gear
 * research always uses what the Handbook shows (update them with the update-stat-weights
 * skill, not here). Returns one entry per leveling build:
 *   { key: 'combat/questing', spec, id, weights: { agi, str, ap, hit, crit, sta } }
 * Weights are EP per rating point, Attack Power = 1, the same units the items are scored in.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const STAT_KEYS = {
  Agility: 'agi',
  Strength: 'str',
  'Attack Power': 'ap',
  'Hit Rating': 'hit',
  'Crit Rating': 'crit',
  Stamina: 'sta',
};

export function loadBuildWeights() {
  const out = [];
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
      if (!consts[statsConst]) throw new Error(`${spec}/${id}: stats const ${statsConst} not found in ${spec}.ts`);
      out.push({ key: `${spec}/${id}`, spec, id, weights: consts[statsConst] });
    }
  }
  if (out.length !== 6) throw new Error(`Expected 6 leveling builds, found ${out.length}: ${out.map((b) => b.key).join(', ')}`);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const b of loadBuildWeights()) console.log(b.key.padEnd(24), JSON.stringify(b.weights));
}
