#!/usr/bin/env node
/**
 * One command for the whole leveling gear refresh (see README.md here and the
 * leveling-milestone-gear skill).
 *
 *   node scripts/gear-research/run.mjs              # sync Forever master, rebuild if anything relevant changed
 *   node scripts/gear-research/run.mjs --force      # rebuild even if nothing changed
 *   node scripts/gear-research/run.mjs --offline    # don't fetch the Forever repo or the game tables
 *   node scripts/gear-research/run.mjs --no-emit    # everything except writing src/content/leveling-gear.json
 *
 * Steps: forever.mjs (fetch master) → [skip if the Rogue-relevant database slice, the build
 * weights, curation.json and these scripts are unchanged and every unlinked item is still
 * unlinked] → procs.mjs → recipes.mjs → rank.mjs ⇄ lookups.mjs until nothing is pending →
 * links.mjs → rank.mjs --emit. `npm run icons` is the step after (it downloads icons).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadDb } from './forever.mjs';
import { loadBuildWeights } from './weights.mjs';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const run = (script, extra = []) => {
  const r = spawnSync('node', [here(`./${script}`), ...extra], { stdio: 'inherit' });
  return r.status ?? 1;
};
const must = (script, extra) => {
  const code = run(script, extra);
  if (code !== 0) {
    console.error(`\n${script} failed (exit ${code}); stopping.`);
    process.exit(code);
  }
};
const sha = (s) => createHash('sha1').update(s).digest('hex');
const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback);

console.log('— Forever database');
must('forever.mjs', flag('--offline') ? ['--offline'] : []);

// What decides whether a rebuild could change anything: the slice of the database the research reads,
// the weights, the hand corrections, and the scripts themselves.
const { db } = loadDb();
const slice = sha(
  JSON.stringify([
    db.items.filter((i) => i.type >= 1 && i.type <= 14 && i.quality >= 2 && i.quality <= 4),
    db.randomSuffixes, db.zones, db.npcs, db.factions,
  ]),
);
const code = sha(readdirSync(here('.')).filter((f) => f.endsWith('.mjs')).sort().map((f) => readFileSync(here(f), 'utf8')).join('\n'));
const fingerprint = sha(JSON.stringify({ slice, code, weights: loadBuildWeights(), curation: readFileSync(here('./curation.json'), 'utf8') }));
const lastFile = here('./cache/last-run.json');
const last = readJson(lastFile, {});

console.log('\n— Wowhead links');
const outFile = here('../../src/content/leveling-gear.json');
// Unlinked items are rechecked every run (links.mjs does that); a change in what's linked means a rebuild is due.
const linkState = () => JSON.stringify(Object.entries(readJson(here('./cache/wowhead.json'), {})).map(([id, v]) => [id, v.found]).sort());
if (!flag('--force') && last.fingerprint === fingerprint && existsSync(outFile)) {
  must('links.mjs');
  const listed = new Set(Object.values(readJson(outFile, { builds: {} }).builds).flat().map((e) => `${e.itemId}:${!e.noWowhead}`));
  const wh = readJson(here('./cache/wowhead.json'), {});
  const stale = [...listed].filter((k) => { const [id, linked] = k.split(':'); return wh[id] && wh[id].found !== (linked === 'true'); });
  if (!stale.length) {
    console.log('\nNothing relevant changed since the last run (database slice, weights, curation and scripts are identical, no link status changed). Use --force to rebuild anyway.');
    process.exit(0);
  }
  console.log(`${stale.length} listed items changed Wowhead link status; rebuilding.`);
}

console.log('\n— Game tables (procs, recipes)');
must('procs.mjs', flag('--offline') ? ['--offline'] : []);
must('recipes.mjs');

console.log('\n— Ranking');
for (let round = 1; round <= 5; round++) {
  const status = run('rank.mjs');
  if (status !== 3) {
    if (status !== 0) process.exit(status);
    break;
  }
  console.log(`\n— Wowhead lookups (round ${round})`);
  const l = run('lookups.mjs');
  if (l !== 0) {
    console.error('lookups.mjs did not finish (probably blocked); rerun later, it saves its progress.');
    process.exit(l);
  }
  if (round === 5) {
    console.error('Lookups still pending after 5 rounds; check cache/lookups-needed.json.');
    process.exit(3);
  }
}

console.log('\n— Wowhead links for the picks');
must('links.mjs');

if (flag('--no-emit')) {
  console.log('\n--no-emit: not writing leveling-gear.json.');
  process.exit(0);
}
console.log('\n— Emit');
const emitStatus = run('rank.mjs', ['--emit']);
if (emitStatus !== 0) process.exit(emitStatus);
writeFileSync(lastFile, JSON.stringify({ fingerprint, at: new Date().toISOString() }));
console.log('\nDone. Next: npm run icons, npm run typecheck, then review `git diff src/content/leveling-gear.json` and scripts/gear-research/cache/report.md.');
