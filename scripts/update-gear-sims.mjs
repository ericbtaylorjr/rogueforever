#!/usr/bin/env node
/**
 * Rebuild src/content/gearSims.json (Meta breakdown > End Game > "Pre-raid BiS performance") from a WoWSims
 * batch export: `npm run gear-sims -- path/to/batch.csv`.
 *
 * The CSV has one row per build × encounter length (columns `talents` = the WoWSims preset name,
 * `talents_string`, `duration` in seconds, `dps`, `dps_margin_95`, `gear_set`, `settings` = the race, ...).
 * Keeps each build's DPS and its % behind the best build for that length (best = 0). `updated` is when this
 * script ran (the table's "Last updated"); never edit the JSON by hand. Builds are listed alphabetically.
 */
import { readFileSync, statSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) {
  console.error('Usage: npm run gear-sims -- <batch.csv>');
  process.exit(1);
}

/** WoWSims preset (the `talents` column) → Handbook build. Add a line when a new preset shows up. */
const PRESETS = {
  'Asn Muti': { id: 'assassination_mutilate', name: 'Assassination Mutilate', build: 'assassination/mutilate' },
  'Combat SS': { id: 'combat_sinister_strike', name: 'Combat Sinister Strike', build: 'combat/sinister-strike' },
  'Combat BS': { id: 'combat_backstab', name: 'Combat Backstab', build: 'combat/backstab' },
  'Combat Venom': { id: 'combat_venom', name: 'Combat Venom', build: 'combat/venom' },
  'Subtlety Hemo': { id: 'subtlety_hemo', name: 'Subtlety Hemo', build: 'subtlety/hemo' },
};
const warn = (m) => console.warn(`! ${m}`);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (cell += '"'), i++;
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') (row.push(cell), (cell = ''));
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      cell = '';
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x !== '')) rows.push(row);
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.replace(/^﻿/, ''), r[i] ?? ''])));
}

/** The calculator digits of each build's link, keyed `spec/id`, to flag a row simmed with other talents. */
function buildLinks() {
  const out = {};
  for (const spec of ['assassination', 'combat', 'subtlety']) {
    const file = readFileSync(new URL(`../src/content/builds/${spec}.ts`, import.meta.url), 'utf8');
    for (const block of file.split(/\n {2}\{\n/).slice(1)) {
      const id = block.match(/\bid: '([^']+)'/)?.[1];
      const digits = block.match(/talent-calc\/rogue\/v(?:2|[a-z]+)([0-9-]*)/)?.[1];
      if (id && digits !== undefined) out[`${spec}/${id}`] = digits;
    }
  }
  return out;
}

const rows = parseCsv(readFileSync(src, 'utf8'));
if (!rows.length || !('dps' in rows[0]) || !('talents' in rows[0]) || !('duration' in rows[0])) {
  throw new Error('This CSV needs the columns talents, duration and dps.');
}
const unknown = [...new Set(rows.map((r) => r.talents))].filter((t) => !PRESETS[t]);
if (unknown.length) throw new Error(`Unknown build preset(s): ${unknown.join(', ')}. Add them to PRESETS in this script.`);

const links = buildLinks();
const races = [...new Set(rows.map((r) => r.settings))];
if (races.length !== 1) warn(`expected one race, found ${races.join(', ')}`);
const durations = [...new Set(rows.map((r) => Number(r.duration)))].sort((a, b) => a - b);

const builds = new Map();
for (const r of rows) {
  const p = PRESETS[r.talents];
  const want = links[p.build];
  if (want !== undefined && r.talents_string !== want) {
    warn(`${r.talents} ${r.duration}s: simmed with talents ${r.talents_string}, but ${p.build}'s link is ${want}; kept`);
  }
  const b = builds.get(p.id) ?? { id: p.id, name: p.name, gearSet: r.gear_set, sims: {} };
  builds.set(p.id, b);
  if (b.sims[r.duration]) warn(`${r.talents} ${r.duration}s appears twice; keeping the higher DPS`);
  const dps = Number(r.dps);
  if (!b.sims[r.duration] || dps > b.sims[r.duration].dps) b.sims[r.duration] = { dps, margin: Number(r.dps_margin_95) || 0 };
}

const best = Object.fromEntries(
  durations.map((d) => [d, Math.max(...[...builds.values()].map((b) => b.sims[d]?.dps ?? -Infinity))]),
);
const out = {
  generated: new Date(statSync(src).mtimeMs).toISOString().slice(0, 10),
  updated: new Date().toISOString(),
  race: races[0],
  durations,
  builds: [...builds.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((b) => ({
      id: b.id,
      name: b.name,
      sims: Object.fromEntries(
        durations.map((d) => {
          const s = b.sims[d];
          if (!s) {
            warn(`${b.id} ${d}s: no sim`);
            return [d, { pct: null }];
          }
          return [d, { pct: s.dps === best[d] ? 0 : Number(((s.dps / best[d] - 1) * 100).toFixed(3)), dps: Math.round(s.dps * 10) / 10 }];
        }),
      ),
    })),
};
writeFileSync(new URL('../src/content/gearSims.json', import.meta.url), JSON.stringify(out) + '\n');
console.log(`${out.builds.length} builds × ${durations.length} durations (${races.join(', ')}), generated ${out.generated}.`);
for (const d of durations) {
  const top = out.builds.find((b) => b.sims[d].pct === 0);
  console.log(`  ${d / 60} min: best ${top.name}; ` + out.builds.map((b) => `${b.name} ${b.sims[d].pct}`).join(', '));
}
