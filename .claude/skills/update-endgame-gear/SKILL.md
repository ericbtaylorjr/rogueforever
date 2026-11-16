---
name: update-endgame-gear
description: Update a level 60 (end game) build's Pre-raid BiS or Best in Slot gear list from a WoWSims gear export (Export > JSON). Use when the user pastes a WoWSims gear JSON for an end game build, or asks to change its gear or enchants.
---

# Update an end game build's gear

An end game build's `gear` is `{ prebis: GearItem[], bis: GearItem[] }` in `src/content/builds/<spec>.ts`
(a `<build>Gear` constant above the build, like `mutilateGear` in `assassination.ts`). An empty list
renders "coming soon"; builds with nothing yet use `noEndgameGear` from `shared.ts`. Leveling builds
are different: they're generated (`leveling-milestone-gear` skill), never hand-edited.

## Steps

1. **Which build and which list?** The user says (e.g. "Pre-raid BiS for Assassination Mutilate"). If
   the list isn't named, ask. Only replace the list they named; leave the other as it is.
2. **Draft the lines.** Save the pasted JSON to the scratchpad and run
   `node scripts/endgame-gear/lookup.mjs <file>`. It reads the Forever item database from
   `origin/master` (same as the gear research) and prints one `GearItem` per filled slot, in the
   WoWSims equipment order mapped to the Handbook's slot names: Head, Neck, Shoulders, Back, Chest,
   Wrists, Hands, Waist, Legs, Feet, Ring 1, Ring 2, Trinket 1, Trinket 2, Main hand, Off hand, Ranged.
   Empty slots are skipped (they render as "Not listed"); say so in the report.
3. **Tidy each line by hand.** The script's output is a draft:
   - `source`: write it the way the Handbook reads: "Vendor (Ironforge / Orgrimmar)", "Leatherworking"
     (the script prints the profession id; 8 = Leatherworking), "Baron Rivendare (Stratholme)",
     "Quest: In Dreams". Drop duplicate zone variants.
   - `enchant`: the short display text players recognize ("+8 Agility", "Greater Stats", "Crusader",
     "Minor Speed"), since the column is narrow. Keep the script's `enchantSpellId`; the Gear table
     links it to `wowhead.com/forever/spell=<id>` with a live tooltip. If the script lists several
     candidate spells for one enchant id, pick the right one by name for the slot and mention the
     choice. If an enchant has no spell id, drop `enchantSpellId` and it renders as plain text.
   - `quality` comes from the database (`rare`, `epic`, ...). `boe`/`bop` are only for BoE items or
     BoP crafts.
   - Notes the script prints as `// ...` (no source recorded, zone not in at launch, ...) go in your
     report; don't ship the comment. Content not in at launch (`curation.json` `notAtLaunch`): keep it
     if the user gave it, but say so.
4. **Write it.** End game Pre-raid BiS is built by `preRaidGear` in `src/content/builds/shared.ts`: the
   slots the builds share (head, neck, shoulders, back, chest, wrists, hands, waist, feet, rings, ranged)
   live once in `preRaidShared`, and each build passes only what differs: `trinkets`, `legs` (leg enchant:
   `none` / `agility` / `rapidity`, add a key to `legEnchant` for a new one), `mainHand` and `offHand`
   (`[weapons.x, 'crusader' | 'agility']`). New trinkets and weapons go in the `trinkets` / `weapons`
   tables there. If a change touches a shared slot, edit `preRaidShared` and say it moves every build;
   if the new export differs from the others in a shared slot for one build only, move that slot into the
   per-build options. Best in Slot lists (`bis`) are still plain `GearItem[]`. Use single quotes unless
   the name has an apostrophe; don't run prettier.
5. `npm run icons` (downloads icons for new items; it may print names it can't resolve), then
   `npm run typecheck`. Check the Gear section on the build in the browser if you can: both tabs,
   an item tooltip and an enchant tooltip. Don't commit unless asked.

## Report

Tell the user: which build and list changed, which slots changed against the old list (if there was
one), slots left empty, items with no source, content not in at launch, and enchant spells you had to
choose between.
