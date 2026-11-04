---
name: rogue-rework
description: Runbook for redoing every build after the Nov 2 2026 Rogue rework (new talent tree, Shank, Poised, Death Mark, poison changes) once WoWSims and Wowhead Forever are updated. Use when the user says the rework build is live, WoWSims is updated, or asks what's left to redo.
---

# Rogue rework runbook

The Nov 2 Forever beta notes
(https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-november-2/2360696/9)
moved, removed and added Rogue talents and added Shank, Poised and Death Mark. Every
build's calculator link is positional (one digit per talent slot), so **all of them break**
together once Wowhead's tree changes. This skill sequences the existing skills; it
doesn't replace them. Don't start until the user says WoWSims and Wowhead are updated.

Every build carries `stale: true` (types.ts) until it is redone; that shows a
"pre-rework" note on Talents, Stats and Rotation. `npm run talent-audit` lists what is
still flagged, so it is the progress tracker.

## Status (update as you go)

- Done 2026-11-04: talent trees refreshed; new APL in `scripts/apl/rogue.apl.json`; the five level 60 builds
  (Assassination Mutilate, Combat Sinister Strike, Combat Backstab, Combat Venom, Subtlety Hemo) have their links
  (built from screenshots, so no learning order), point splits and rotations. Combat Mutilate and Subtlety Backstab were
  removed. Their stat weights were added after, and `stale` was deleted from all five.
- Leveling builds were emptied on purpose (`noStats`, `noRotation`, blank calculator link; the old rows and weights are gone,
  `git log` has them). Refill each with `update-talents`, `update-stat-weights` and `apl-rotation` (which can use `forLeveling`
  and `withRiposte` in shared.ts), then delete its `stale: true`. `leveling-milestone-gear` reads their weights, so it needs
  them back first (it would score every item 0 now).
- Pending: every leveling build (links, weights, rotations; their rotation constants are
  `preRework*` in combat.ts and the quest/dungeon rotations in subtlety.ts until redone); the New to Rogue guide
  entries that still describe Murder and the Venom finisher (content.json); gear-research follow-ups below.

## 0. Preconditions

- Wowhead Forever's calculator data has the new tree (`npm run talents` shows Shank-era
  talents such as Boot Knife, Blood Splatter, Death Mark; no Murder, Thousand Cuts).
- The user has WoWSims builds ready: talent links, stat weights, an APL export, race sims.
  Never guess a link or weights.

## 1. Refresh the data

1. `npm run talents` rewrites `talent-trees.json` and the talent icons. Every build link
   will now be listed as not fitting: expected.
2. `npm run talent-audit` diffs the trees against git HEAD and greps the prose for each
   removed, renamed or changed talent (copy.ts `murderTip`, subtlety.ts comments, content.json,
   the skills). Fix each mention. A talent whose *effect* changed (Lethality, Venom, Seal Fate,
   Mutilate, Dual Wield Specialization) is flagged even when its name is the same.
3. New spells (Shank, Poised, Death Mark, Boot Knife, Blood Splatter, Quick Getaway):
   add their ids to `scripts/apl/spells.json` (with `talent`/`requires` where they
   depend on a talent, as the existing entries do), add the new APL variables to
   `scripts/apl/builds.json` if the export has any, then `npm run icons`.
4. Overwrite `scripts/apl/rogue.apl.json` with the new WoWSims export.

## 2. Per build (work one build at a time, ship as you go)

Order inside a build: talents, stat weights, rotation, summary. Use these skills:

1. `update-talents` (link, then `npm run talents -- --fix` for the point split).
2. `update-stat-weights`.
3. `apl-rotation` (`npm run apl -- <spec>/<id>`, with `--race` runs).
4. When all three are done, **delete the build's `stale: true`**.

Then `npm run talents -- --check`, `npm run typecheck`, and commit per build or per spec.
Builds that share a stats or rotation constant get fixed together; check siblings.

## 3. After the builds

- `leveling-milestone-gear`: rerun for the leveling builds. First revisit
  `scripts/gear-research/rank.mjs` weapon assumptions: Shank strikes with the **off-hand**
  for 50% weapon damage, Dual Wield Specialization is now 2 points (25/50% off-hand damage),
  and the poison coefficients doubled. The constants for main/off-hand DPS EP (20 and 9) were
  never sim-derived; take them from the new sims (`dpsEp` per build overrides them).
- `update-race-sims`: the new sims, then the Races tip "within about 1%" is already out of
  date with the chart thresholds; fix it while there.
- Leveling spells: Shank is level 24, Poised level 18; check the leveling copy, macros
  and any "level N" claims that mention rogue abilities.
- Stat/formula copy that names poisons, Mutilate, Murder (`copy.ts`, content.json).
- Remove the Overview banner (`hero.banner`, `Notice()` in Overview.tsx), add a changelog
  entry, and update the spec outlook (`specBoard`/Meta ranks and grades) from the new sims.

## 4. Finish

`npm run talent-audit` should report no stale builds. Run `audit-accessibility` once
(the stale note and the new talents add UI). Commit and push only when asked.
