---
name: apl-rotation
description: Write or update a build's Rotation section (priority list, opener, nevers) from the WoWSims Rogue APL, in parity with the sim. Use when asked to populate, update or check a rotation from an APL, or when a new APL JSON is pasted.
---

# APL → Rotation

The Rotation section must say what the WoWSims APL does for that build, nothing more.
No outside advice or opinions. When the APL looks wrong, still describe what the sim does
and tell the user separately.

## Inputs

- `scripts/apl/rogue.apl.json`: the shared Rogue APL (the WoWSims export, as pasted).
  If the user pastes a new one, overwrite this file with it first. The sim's shipped
  default is `ui/specs/rogue/dps/apls/default.apl.json` in github.com/wowsims/forever.
- `scripts/apl/builds.json`: per build variable toggles and main hand type, matching the
  WoWSims preset build (`ui/specs/rogue/dps/presets.ts`). Add a build here if it's missing.
  The sim's Simple rotation sets `Use Backstab` and `Use Expose Armor`; everything else
  keeps the APL's value.
- `scripts/apl/spells.json`: every id the APL references. The resolver stops on an id
  that isn't listed; look it up in `sim/rogue/spell_data_auto_gen.go` and
  `sim/core/racials.go` (or wowhead.com/forever/spell=<id>) and add it.

## Steps

1. `npm run apl -- <spec>/<build-id>` for the race-neutral list, then once each with
   `--race orc`, `--race nightelf` and `--race gnome` to see what the racial rows do.
   The output lists the rows the build can fire, each condition with constants folded
   out, and the rows removed with the reason.
2. Turn the kept rows into `AplRow`s in `src/content/builds/<spec>.ts`, as a
   `<build>Rotation: Rotation` constant passed as the build's `rotation`:
   - Merge rows that cast the same spell into one (e.g. two Adrenaline Rush rows).
   - Fold the race-specific rows into a single "Racial cooldown" row, plus short race
     notes on the rows they change.
   - "Autocast other cooldowns" becomes a Trinkets row (Troll Berserking is autocast too).
   - Plain words: "Slice and Dice has 2s or less left", not "SnD Fall Imminent". Keep
     every number the APL uses (thresholds, seconds, energy).
   - `sweaty: true` only for rows that are optional extra effort (e.g. Vanish for damage).
3. Opener: walk the priority list from the prepull actions at time 0 (stealthed, 0 combo
   points, 100 energy, Slice and Dice down) until the first finisher. Prepull actions keep
   their timing, e.g. "Blade Flurry (-2s)". Don't fix counts that depend on crits or
   procs ("Sinister Strike to 5").
4. Nevers: only things the APL explicitly avoids (thresholds, gates, spells it never
   casts for this build).
5. `npm run typecheck`.
6. Report APL quirks: rows that can never fire, checks on spells the sim doesn't
   register (they are dropped, not false), toggles that break the build (e.g.
   `Use Backstab=true` on a sword build never casts a builder).

## How the sim reads an APL (sim/core/apl*.go)

- A spell or aura the character doesn't know resolves to nothing. And/Or drop those
  branches; Not and Compare with a missing side are dropped too. So a check on an
  unknown spell is ignored, not false.
- Spell/Talent/Aura Is Known fold to true/false constants.
- A Cast Spell of an unknown spell removes the row; a Strict Sequence drops its unknown
  steps and keeps the rest.
- Spells are matched by exact id and rank. A rank the sim doesn't register (e.g.
  Eviscerate rank 9, 31016) is unknown.
- Weapon and positional requirements (Backstab, Ambush, Mutilate need a dagger; Garrote,
  Backstab, Ambush need you behind) fail at cast time, so the row is skipped.
