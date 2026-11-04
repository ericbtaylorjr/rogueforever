# Leveling gear research

Builds the **Leveling milestone gear** lists (`src/content/leveling-gear.json`, one per leveling
build) from Wowhead's Forever database. The `leveling-milestone-gear` skill is the run order. Built to be rerun as Wowhead decrypts more Forever items
(expect a couple of times a week around launch).

## Rerun (the usual case)

```sh
node scripts/gear-research/scan.mjs --revalidate   # ~2 min: drop items Wowhead no longer has
node scripts/gear-research/scan.mjs --missing      # ~15 min: re-check ids Wowhead didn't have last time
node scripts/gear-research/procs.mjs               # proc and use-effect data from the game tables (fast)
node scripts/gear-research/recipes.mjs             # which recipe item teaches each crafted item (fast)
node scripts/gear-research/rank.mjs                # writes cache/report.md + cache/shortlist.json
node scripts/gear-research/sources.mjs             # sources for anything new on the shortlist (slow, polite)
node scripts/gear-research/rank.mjs --emit         # writes src/content/leveling-gear.json
npm run icons                                      # icons + rarity check for any new items
```

Then review `git diff src/content/leveling-gear.json` and skim `cache/report.md` (each
pick with its EP, how much it beats a green, its source and runners-up). If something's
wrong, fix it in `curation.json` (below) and run `rank.mjs --emit` again; don't hand-edit
the JSON, or the next run overwrites it.

`rank.mjs --emit` refuses to write while any pick lacks a source, so the loop is just
"rank → sources → rank" until it says `0 without sources`.

Stats can change on existing items too (Forever re-itemizes). Every few weeks, or after
a big patch, do a **full rescan** instead of `--missing`:

```sh
node scripts/gear-research/scan.mjs                # ids 1–25000, ~10 min
node scripts/gear-research/scan.mjs 200000 300000  # newer ids (Season of Discovery era and later), ~40 min
node scripts/gear-research/sources.mjs --refresh   # re-read sources for the shortlist
```

## Files

| File | What it does |
|---|---|
| `scan.mjs` | Reads every item id from Wowhead's tooltip API (`nether.wowhead.com`, tolerates bulk reads), keeps the ones a Rogue can equip. `--missing` re-checks not-found ids; `--recheck "<reason>"` re-checks ids skipped for a reason after a `parse.mjs` fix. |
| `parse.mjs` | Tooltip HTML → slot, type, level, stats, weapon damage. Also the "usable by a Rogue" filter (leather/cloth/jewelry, one-handers incl. axes, bows/guns/crossbows/thrown, no other-class items, no recipes or test items). |
| `sources.mjs` | Source + faction for shortlisted items from the www XML feed, stored raw. CloudFront blocks bursts there, so it goes one request per 1.5 s and waits out blocks by itself (a first run of ~650 items takes ~20 min; reruns only fetch new ones). Then reads each reward quest's level from the tooltip API. Writes `cache/sources.json`. |
| `zones.mjs` | Wowhead source codes and zone ids → Source text. Add zone ids here when the report shows `Zone 1234`; new Forever dungeons go in `DUNGEONS` so their drops count as chaseable. No refetch needed, sources are stored raw. |
| `weights.mjs` | Reads each leveling build's stat weights from `src/content/builds/*.ts`. |
| `procs.mjs` | Proc rates and effects for items with on-hit or use text, from wago.tools' DB2 tables for the newest Forever build (`wowf`). Writes `cache/procs.json` (and caches the tables in `cache/db2/`). |
| `recipes.mjs` | Recipe item for each crafted item (the Pattern/Plans/Formula whose use effect is the crafting spell), from the same game tables. `sources.mjs` then looks up where each recipe comes from. Writes `cache/recipes.json`. |
| `rank.mjs` | Scores, baselines, picks, report, and `--emit`. All tuning knobs are at the top. |
| `curation.json` | Hand corrections kept across runs (see below). Committed. |
| `cache/` | Gitignored: `items.json` (scan), `sources.json`, `shortlist.json`, `report.md`. |

## Method

Everything below runs once per leveling build (Assassination, Combat and Subtlety, each Questing
and Dungeons), so a build's list reflects its own stat weights.

1. **EP** per item from that build's weights (Attack Power = 1; `weights.mjs` reads them from
   the builds), plus a little Stamina (0.3) for leveling survival. Tooltips show hit/crit as %,
   converted at 10 hit / 14 crit rating per 1% (what Wowhead's XML reports for the same items).
2. **Weapons** add DPS: main hand 20 EP per DPS (scaled up for slower weapons where the rotation
   hits for weapon damage), off hand 9 EP per DPS. `curation.json` `dpsEp` can override this per
   build, e.g. with the sim's Main Hand DPS EP. Which weapons a build may use is `WEAPONS` in
   `rank.mjs`: Mutilate daggers in both hands; Backstab/Ambush builds a dagger main hand;
   Sinister Strike a slow main hand; Subtlety Questing and Dungeons weapon-swap, so they get both a
   dagger list and a slow list (each scored for its own family); off hand any weapon unless the build is Assassination.
3. **Procs and use effects** are valued from the game's own data (`procs.mjs`), not the tooltip.
   Each effect becomes damage per second (or an average stat), then EP:
   - extra attack: procs/sec × the weapon's average hit × 1.3 (Attack Power on the swing)
   - flat or over-time damage: procs/sec × damage × 0.9 (resists) × 0.85 (it doesn't scale like
     weapon DPS) of a main-hand DPS point
   - AP / Agility / Strength / crit / hit buffs and haste: amount × uptime × the build's weight
   - use effects count once per cooldown
   - anything else (utility, absorbs, target debuffs) scores 0 and is flagged ⚠ in the report

   Rates come from the game's proc data. When it has none (all weapon procs so far), 1 PPM is
   assumed (flagged `~`); `curation.json` `ppm` sets a known rate for one item. All the proc
   knobs are at the top of `rank.mjs`. There's no sim: it only runs at level 60.
4. **Baseline**: per slot and level, the median EP of fixed-stat greens with Rogue stats
   (random-suffix greens have no fixed stats; caster greens would drag it down).
5. **Level** shown: the required level, or for a quest reward the quest's level when
   that's higher (Wingblade requires 10 but its quest is 22). When Wowhead has no quest
   level, item level − 2.
6. **Picks** per slot: the set of upgrades that adds the most "better than green" over
   levels 10–60, where each pick has a cost and picks sit a minimum number of levels
   apart (weapons 5, big armor 8, small armor/jewelry 10). Picks come first from items
   both factions can get; each faction then adds its own faction-only items where they
   beat those, which gives the other side's answer at about the same level.
7. **Pins** (`curation.json`): items you know matter that the model can't see or undervalues
   (Thrash Blade). They're forced in for the builds and slots they fit; the report's "Pinned
   items" table shows what each scored and whether it would have been picked on its own.
8. **Chaseable sources only**: quests, dungeon drops (anything Wowhead marks with a
   dungeon difficulty, `dd`, so new Forever dungeons count even before they're named in
   `zones.mjs`), crafted. World drops, open-world rare spawns, vendors (battleground and
   reputation quartermasters), battleground quests, raids and PvP are out unless
   `curation.json` allows them. Items Wowhead has no source for are out too. The Stockade
   and Ragefire Chasm count as Alliance and Horde respectively.
9. **Available at launch**: a pick must be obtainable when the game launches, not just exist in the data.
   - `curation.json` `notAtLaunch.zones` keeps out drops from those zones (Dire Maul), and crafted
     items whose *recipe* drops there. A crafted item is only as available as its recipe: Shifting
     Cloak is Leatherworking, but the pattern is a Dire Maul drop. A recipe with no source listed
     isn't blocked (new Forever recipes often have none), but the report lists those picks to check.
   - **Epics below level 60 are blocked by default** (most are Naxxramas-era or post-launch
     rewards: Darkmantle, Persuader, Shifting Cloak…). `allowEpic: [ids]` lets one in. The report's
     "kept out" section lists every strong item blocked this way, so nothing disappears silently.
   - `exclude` is the hard blacklist for anything else (with a `why`).
10. **Range**: required level 10–58. Below 10 greens barely have stats; 59–60 items belong
   to pre-raid BiS.

Each build's list holds armor, jewelry, trinkets and ranged plus its own main hand and off hand picks; `src/content/gear.ts` `levelingGearFor(spec, build)` hands it to the build.

## curation.json

- `exclude: [{ "id": 1234, "why": "…" }]` drops an item.
- `allow: [1234]` lets a vendor or rare-spawn item count as chaseable.
- `level: { "1234": 30 }` overrides the level shown (e.g. a quest reward with no level requirement).
- `faction: { "1234": "Horde" }` for quest rewards whose quest is faction-only but the item isn't marked.
- `source: { "1234": "Quest: …" }` overrides the Source text.
- `include: [{ "builds": ["combat/questing"], "item": { …LevelingItem } }]` adds an item the data can't see yet (omit `builds` for all six).
- `pins`, `ppm` and `dpsEp`: see Method 2, 3 and 7.

## Known limits

- Items can disappear: Forever re-itemizes, so `--revalidate` (every run) drops cached items Wowhead no longer has.
- Faction comes only from Wowhead's flag on the item itself; faction-only quest rewards often aren't flagged and read "Both". Fix with `curation.json` `faction`.
- Encrypted items are invisible until Wowhead decrypts them; `scan.mjs --missing` picks them up.
- Procs are modeled, not simulated: rates the game data lacks are assumed at 1 PPM, and effects outside the model score 0 (⚠). Judge those by hand and pin or `ppm` them.
- Quest faction is only known when the item itself is marked Alliance/Horde; fix others with `curation.json` `faction`.
- Some Forever dungeons sit under an outdoor zone id on Wowhead (City of Dalaran's bosses are in Alterac Mountains, 36); `DUNGEON_IN_ZONE` in `zones.mjs` names them.
- Late daggers are thin until more Forever dungeon loot is decrypted (the level 44–58 dungeon daggers aren't in Wowhead's data yet).
- Wowhead's `www` pages (list views) block scripts outright, which is why this goes item by item.
