# Leveling gear research

Builds the **Leveling milestone gear** lists (`src/content/leveling-gear.json`) from
Wowhead's Forever database. Built to be rerun as Wowhead decrypts more Forever items
(expect a couple of times a week around launch).

## Rerun (the usual case)

```sh
node scripts/gear-research/scan.mjs --missing      # ~10 min: re-check ids Wowhead didn't have last time
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
| `rank.mjs` | Scores, baselines, picks, report, and `--emit`. All tuning knobs are at the top. |
| `curation.json` | Hand corrections kept across runs (see below). Committed. |
| `cache/` | Gitignored: `items.json` (scan), `sources.json`, `shortlist.json`, `report.md`. |

## Method

1. **EP** per item from the site's own stat weights (Attack Power = 1, Agility 2.08,
   Hit rating 2.73, Crit rating 2.03, Strength 1.1), plus a little Stamina (0.3) for
   leveling survival. Tooltips show hit/crit as %, converted at 10 hit / 14 crit rating
   per 1% (what Wowhead's XML reports for the same items).
2. **Weapons** add DPS: main hand 20 EP per DPS, scaled up for slower weapons (Sinister
   Strike, Backstab, Ambush and Mutilate all hit for weapon damage); off hand 9 EP per DPS.
3. **Baseline**: per slot and level, the median EP of fixed-stat greens with Rogue stats
   (random-suffix greens have no fixed stats; caster greens would drag it down).
4. **Level** shown: the required level, or for a quest reward the quest's level when
   that's higher (Wingblade requires 10 but its quest is 22). When Wowhead has no quest
   level, item level − 2.
5. **Picks** per slot: the set of upgrades that adds the most "better than green" over
   levels 10–60, where each pick has a cost and picks sit a minimum number of levels
   apart (weapons 5, big armor 8, small armor/jewelry 10). Picks come first from items
   both factions can get; each faction then adds its own faction-only items where they
   beat those, which gives the other side's answer at about the same level.
6. **Chaseable sources only**: quests, dungeon drops (anything Wowhead marks with a
   dungeon difficulty, `dd`, so new Forever dungeons count even before they're named in
   `zones.mjs`), crafted. World drops, open-world rare spawns, vendors (battleground and
   reputation quartermasters), battleground quests, raids and PvP are out unless
   `curation.json` allows them. The Stockade and Ragefire Chasm count as Alliance and
   Horde respectively.
7. **Range**: required level 10–58. Below 10 greens barely have stats; 59–60 items belong
   to pre-raid BiS.

Weapon lists: `slow` (swords, axes, maces, fists in the main hand; any one-hander in the
off hand, never the same item as the main hand) and `daggers` (both hands). Armor and
jewelry are `shared`. Combat uses shared + slow, Assassination shared + daggers, and
Subtlety all three (Hemorrhage takes any weapon; Ambush only needs a main-hand dagger).
The builds combine them in `src/content/builds/*.ts`.

## curation.json

- `exclude: [{ "id": 1234, "why": "…" }]` drops an item.
- `allow: [1234]` lets a vendor or rare-spawn item count as chaseable.
- `level: { "1234": 30 }` overrides the level shown (e.g. a quest reward with no level requirement).
- `faction: { "1234": "Horde" }` for quest rewards whose quest is faction-only but the item isn't marked.
- `source: { "1234": "Quest: …" }` overrides the Source text.
- `include: [{ "list": "shared", "item": { …LevelingItem } }]` adds an item the data can't see yet.

## Known limits

- Encrypted items are invisible until Wowhead decrypts them; `scan.mjs --missing` picks them up.
- Procs and use effects ("Chance on hit", trinket "Use:") aren't scored; the report lists them so they can be judged by hand.
- Quest faction is only known when the item itself is marked Alliance/Horde; fix others with `curation.json` `faction`.
- Some Forever dungeons sit under an outdoor zone id on Wowhead (City of Dalaran's bosses are in Alterac Mountains, 36); `DUNGEON_IN_ZONE` in `zones.mjs` names them.
- Late daggers are thin until more Forever dungeon loot is decrypted (the level 44–58 dungeon daggers aren't in Wowhead's data yet).
- Wowhead's `www` pages (list views) block scripts outright, which is why this goes item by item.
