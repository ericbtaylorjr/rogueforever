---
name: update-race-sims
description: Update the Races section's "Race performance by build" chart from a WoWSims race-by-spec export (rogue_race_by_spec_duration.json). Use when the user gives a new race sim JSON, or says to refresh the race chart or race data.
---

# Update the race performance chart

The chart in the Races section (`src/components/sections/RaceSims.tsx`) reads
`src/content/raceSims.json`, which is generated, never hand-edited.

## Input

A JSON export with `meta`, `durations` (seconds), `races`, and `specs`. Each spec has
`durations[<seconds>].races[<RaceId>]` with `relativeToBestPct` (0 or negative) and a relative
`link` into wowsims.com, plus `bestRace` per duration. The user usually keeps it at
`~/Downloads/rogue_race_by_spec_duration.json`; from WSL that is
`/mnt/c/Users/<name>/Downloads/` (find it with `ls -d /mnt/c/Users/*/Downloads/*.json`).

## Steps

1. `npm run race-sims -- <path-to-json>`. It rewrites `src/content/raceSims.json` and prints
   `specs × durations × races`. It also stamps `updated` (the run time), which the chart shows
   at the bottom as "Last updated: Nov 2, 2026" (the date, US Eastern). **Any time the data is adjusted, re-run the
   script (never edit `raceSims.json` by hand) so the stamp moves with it.** Always expect **8 races** (see rules). Read any `!` warning.
2. `npm run typecheck`, then `npm run build` (the data is a lazy chunk, about 135 KB, 6 KB gzipped).
3. Check it renders: `npx vite preview --port 4173 --strictPort &`, open `/#races`, scroll the
   chart into view (it loads when it nears the viewport) and look at dark and light themes and a
   390px phone. Spot-check one cell's link: `https://www.wowsims.com` + the relative link.
4. If the export has new specs, races or durations, say so; the component draws whatever the
   JSON holds (build pills from `specs`, columns from `durations`), so no code change is needed.
5. Don't commit unless asked.

## Rules the script applies (keep them)

- **Skyborne is one row.** High Order Skyborne and Windshaper Skyborne sim identically, so they
  merge into "Skyborne" using the first one's numbers and link. If the script warns that they
  differ, tell the user, since the merge then hides a real gap.
- **Races are alphabetical**, top to bottom, and **builds are alphabetical** left to right (the filter pills).
- Only `pct` and `link` are kept; the best race in each duration has `pct` 0 and shows "BEST".
- Colours (`tierOf` in the component): green for the best race and anything within 0.5% of it (`pct >= -0.5`; the best race itself says "BEST", the rest show their %), yellow up to 2% behind (`pct >= -2`), red past 2%. Keep the legend labels in `racesCopy.sims.legend` in step.
- Links get the `https://www.wowsims.com` prefix in the component, and open in a new tab.

## Report

Tell the user: the export's `generated` date and the new "Last updated" stamp, spec/duration/race counts, and anything that moved
notably (a different best race for a build, or the spread across races growing or shrinking). The
Races intro tip claims races are "within about 1%": if the data now shows a wider spread, flag
that the tip is out of date rather than editing it silently.
