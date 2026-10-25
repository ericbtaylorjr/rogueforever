---
name: apl-rotation
description: Write or update a build's Rotation section (opener, rotation steps, pro tips) from the WoWSims Rogue APL, in parity with the sim. Use when asked to populate, update or check a rotation from an APL, or when a new APL JSON is pasted.
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
2. Split the kept rows into a `<build>Rotation: Rotation` constant in
   `src/content/builds/<spec>.ts`, passed as the build's `rotation`. Readers want buttons
   to press, not APL conditions:
   - `steps`: the core loop of builders and finishers, in the order you press them
     (e.g. Slice and Dice only once it falls off, Sinister Strike until 5 combo points,
     Cold Blood if ready, Eviscerate). A short `note` says when or how long. The page
     adds "Then back to step 1."
   - `tips` (Pro tips): everything else, phrased as what to do, never "don't". Cooldowns,
     racials (one tip per race), trinkets ("Autocast other cooldowns", which includes Troll
     Berserking), items (Thistle Tea, potion), pooling, and edge cases like early or end
     of fight finishers. Keep every number the APL uses (thresholds, seconds, energy).
     `sweaty: true` for optional extra effort (Vanish for damage, early finishers).
   - Plain words: "Slice and Dice has 2s or less left", not "SnD Fall Imminent".
3. `opener`: walk the priority list from the prepull actions at time 0 (stealthed, 0
   combo points, 100 energy, Slice and Dice down) until the first finisher. Prepull actions
   keep their timing, e.g. "Blade Flurry (-2s)". Don't fix counts that depend on crits or
   procs ("Sinister Strike to 5"). Keep manual edits the user made that differ from the
   APL. Combat Sinister Strike's opener is hand-edited: no Stealth or Garrote; it opens
   "Blade Flurry + Evasion + Major Frenzy Potion + Trinket + Racial (-1s)", then Sinister Strike, Slice and Dice,
   Adrenaline Rush, "Sinister Strike to 5CP", "Cold Blood + Eviscerate". Its first pro tip, on melee uptime,
   and the wording of the sweaty Vanish into Garrote tip (right after the opener, for
   damage and a threat reset) are also hand-edited; keep them.
4. Check that every APL row the build can fire ended up in `steps`, `tips` or `opener`.
   Name items exactly (the sim's potion, e.g. "Major Frenzy Potion", not "Potion").
   Every spell and item name in the section is linked to Wowhead Forever with its
   tooltip (`WowheadText`). A new name needs an entry in `pinned` in
   `scripts/fetch-icons.mjs` with the id the sim casts, then `npm run icons`.
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
