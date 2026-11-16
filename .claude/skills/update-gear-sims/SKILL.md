---
name: update-gear-sims
description: Update the Meta breakdown > End Game "Pre-raid BiS performance" table from a WoWSims batch CSV (batch.csv). Use when the user gives a new batch CSV of end game builds in their Pre-raid BiS gear, or says to refresh that table.
---

# Update the Pre-raid BiS performance table

The table (`src/components/sections/GearSims.tsx`, under Spec Meta on the End Game tab) reads
`src/content/gearSims.json`, which is generated, never hand-edited.

## Input

`batch.csv`, one row per build × encounter length (`talents` = the WoWSims preset name, `talents_string`,
`duration` in seconds, `dps`, `dps_margin_95`, `gear_set`, `settings` = the race). The current runs are
**Undead**, 1/2/3/5 minutes, no mob or zone type; the table intro in `gearSimsCopy` (`copy.ts`) says so,
so change it if the setup changes. From WSL the user's Downloads folder is
`/mnt/c/Users/<name>/Downloads/` (`ls -d /mnt/c/Users/*/Downloads/*.csv`).

## Steps

1. `npm run gear-sims -- <path-to-batch.csv>`. It rewrites `gearSims.json`, stamps `updated` (the run time,
   shown as "Last updated", US Eastern) and prints each length's % behind the best build. **Re-run it any time
   the data is adjusted** so the stamp moves. Read every `!` warning: a `talents_string` that doesn't match
   the build's calculator link means the sim used other talents (kept, but tell the user).
2. A new preset needs a line in `PRESETS` at the top of the script.
3. `npm run typecheck`, then check it in the browser (dark and light, 390px phone).
4. Don't commit unless asked.

## Rules

- % is behind the best **build** per encounter length; the best says "BEST". Builds are alphabetical.
- Colours (`tierOf` in the component): green best or within 0.5% (`pct >= -0.5`), yellow to 3% behind, red past
  3%. Keep `gearSimsCopy.legend` in step.
- The Pre-raid BiS gear itself comes from the `update-endgame-gear` skill; re-sim after it changes.

## Report

Which build is best at each length, how the spread moved, the export's `generated` date and the new stamp,
and any talents-mismatch or missing-sim warnings.
