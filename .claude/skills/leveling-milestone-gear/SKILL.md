---
name: leveling-milestone-gear
description: Rebuild the Leveling milestone gear lists (per leveling build, by level range) from Wowhead Forever data, each build's stat weights and the game's proc data. Use when asked to update or refresh the leveling gear, after new Forever items are decrypted, or after a leveling build's stat weights change.
---

# Leveling milestone gear

Six leveling builds (Assassination, Combat and Subtlety, each Questing and Dungeons) each get
their own list in `src/content/leveling-gear.json` (`builds["combat/questing"]`, …): the
major upgrades per slot, about one every 5–10 levels, for both factions. `scripts/gear-research/`
builds it (its README has the file-by-file detail); this skill is the run order and the judgment
calls. Never edit the JSON by hand: fix `curation.json` and re-emit.

## How items are scored

- **Stats** use the build's own weights, read from `src/content/builds/*.ts` by `weights.mjs`.
  So after the `update-stat-weights` skill changes a leveling build, rerun this.
- **Weapon damage**: DPS counts per hand (main 20 EP per DPS, off 9; slow weapons get a speed
  bonus for Sinister Strike, daggers for Backstab/Mutilate). Which weapons each build can use is
  `WEAPONS` in `rank.mjs` (Mutilate: daggers both hands; Backstab/Ambush builds: dagger main
  hand; Sinister Strike: slow main hand; off hand any weapon except Assassination).
- **Procs and use effects** are valued from the game's tables (`procs.mjs`, via wago.tools),
  not the tooltip: each effect becomes damage per second or an average stat, then EP. Extra
  attacks, flat and over-time damage, AP/Agility/Strength/crit/hit buffs and haste are modeled.
  Everything else (utility, absorbs, debuffs on the target) scores 0 and is flagged ⚠ in the
  report. On-hit effects the game data gives no rate for are assumed at 1 PPM (flagged `~`);
  `curation.json` `ppm` overrides one item.
- **Pinned items** (`curation.json` `pins`) are items known to matter that the model can't see
  or undervalues (Thrash Blade). They are forced into the list for the builds and slots they fit.
  The report's "Pinned items" table says how each scored and whether it would have been picked.

No sims: the sim only runs at level 60, so it can't rank level 20 gear. Proc values are
estimates, which is what the pins and the report's flags are for.

## Availability at launch

Only items players can actually get at launch belong in the list. `rank.mjs` enforces it:
- **Zones**: `curation.json` `notAtLaunch.zones` (Dire Maul now) keeps out drops from them, and crafted
  items whose recipe drops there. Add a zone id when the user names content that isn't in yet; remove
  it when it opens.
- **Recipes**: a crafted item is only as available as its recipe (`recipes.mjs` finds it, `sources.mjs`
  looks up where it comes from). A recipe with *no* source listed is not blocked, since new Forever
  recipes often have none; the report lists those picks for a human check.
- **Epics below level 60 are blocked by default** (Naxxramas-era quest rewards, Dire Maul recipes,
  raid-adjacent crafts). `allowEpic: [ids]` lets one in. The report's "kept out" section lists every
  strong item this blocked, so review it each run and unblock what is genuinely in the game.
- Anything else the user says isn't available goes in `exclude` with a `why`.

## Steps

1. `node scripts/gear-research/scan.mjs --revalidate` **first, every run**: re-reads every cached item and
   drops the ones Wowhead no longer has (Forever re-itemizes; an item recommended last month may be
   gone, like Blackstone Ring). Then `node scripts/gear-research/scan.mjs --missing` (re-checks ids
   Wowhead didn't have; long, run it in the background). Every few weeks, or after a big patch, do the full rescan in the README.
2. `node scripts/gear-research/procs.mjs` (proc and use data for the current Forever build; fast), then
   `node scripts/gear-research/recipes.mjs` (recipe items for crafted gear; fast).
3. `node scripts/gear-research/rank.mjs`, then `node scripts/gear-research/sources.mjs` (slow and
   polite, only new items), then `rank.mjs` again until it says `0 without sources`.
4. Read `scripts/gear-research/cache/report.md` before emitting:
   - **Pinned items**: any pin that now lands badly means a template or rate is off.
   - **⚠ and ~** rows: judge those by hand. Add a pin, a `ppm`, or an `exclude`/`allow`/`level`
     correction in `curation.json` (never in the JSON) and rerun.
   - "Kept out" and "recipe source Wowhead doesn't list": confirm with the user which are really in the
     game at launch; `exclude` the ones that aren't, `allowEpic` the ones that are.
   - Faction: Wowhead only flags faction on the item itself, so a quest reward from a faction-only
     quest can read "Both". Check quest picks (`Quest:` sources) and fix with `curation.json` `faction`.
   - Each build's tables: sanity-check the picks against the weapon types and the Handbook
     builds (dagger builds shouldn't get slow weapons in the main hand).
5. `node scripts/gear-research/rank.mjs --emit`, then `npm run icons` (icons and rarity for new items).
6. `npm run typecheck`, then check the Gear section on a leveling build (all three brackets,
   both factions, spot-check a few Wowhead links). Don't commit unless asked.

## Report

Tell the user, per build: how many picks, which are new or changed (`git diff
src/content/leveling-gear.json`), which pinned items made it, and what the model couldn't judge
(⚠ items and assumed rates). Say if the scan found newly decrypted items.
