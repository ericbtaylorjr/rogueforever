---
name: leveling-milestone-gear
description: Rebuild the Leveling milestone gear lists (per leveling build, by level range, both factions) from the WoWSims Forever item database (latest master), each build's stat weights and the game's proc data. Use when asked to update or refresh the leveling gear, when WoWSims has new decrypted items, or after a leveling build's stat weights change.
---

# Leveling milestone gear

Six leveling builds (Assassination, Combat and Subtlety, each Questing and Dungeons) each get
their own list in `src/content/leveling-gear.json` (`builds["combat/questing"]`, …): the major
upgrade per slot, aiming for a recommendation **every 5–6 levels** from 10 to 58, for both
factions. `scripts/gear-research/` builds it (its README has the file-by-file detail); this skill
is the run order and the judgment calls. Never edit the JSON by hand: fix `curation.json` and rerun.

> **Needs weights first.** Every leveling build must have stat weights. The run stops and names
> any build still on `noStats`; give it weights with `update-stat-weights` and rerun.

## Where the data comes from

The WoWSims Forever item database, `~/dev/forever/assets/database/db.json`, which WoWSims
regenerates from the decrypted game files several times a day. `forever.mjs` runs
`git fetch origin master` in that repo and reads the file from **`origin/master`**, so it is always
the latest master. It fast-forwards the checkout only when clean and on `master`, never switches
branches or resets, and **stops if the fetch fails** (offer `--offline` only if the user agrees to
stale data). State the Forever commit and database date in your summary.

The database has stats in rating points (the weights' unit), weapon damage, random-suffix options,
class and faction restrictions, proc rates and sources including quest faction. It doesn't have
quest levels, so a few items need small Wowhead lookups (cached): `lookups.mjs`.

## How items are scored

- **Stats** use the build's own weights, read from `src/content/builds/*.ts` by `weights.mjs`: Agility,
  Strength, Attack Power, Hit, Crit, Haste, Expertise, Armor Penetration, Spell Piercing, plus Stamina
  floored at 0.1. After `update-stat-weights` changes a leveling build, rerun this.
- **Weapons** follow each spec's stated preference (`WEAPON_PREFS` and `WEAPONS` in `rank.mjs`), always
  after the item's stats:
  - **Combat** main hand: any weapon except a dagger; highest top-end (maximum) damage first, then DPS,
    then speed (slower is better). Off hand: any weapon type, DPS first, then speed.
  - **Assassination** (Mutilate): daggers in both hands; main hand DPS first, then a slower dagger.
  - **Subtlety**: a dagger list and a non-dagger main-hand list (the weapon swap after the Ambush opener,
    any weapon type), DPS first, with a slight preference for a slow non-dagger; any weapon off hand.
  - The off-hand speed preference is assumed to run the same way as the main hand's (slower); confirm
    with the user if it matters. Weapon DPS counts 20 EP per point in the main hand, 9 in the off hand.
- **Dagger and non-dagger**: a build that uses both gets a separate main-hand list for each, picked
  and gap-filled on its own, so both appear even at the same level. That is Subtlety Questing and
  Dungeons (weapon-swap). Dagger-only builds (Assassination main and off hand, Backstab/Ambush main
  hands) and slow-only (Combat Questing and Dungeons) get one. If a build's weapon plan changes, change
  `WEAPONS`; the run fails if a build that needs both families has none in one of them.
- **Random-suffix items** ("of the Tiger") score their base stats plus the average of the suffixes that
  help the build, only if at least a third do, and are tagged "· random suffix". Mention them: you
  can't choose the suffix.
- **Procs and use effects** are valued from the database (rate, cooldown, granted stats) and the game's
  tables (damage, extra attacks). Anything the model can't value scores 0 and is flagged ⚠; assumed
  rates are `~`. `curation.json` `ppm` overrides one item.
- **Pins** (`curation.json` `pins`) are items known to matter that the model can't see or undervalues
  (Thrash Blade). A pin whose item isn't in the database yet is a warning, not an error.

No sims: the sim only runs at level 60, so it can't rank level 20 gear.

## Faction fairness and coverage

- Picks are chosen **per faction**. An item both can get is one "Both" entry; one they reach by different
  quests or vendors is two entries (one each). Items only one faction can get count at 92%, so the
  neutral item wins unless the exclusive one is clearly better.
- **Gap-fill**: no slot goes more than 6 levels without a recommendation, for each faction and weapon
  family, using the strongest available item that still upgrades the pick before it (rings and
  trinkets: anything matching a typical green). Gaps nothing can fill are **reported, not padded**.
  The report's **Coverage** table lists, per build and slot, the picks each faction sees and its
  remaining gaps. Read it every run. Most gaps are the database's, not the model's (items not
  decrypted yet, or no source recorded): say so, don't hide them.

- **Options per bracket**: every slot should have **at least 3 options (never fewer than 2 if anything
  qualifies) in each level bracket the Handbook shows (1–20, 21–40, 41–58), for each faction.** After the
  upgrade chain and gap-fill, the best remaining available items near a typical green are added (marked `+`
  in the report); a second pass accepts items down to half of a typical green only to reach 2. The report's
  "Brackets with fewer than 3 options" lists what still falls short, almost always because the database
  has no usable source there: say so, don't pad further.
- **Bind on Pickup crafts**: a crafted pick that binds when picked up (read from Wowhead's tooltip, cached
  in `lookups.json` `binds`) is tagged **BoP** (like BoE, a tag beside the name, not text in the source) and always gets a **non-crafted alternative**
  within 6 levels below / 3 above (marked `⇄`), so players without the profession have an option. Those
  extras are in addition to the normal picks. If nothing non-crafted qualifies the report warns.

- **Source mix**: every slot should offer, in each 10-level window (1–20, 21–30, 31–40, 41–50, 51–58; crafts per Handbook bracket), a mix of **Bind on Equip** items (drops and crafts
  anyone can buy), **Bind on Pickup quest/dungeon/vendor/reputation rewards**, and a **craft**, whenever one exists,
  even when it is statistically weaker than what's already there (down to 75% of a typical green, 50% if nothing better
  exists). Added items are marked `✚` in the report. Bind type comes from Wowhead's tooltip (`lookups.json` `binds`,
  cached; the first run after a change does a few hundred polite lookups). Tune `MIX_RATIO*` in `rank.mjs`.

## Availability

Quests (with the faction that can take them), dungeon drops, crafted items (with a recipe players can get),
vendors, and reputation rewards up to Honored are chaseable. Raids, PvP-flagged items, world drops and rare
spawns, and items with no recorded source are out unless `curation.json` `allow` lets one in.
- **Not at launch**: `curation.json` `notAtLaunch.zones` (Dire Maul now) and `notAtLaunch.reps` keep out
  content that isn't in yet, and crafted items whose recipe is sold or dropped there. Add an id when the
  user names content that isn't in yet; remove it when it opens. Reputation standing assumed reachable is
  `maxRepLevel` (6, Honored).
- A crafted item is only as available as its recipe. A recipe with *no* source listed isn't blocked
  (new Forever recipes often have none); the report lists those picks for a human check.
- **Epics below level 60 are blocked by default** (`allowEpic: [ids]` lets one in). The report's "kept out"
  section lists every strong item this blocked.
- Anything else the user says isn't available goes in `exclude` with a `why`.

## Items Wowhead doesn't list yet

An item can be in the database before Wowhead has it. It is still picked; it's emitted with
`noWowhead`, its `icon` and a database-built `tooltip`, and the Handbook shows the same tooltip but
doesn't link out. **Every run rechecks every listed item without a link** (`links.mjs`), and
`run.mjs` rebuilds when a listed item's link status changed, so the flags clear themselves once
Wowhead adds the item. List the currently unlinked picks in your summary (the report has them).

## Steps

1. `node scripts/gear-research/run.mjs`. It fetches Forever master, rechecks Wowhead links for unlinked
   items, and if nothing relevant changed (the Rogue-relevant database slice, weights, `curation.json`,
   scripts, link status) says so and stops. Otherwise it runs procs → recipes → rank ⇄ lookups → links →
   emit. The first run does ~170 polite Wowhead lookups (5–10 minutes; run it in the background); after
   that only new items cost anything. If the lookups get blocked it saves and exits; rerun later.
   `--force` rebuilds anyway; `--no-emit` stops before writing the JSON.
2. Read `scripts/gear-research/cache/report.md` before trusting it:
   - **Problems** (these stop `--emit`) and **Warnings**.
   - **Coverage**: gaps over 6 levels; weapon-family rows for Subtlety; Alliance vs Horde counts that differ
     a lot.
   - **Pinned items**: a pin that lands badly means a template or rate is off.
   - **⚠ and ~** rows: judge by hand; add a pin, a `ppm`, or an `exclude`/`allow`/`level` correction in
     `curation.json` (never in the JSON) and rerun.
   - **Kept out** and **recipe source Wowhead doesn't list**: confirm with the user which are really in the
     game at launch; `exclude` the ones that aren't, `allowEpic` the ones that are.
   - **Quest picks whose side the database doesn't record**: it assumes both factions; check "Side" on each
     quest's Wowhead page (ask the user if you can't read it; don't guess) and set `questSide` in `curation.json`.
   - **Brackets with fewer than 3 options** and the Warnings about Bind on Pickup crafts with no alternative.
   - **Warnings** also name listed items that vanished from the database (it drops items as well as adding
     them); `run.mjs` warns when the item count falls over 10%. Report the drop; don't pad the lists.
   - **Quest rewards whose accept level isn't verified**: the database has no quest accept level, the quest tooltip only
     gives the quest's level, and the item's own requirement can be lower than the quest's (Ruby-Adorned Blade needs 25
     but its quest needs 30). Each quest is listed with its Wowhead link; read "Requires level" on the page and put it in
     `curation.json` `questMinLevel` ({questId: level}). The shown level is then the higher of that and the item's
     requirement. Ask the user to confirm any you can't read; verified quests drop off the list.
   - **Picks whose level is an estimate**: levels come from the item's own required level (never the quest's level, which
     runs a few above the level a quest can be accepted at). Items with none fall back to the quest level or item level − 4 and
     are listed; read "Requires level" on Wowhead for each (the scripts can't: Wowhead blocks scripted page fetches, so never
     spoof headers to get around it) and set `curation.json` `level`.
   - **Random-suffix picks** and **picks Wowhead doesn't list**.
   - Each build's tables: sanity-check the picks against the weapon types and the Handbook builds.
   - To see why a slot has a gap: `node scripts/gear-research/rank.mjs --debug "combat/questing|Head"`.
3. `npm run icons` (icons and rarity for new items; unlisted items use the database's icon name), then
   `npm run typecheck`, then check the Gear section on a leveling build (all three brackets, both
   factions, an unlisted item's tooltip, spot-check a few Wowhead links). Don't commit unless asked.

## Report

Tell the user: the Forever commit and date read; per build how many picks, which are new or changed
(`git diff src/content/leveling-gear.json`), which pinned items made it; the Coverage gaps (and whether the
database is the cause); weapon-family coverage for Subtlety; the random-suffix picks; the picks without a
Wowhead link (and any that gained one); what the model couldn't judge (⚠ and assumed rates); and any
Problems or Warnings. Say if the run found newly added items.
