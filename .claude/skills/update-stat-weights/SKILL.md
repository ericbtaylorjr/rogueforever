---
name: update-stat-weights
description: Update a build's stat weights (EP) from a WoWSims stat weights table, pasted or as a screenshot. Use when the user gives new stat weights for a build.
---

# Update stat weights

Stat weights live in `src/content/builds/<spec>.ts` as a `StatPriority` (`relativeTo: 'Attack Power'`,
`stats: [{ stat, ep, op? }]`). The Stats section renders them in the order given.

## Input

A WoWSims weights table (Stat, DPS EP, Current EP). Use the **Current EP** column, which is
what the user has set. Read every row, including ones you'll drop.

## Rules (always apply)

1. **Drop** Main Hand DPS, Off Hand DPS and Bonus Weapon Damage. They are never listed.
2. **Stamina is always `0.01`.** If the sim shows 0 (or 0.00), write 0.01. Always keep it, last.
3. Keep the stat names the file already uses ("Hit Rating", "Expertise Rating", "Agility",
   "Crit Rating", "Haste Rating", "Strength", "Attack Power", "Armor Penetration",
   "Spell Piercing", "Stamina").
4. Sort by `ep` descending. The first entry has no `op`. Every later entry gets `op: '>'`,
   or `op: '='` when its `ep` equals the previous entry's. Keep the numbers as shown (two decimals).
5. `relativeTo` stays `'Attack Power'` (= 1.00).

## Where

- A spec's builds share one `stats` const unless a build has its own. If the new weights are
  for one build whose weights differ from its siblings, add a named const (e.g. `backstabStats`
  in combat.ts, with a one-line doc comment) and set `stats: <const>` on that build only.
  Don't change the shared const unless the user says the whole spec changed.
- If the user names a build whose weights already have their own const, edit that const.

## Finish

Run `npm run typecheck`. If the build is a leveling build (Questing or Dungeons), its Leveling milestone gear is scored with these weights, so say the `leveling-milestone-gear` skill should be rerun. Then tell the user which build changed and note any value that moved
a lot or reordered the priority. Don't commit unless asked.
