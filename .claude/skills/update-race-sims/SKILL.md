---
name: update-race-sims
description: Update the Races section's "Race performance by build" chart from a WoWSims race export, either rogue_race_by_spec_duration.json or wow-racials.csv. Use when the user gives a new race sim JSON or CSV, or says to refresh the race chart or race data.
---

# Update the race performance chart

The chart in the Races section (`src/components/sections/RaceSims.tsx`) reads
`src/content/raceSims.json`, which is generated, never hand-edited.

## Input

Either file; `npm run race-sims -- <path>` picks the parser from the extension. From WSL the user's
Downloads folder is `/mnt/c/Users/<name>/Downloads/` (find it with `ls -d /mnt/c/Users/*/Downloads/*.{json,csv}`).

- **JSON** (`rogue_race_by_spec_duration.json`): `meta`, `durations` (seconds), `races`, and `specs`. Each spec has
  `durations[<seconds>].races[<RaceId>]` with `relativeToBestPct` (0 or negative) and a relative `link` into
  wowsims.com, plus `bestRace` per duration. Cells link to the sim.
- **CSV** (`wow-racials.csv`): one row per build × race × encounter length, with `talents` (the WoWSims preset name,
  e.g. `Combat SS`), `talents_string`, `duration` (seconds), `settings` (the race), `dps`, `dps_margin_95`, `gear_set`
  and `rotation`, then gear columns the chart ignores. It has **no sim links**, so its cells show the % but aren't
  clickable (the "Click any cell" hint hides itself). % behind is computed per build and duration from `dps`
  against that build's best race. `generated` is the file's modified date.
  - Preset names map to Handbook builds in `PRESETS` at the top of `scripts/update-race-sims.mjs` (add a line for a new
    build). The script also checks each row's `talents_string` against that build's calculator link in
    `src/content/builds/*.ts` and skips a row that doesn't match.
  - A row simmed with another build's gear set (the odd one out for its preset) is skipped with a warning and that
    cell shows an em dash ("no simulation"). The Nov 3 file had one: Combat Backstab's Dwarf row was labelled Combat SS
    with Daggers/BS. Tell the user so they can re-export it.

## Steps

1. `npm run race-sims -- <path-to-json>`. It rewrites `src/content/raceSims.json` and prints
   `specs × durations × races`. It also stamps `updated` (the run time), which the chart shows
   at the bottom as "Last updated: Nov 2, 2026" (the date, US Eastern). **Any time the data is adjusted, re-run the
   script (never edit `raceSims.json` by hand) so the stamp moves with it.** Always expect **8 races** (see rules). Read every `!` warning and pass the important ones on.
2. `npm run typecheck`, then `npm run build` (the data is a lazy chunk, about 135 KB, 6 KB gzipped).
3. Check it renders: `npx vite preview --port 4173 --strictPort &`, open `/#races`, scroll the
   chart into view (it loads when it nears the viewport) and look at dark and light themes and a
   390px phone. Spot-check one cell's link: `https://www.wowsims.com` + the relative link.
4. If the export has new specs, races or durations, say so; the component draws whatever the
   JSON holds (build pills from `specs`, columns from `durations`), so no code change is needed.
5. Don't commit unless asked.

## Rules the script applies (keep them)

- **Skyborne is one row.** High Order Skyborne and Windshaper Skyborne sim identically, so they
  merge into "Skyborne", keeping the better of the two (the JSON's numbers and link; for the CSV, the higher DPS).
  The script warns if they differ by more than the export allows (zero for JSON, the sims' combined 95% margin for
  CSV), since the merge then hides a real gap.
- **Races are alphabetical**, top to bottom, and **builds are alphabetical** left to right (the filter pills).
- Only `pct` and (when the export has one) `link` are kept; a missing sim is `pct: null`; the best race in each duration has `pct` 0 and shows "BEST".
- Colours (`tierOf` in the component): green for the best race and anything within 0.5% of it (`pct >= -0.5`; the best race itself says "BEST", the rest show their %), yellow up to 2% behind (`pct >= -2`), red past 2%. Keep the legend labels in `racesCopy.sims.legend` in step.
- Links get the `https://www.wowsims.com` prefix in the component, and open in a new tab.

## Report

Tell the user: which format it was, whether the cells link to sims, the export's `generated` date and the new "Last updated" stamp, spec/duration/race counts, and anything that moved
notably (a different best race for a build, or the spread across races growing or shrinking). The
Races intro tip claims races are "within about 1%": if the data now shows a wider spread, flag
that the tip is out of date rather than editing it silently.
