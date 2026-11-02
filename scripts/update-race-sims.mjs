#!/usr/bin/env node
/**
 * Rebuild src/content/raceSims.json (the Races section's chart) from a WoWSims race-by-spec
 * export: `npm run race-sims -- path/to/rogue_race_by_spec_duration.json`.
 *
 * Keeps only what the chart draws: per spec and duration, each race's % behind the best race
 * and the sim's relative link (the page prefixes https://www.wowsims.com). The best race has
 * pct 0. `updated` is when this script ran (shown as the chart's "Last updated"). Races and builds are listed alphabetically, and the two Skyborne races (High Order and Windshaper)
 * are one "Skyborne" row: they sim identically, so the first one's numbers and link are kept
 * (the script warns if they ever differ, and keeps the better one).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) {
  console.error('Usage: npm run race-sims -- <rogue_race_by_spec_duration.json>');
  process.exit(1);
}
const data = JSON.parse(readFileSync(src, 'utf8'));

const nameOf = (r) => (/Skyborne$/.test(r.id) ? 'Skyborne' : r.name);
const raceNames = [...new Set(data.races.map(nameOf))].sort((a, b) => a.localeCompare(b));

const out = {
  generated: data.meta.generated,
  updated: new Date().toISOString(),
  durations: data.durations,
  races: raceNames,
  specs: [...data.specs]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => ({
      id: s.id,
      name: s.name,
      sims: Object.fromEntries(
        data.durations.map((d) => {
          const block = s.durations[String(d)];
          const byName = new Map();
          for (const r of data.races) {
            const x = block.races[r.id];
            const sim = { pct: r.id === block.bestRace ? 0 : Number(x.relativeToBestPct.toFixed(3)), link: x.link };
            const prev = byName.get(nameOf(r));
            if (prev && prev.pct !== sim.pct) {
              console.warn(
                `! ${s.id} ${d}s: ${r.name} differs from ${prev.from} (${sim.pct} vs ${prev.pct}); keeping the better`,
              );
            }
            if (!prev || sim.pct > prev.pct) byName.set(nameOf(r), { ...sim, from: r.name });
          }
          return [d, raceNames.map((n) => ({ pct: byName.get(n).pct, link: byName.get(n).link }))];
        }),
      ),
    })),
};
writeFileSync(new URL('../src/content/raceSims.json', import.meta.url), JSON.stringify(out) + '\n');
console.log(`${out.specs.length} specs × ${out.durations.length} durations × ${out.races.length} races`);
