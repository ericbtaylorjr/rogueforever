#!/usr/bin/env node
/**
 * Rebuild src/content/raceSims.json (the Races section's chart) from a WoWSims race export:
 * `npm run race-sims -- path/to/export.json` or `... path/to/wow-racials.csv`.
 *
 * Two input shapes (chosen by file extension):
 *  - JSON (rogue_race_by_spec_duration.json): per spec and duration, each race's % behind the best race
 *    and the sim's relative link.
 *  - CSV (wow-racials.csv): one row per build × race × duration with its DPS. % behind the best race is
 *    worked out here (per build and duration). The CSV has no sim links, so those cells aren't clickable.
 *
 * Keeps only what the chart draws: pct and (when there is one) the sim's relative link (the page prefixes
 * https://www.wowsims.com). The best race has pct 0; a missing sim is pct null. `updated` is when this
 * script ran (shown as the chart's "Last updated"). Races and builds are listed alphabetically, and the two
 * Skyborne races (High Order and Windshaper) are one "Skyborne" row: they sim identically, so the better one is
 * kept (the script warns if they differ by more than the sim's own margin of error).
 */
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';

const src = process.argv[2];
if (!src) {
  console.error('Usage: npm run race-sims -- <rogue_race_by_spec_duration.json | wow-racials.csv>');
  process.exit(1);
}

/**
 * CSV builds are named by their WoWSims preset (the `talents` column). Each maps to the Handbook build whose
 * talent link must match the row's `talents_string`. Add a line when a new preset shows up.
 */
const PRESETS = {
  'Asn Muti': { id: 'assassination_mutilate', name: 'Assassination Mutilate', build: 'assassination/mutilate' },
  'Combat SS': { id: 'combat_sinister_strike', name: 'Combat Sinister Strike', build: 'combat/sinister-strike' },
  'Combat BS': { id: 'combat_backstab', name: 'Combat Backstab', build: 'combat/backstab' },
  'Combat Venom': { id: 'combat_venom', name: 'Combat Venom', build: 'combat/venom' },
  'Subtlety Hemo': { id: 'subtlety_hemo', name: 'Subtlety Hemo', build: 'subtlety/hemo' },
};

const isSkyborne = (name) => /Skyborne$/.test(name);
const raceKey = (name) => (isSkyborne(name) ? 'Skyborne' : name);
const warn = (m) => console.warn(`! ${m}`);

/** RFC 4180-ish: quoted fields may hold commas, quotes ("") and newlines. */
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

/** The v2 digits of each build's calculator link, keyed `spec/id`, to catch a CSV row simmed with other talents. */
function buildLinks() {
  const out = {};
  for (const spec of ['assassination', 'combat', 'subtlety']) {
    const file = readFileSync(new URL(`../src/content/builds/${spec}.ts`, import.meta.url), 'utf8');
    for (const block of file.split(/\n {2}\{\n/).slice(1)) {
      const id = block.match(/\bid: '([^']+)'/)?.[1];
      const digits = block.match(/talent-calc\/rogue\/v2([0-9-]*)/)?.[1];
      if (id && digits !== undefined) out[`${spec}/${id}`] = digits;
    }
  }
  return out;
}

/** → { generated, durations, races: [{name, raw}], specs: [{ id, name, sims: { [d]: { [raceName]: { dps?, pct?, link? } } } }] } */
function fromCsv(path) {
  const rows = parseCsv(readFileSync(path, 'utf8'));
  if (!rows.length || !('dps' in rows[0]) || !('settings' in rows[0])) {
    throw new Error('This CSV needs the columns talents, duration, settings (race) and dps.');
  }
  const links = buildLinks();
  const unknown = [...new Set(rows.map((r) => r.talents))].filter((t) => !PRESETS[t]);
  if (unknown.length) throw new Error(`Unknown build preset(s): ${unknown.join(', ')}. Add them to PRESETS in this script.`);

  // Which gear set each preset normally uses, to spot a row simmed with another build's setup.
  const gearVotes = {};
  for (const r of rows) {
    const g = (gearVotes[r.talents] ??= {});
    g[r.gear_set] = (g[r.gear_set] ?? 0) + 1;
  }
  const usualGear = Object.fromEntries(
    Object.entries(gearVotes).map(([t, g]) => [t, Object.entries(g).sort((a, b) => b[1] - a[1])[0][0]]),
  );

  const durations = [...new Set(rows.map((r) => Number(r.duration)))].sort((a, b) => a - b);
  const races = [...new Set(rows.map((r) => r.settings))];
  const specs = new Map();
  for (const r of rows) {
    const p = PRESETS[r.talents];
    const want = links[p.build];
    if (want !== undefined && r.talents_string !== want) {
      warn(`${r.talents} ${r.settings} ${r.duration}s: talents ${r.talents_string} don't match ${p.build}'s link (${want}); skipped`);
      continue;
    }
    if (r.gear_set !== usualGear[r.talents]) {
      warn(
        `${r.talents} ${r.settings} ${r.duration}s: simmed with ${r.gear_set}/${r.rotation} (usually ${usualGear[r.talents]}), ${Number(r.dps).toFixed(1)} DPS; skipped, so that cell is empty`,
      );
      continue;
    }
    const spec = specs.get(p.id) ?? { id: p.id, name: p.name, sims: {} };
    specs.set(p.id, spec);
    const block = (spec.sims[r.duration] ??= {});
    if (block[r.settings]) warn(`${r.talents} ${r.settings} ${r.duration}s appears twice; keeping the higher DPS`);
    const prev = block[r.settings];
    const dps = Number(r.dps);
    if (!prev || dps > prev.dps) block[r.settings] = { dps, margin: Number(r.dps_margin_95) || 0 };
  }
  const generated = new Date(statSync(path).mtimeMs).toISOString().slice(0, 10);
  return { generated, durations, races, specs: [...specs.values()], fromCsv: true };
}

function fromJson(path) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const names = new Map(data.races.map((r) => [r.id, r.name]));
  const specs = data.specs.map((s) => ({
    id: s.id,
    name: s.name,
    sims: Object.fromEntries(
      data.durations.map((d) => {
        const block = s.durations[String(d)];
        return [
          d,
          Object.fromEntries(
            data.races.map((r) => {
              const x = block.races[r.id];
              return [r.name, { pct: r.id === block.bestRace ? 0 : Number(x.relativeToBestPct.toFixed(3)), link: x.link }];
            }),
          ),
        ];
      }),
    ),
  }));
  return { generated: data.meta.generated, durations: data.durations, races: [...names.values()], specs, fromCsv: false };
}

const input = extname(src).toLowerCase() === '.csv' ? fromCsv(src) : fromJson(src);
const raceNames = [...new Set(input.races.map(raceKey))].sort((a, b) => a.localeCompare(b));

const out = {
  generated: input.generated,
  updated: new Date().toISOString(),
  durations: input.durations,
  races: raceNames,
  specs: [...input.specs]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => ({
      id: s.id,
      name: s.name,
      sims: Object.fromEntries(
        input.durations.map((d) => {
          const block = s.sims[String(d)] ?? {};
          // CSV rows hold DPS: % behind the build's best race (before merging, so a Skyborne tie can't lower it).
          const best = Math.max(...Object.values(block).map((x) => x.dps ?? -Infinity));
          const byName = new Map();
          for (const [raw, x] of Object.entries(block)) {
            const sim = x.dps !== undefined
              ? { pct: x.dps === best ? 0 : Number(((x.dps / best - 1) * 100).toFixed(3)), dps: x.dps, margin: x.margin }
              : { pct: x.pct, link: x.link };
            const key = raceKey(raw);
            const prev = byName.get(key);
            if (prev && Math.abs(prev.pct - sim.pct) > (input.fromCsv ? ((prev.margin + sim.margin) / best) * 100 : 0)) {
              warn(`${s.id} ${d}s: ${raw} differs from ${prev.from} (${sim.pct} vs ${prev.pct}); keeping the better`);
            }
            if (!prev || sim.pct > prev.pct) byName.set(key, { ...sim, from: raw });
          }
          const cells = raceNames.map((n) => {
            const hit = byName.get(n);
            if (!hit) return { pct: null };
            return hit.link ? { pct: hit.pct, link: hit.link } : { pct: hit.pct };
          });
          const missing = raceNames.filter((n, i) => cells[i].pct === null);
          if (missing.length) warn(`${s.id} ${d}s: no sim for ${missing.join(', ')}`);
          return [d, cells];
        }),
      ),
    })),
};
writeFileSync(new URL('../src/content/raceSims.json', import.meta.url), JSON.stringify(out) + '\n');
const linked = out.specs.some((s) => Object.values(s.sims).some((c) => c.some((x) => x.link)));
console.log(`${out.specs.length} specs × ${out.durations.length} durations × ${out.races.length} races${linked ? '' : ' (no sim links in this export)'}`);
