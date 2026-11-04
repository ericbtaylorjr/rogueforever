---
name: apl-rotation
description: Write or update a build's Rotation section (opener, rotation steps, pro tips) from the WoWSims Rogue APL, in parity with the sim. Use when asked to populate, update or check a rotation from an APL, or when a new APL JSON is pasted.
---

# APL → Rotation

The Rotation section must say what the WoWSims APL does for that build, nothing more.
No outside advice or opinions. When the APL looks wrong, still describe what the sim does
and tell the user separately.

## When to run it

Also run it, for the affected build only, whenever a build's **talent link** changes, even if the APL
didn't. Talents decide which rows the build can fire (Cold Blood, Ghostly Strike, Premeditation,
Preparation...), so a new talent adds a step and a dropped one removes it from the opener, steps and
tips. The `update-talents` skill covers the whole talent update (link, order, points); this one covers its rotation step. Pasting an APL identical to `scripts/apl/rogue.apl.json` changes nothing: look at the build's talents.

## Inputs

- `scripts/apl/rogue.apl.json`: the shared Rogue APL (the WoWSims export, as pasted).
  If the user pastes a new one, overwrite this file with it first. The sim's shipped
  default is `ui/specs/rogue/dps/apls/default.apl.json` in github.com/wowsims/forever.
- `scripts/apl/builds.json`: per build variable toggles and main hand type, matching the
  WoWSims preset build (`ui/specs/rogue/dps/presets.ts`). Add a build here if it's missing.
  The sim's Simple rotation sets `Use Backstab` and `Use Expose Armor`; everything else
  keeps the APL's value. Leveling builds have no preset (`wowsimsPreset: null`): their
  toggles follow the build's weapon and talents (Subtlety leveling turns on
  `Use Ambush Opener`), and the rotation is the APL run with the build's full talents.
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
   - `steps`: the core loop, listed as the **buttons a player presses, not the APL's priority order**
     (the APL checks its highest-priority row first, but readers think "what do I hit"). Order:
     1. the combo point builder first (Mutilate, Sinister Strike, Backstab, Hemorrhage), noted as your
        combo point builder;
     2. cooldown-gated abilities that fire whenever available (Shank, Ghostly Strike, Death Mark...);
     3. upkeep of debuffs and buffs: bleeds (Garrote, Rupture) then Slice and Dice, each noting when it
        is reapplied ("only once it has fallen off");
     4. cooldown-and-finisher pairs last (Cold Blood, then Eviscerate).
     Write combo point thresholds as "4+ combo points", never "4 or 5" or "4 or more" (Eviscerate's note
     is "With 4+ combo points.").
     The APL's real priority still decides *which conditions* go in each note; only the list order
     changes. Keep every number the APL uses. A short `note` says when or how long. The page adds
     "Then back to step 1." for level 60 builds only; leveling builds show neither that line nor an
     Opener, and their intro under the heading is fixed copy (`rotation.levelingIntro`, "This is the
     general rotation and priority to follow when leveling as {Spec Build}..."), so write nothing about
     either in a leveling build's rotation Example (Assassination Questing): Mutilate, Shank (on cooldown, under 80
     energy), Rupture (3+ combo points, if the mob lives 12s), Slice and Dice (only once fallen off),
     Cold Blood (off cooldown, only at 5 combo points), Eviscerate (with 4+ combo points).
   - `tips` (Pro tips): everything else, phrased as what to do, never "don't". Cooldowns,
     racials (one tip per race), trinkets ("Autocast other cooldowns", which includes Troll
     Berserking), items (Thistle Tea, potion), pooling, and edge cases like early or end
     of fight finishers. Keep every number the APL uses (thresholds, seconds, energy).
     `sweaty: true` for optional extra effort (Vanish for damage, early finishers).
   - Plain words: "Slice and Dice has 2s or less left", not "SnD Fall Imminent".
   - Reuse the shared wording in `src/content/builds/shared.ts` (`sliceAndDiceStep`, `tip.*`,
     `racialTips`) so the same APL row reads the same in every build. Tip order: melee
     uptime, Premeditation, Adrenaline Rush, Blade Flurry, trinkets, racials, Thistle Tea,
     pooling, then the sweaty ones (Vanish, early Eviscerate, end of fight).
   - `racialTips({ adrenalineRush, coldBlood })`: pass `coldBlood: false` only when the resolver lists
     Cold Blood as not known (the Night Elf tip then drops its "save Cold Blood" clause). If Cold Blood is
     in the build's rows, leave the default. A Cold Blood step reads `{ press: 'Cold Blood', note: "If it's
     off cooldown." }`, or "...and you have 5 combo points." when the builder adds 2 combo points
     (Mutilate) or the row requires exactly 5 and the Eviscerate has other conditions (Subtlety).
     Opener: "Cold Blood + Eviscerate".
   - Builds that resolve to the same rows share one constant (Combat Mutilate and the
     Assassination leveling builds share `mutilateRotation`'s rows, Combat Questing shares the
     Sinister Strike rows, Combat Dungeons the Backstab rows).
   - A build with the Riposte talent also gets `withRiposte(rotation, builder)` (see the
     `update-talents` skill). It's a talent tip, not an APL row, so don't derive it from the APL.
   - **Leveling builds** (`phase: 'leveling'`) never use the endgame constant as is. Wrap it in
     `forLeveling(rotation, [cooldown names])` from `shared.ts` (named `leveling<X>Rotation`,
     e.g. `levelingMutilateRotation` in combat.ts, used by Assassination Questing and Dungeons).
     It makes the leveling changes in one place: **leveling builds have no opener** (`opener: []`; the
     Rotation card hides the Opener panel, so skip step 3 for them), the racial and Thistle Tea
     tips go, and the trinket and cooldown tips fold into one line, "Pair your trinkets and racial
     with <cooldowns> on a powerful mob or big pull." The cooldown names are the tips it replaces, in rotation
     order (Adrenaline Rush and Blade Flurry for Combat, Blade Flurry for Assassination and
     Subtlety). A leveling-only rotation (Subtlety Questing and Dungeons) wraps its own
     definition. The offensive Vanish tip (Vanish into Garrote or Ambush) is swapped for "Use Vanish and Evasion
     as defensive abilities if threat becomes an issue." Premeditation, pooling and the other sweaty
     tips stay.
3. `opener` (level 60 builds only; leveling builds leave it `[]`): walk the priority list from the prepull actions at time 0 (stealthed, 0
   combo points, 100 energy, Slice and Dice down) until the first finisher. Prepull actions
   keep their timing, e.g. "Blade Flurry (-2s)". Don't fix counts that depend on crits or
   procs ("Sinister Strike to 5"). Keep manual edits the user made that differ from the
   APL. Combat Sinister Strike's opener is hand-edited: no Stealth or Garrote; it opens
   "Blade Flurry + Evasion + Major Frenzy Potion + Trinket + Racial (-1s)", then Sinister Strike, Slice and Dice,
   Adrenaline Rush, "Sinister Strike to 5CP", "Cold Blood + Eviscerate". Its first pro tip, on melee uptime,
   and the wording of the sweaty Vanish into Garrote tip (right after the opener, for
   damage and a threat reset) are also hand-edited; keep them.
   Every other build follows that pattern: one "(-1s)" step with Evasion, Major Frenzy
   Potion, Trinket and Racial (plus Blade Flurry when known), then the APL's presses to
   the first Eviscerate. Combat and Assassination skip Stealth and Garrote (Vanish into
   Garrote is the sweaty tip). Subtlety keeps the APL's stealth opener, since its talents
   are built on it: "Premeditation (-2s)", "Stealth + ... (-1s)", then Garrote or Ambush.
4. Check that every APL row the build can fire ended up in `steps`, `tips` or `opener`.
   Name items exactly (the sim's potion, e.g. "Major Frenzy Potion", not "Potion").
   Every spell and item name in the section is linked to Wowhead Forever with its
   tooltip (`WowheadText`). A new name needs an entry in `pinned` in
   `scripts/fetch-icons.mjs` with the id the sim casts, then `npm run icons`.
5. Refresh the build's summary, `talentNote` in the same build file (shown under the build name in
   the Talents card). Two or three short sentences: the damage profile (builder, finisher, bleeds
   and poisons, cleave, what boosts it), then the loop in the order of `steps`, naming the same
   spells. Rewrite it when the rotation changes so it never names a spell the rotation dropped
   (e.g. Ghostly Strike). Builds that share a rotation constant get the same loop in their summary.
   Also check the sibling builds' summaries when a shared constant changes.
6. `npm run typecheck`.
7. Report APL quirks: rows that can never fire, checks on spells the sim doesn't
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
