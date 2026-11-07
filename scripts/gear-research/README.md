# Leveling gear research

Builds the **Leveling milestone gear** lists (`src/content/leveling-gear.json`, one per leveling
build) from the WoWSims **Forever item database** and each build's own stat weights. The
`leveling-milestone-gear` skill is the run order. Built to be rerun often: WoWSims regenerates
the database from the decrypted game files several times a day.

## Rerun (the usual case)

```sh
node scripts/gear-research/run.mjs      # everything below, skipping what nothing changed
npm run icons                           # icons + rarity check for any new items
npm run typecheck
```

`run.mjs` takes seconds when nothing relevant changed (it says so and stops) and under a minute
otherwise, apart from the first run's Wowhead lookups (about 5–10 minutes, then cached for good).
Flags: `--force` (rebuild anyway), `--offline` (don't fetch Forever or the game tables),
`--no-emit` (do everything but write the JSON).

Then review `git diff src/content/leveling-gear.json` and skim `cache/report.md`. If something is
wrong, fix it in `curation.json` (below) and rerun; don't hand-edit the JSON, or the next run
overwrites it.

The steps, if you want them one at a time:

```sh
node scripts/gear-research/forever.mjs        # fetch wowsims/forever origin/master, say which commit is read
node scripts/gear-research/procs.mjs          # proc/use-effect numbers from the game tables (wago.tools, cached per build)
node scripts/gear-research/recipes.mjs        # which recipe item teaches each crafted item
node scripts/gear-research/rank.mjs           # score, pick, write cache/report.md; exit 3 = lookups.mjs has work
node scripts/gear-research/lookups.mjs        # Wowhead: levels the database lacks, recipe sources (cached)
node scripts/gear-research/links.mjs          # which picks Wowhead lists (rechecks every unlinked one)
node scripts/gear-research/rank.mjs --emit    # writes src/content/leveling-gear.json
```

## The database

`~/dev/forever/assets/database/db.json` (override with `FOREVER_REPO`) from `wowsims/forever`. The
research always reads it from **`origin/master`** with `git show` after a `git fetch`, so it is
the latest master whatever state the checkout is in. The checkout itself is fast-forwarded only
when it is clean and on `master`; otherwise it is left alone and the run says so. A failed fetch
stops the run (rerun with `--offline` to use the last fetched master). The report and
`leveling-gear.json` record the Forever commit and the date the database last changed.

It carries, per item: slot, armor/weapon type, hand, required level, quality, stats (in rating
points, the unit the weights use), weapon damage and speed, random-suffix options, class
restrictions, faction restriction, proc/use effects (rate, cooldown, duration, granted stats) and
sources (quest with its faction, dungeon drop, crafted, vendor, reputation, PvP). Not in it:
quest levels, the level a quest is accepted at, and what damage/extra-attack effects do. Items
Forever hasn't decrypted yet are missing, and many have no source recorded yet; the report's
"kept out" and coverage sections show what that costs.

## Files

| File | What it does |
|---|---|
| `run.mjs` | Orchestrates everything, skipping when the Rogue-relevant database slice, weights, `curation.json` and scripts are unchanged. |
| `forever.mjs` | Fetches the Forever repo's master, reads `db.json` from `origin/master`. |
| `items.mjs` | Database → candidates: what a Rogue can wear, stats, random-suffix options, where each faction can get it (offers), the level to show. Availability rules live here. |
| `weights.mjs` | Reads each leveling build's stat weights from `src/content/builds/*.ts`. Stops if any leveling build still has no weights. |
| `procs.mjs` | Proc and use effects: rates and granted stats from the database, damage and extra attacks from the game tables (wago.tools DB2, cached per Forever build in `cache/db2/`). Writes `cache/procs.json`. |
| `recipes.mjs` | Recipe item for each crafted item's spell, from the same tables. Writes `cache/recipes.json`. |
| `lookups.mjs` | The Wowhead lookups the database can't replace (see Levels). Writes `cache/lookups.json`; cached for good. |
| `links.mjs` | Which picks Wowhead lists, from the tooltip API. Writes `cache/wowhead.json`. |
| `tooltip.mjs` | Tooltip markup, in Wowhead's format, for picks Wowhead doesn't list yet. |
| `rank.mjs` | Scoring, baselines, picks, gap-filling, checks, report and `--emit`. All tuning knobs are at the top. `--debug "<build>\|<slot>"` prints every scored candidate for one slot. |
| `curation.json` | Hand corrections kept across runs (see below). Committed. |
| `cache/` | Gitignored: `report.md`, `picks.json`, `lookups*.json`, `wowhead.json`, `procs.json`, `recipes.json`, `forever.json`, `last-run.json`, `db2/`. |

## Method

Everything below runs once per leveling build (Assassination, Combat and Subtlety, each Questing
and Dungeons), so a build's list reflects its own stat weights.

1. **EP** per item from that build's weights (Attack Power = 1): Strength, Agility, Stamina, Attack
   Power, Hit, Crit, Haste, Expertise, Armor Penetration and Spell Piercing, each as the build's
   Handbook table weights it. Stamina is floored at **0.1** so it still breaks ties. The database
   gives ratings, the weights are per rating point, so nothing is converted.
2. **Weapons** add DPS: main hand 20 EP per DPS (scaled up for slower weapons where the rotation
   hits for weapon damage), off hand 9 EP per DPS. `curation.json` `dpsEp` can override this per
   build. Which weapons a build may use is `WEAPONS` in `rank.mjs`: Mutilate daggers in both
   hands; Backstab/Ambush builds a dagger main hand; Sinister Strike a slow main hand; **Subtlety
   Questing and Dungeons weapon-swap, so each gets both a dagger list and a slow list, each picked,
   spaced and gap-filled on its own**, even at the same level. Off hand: any melee weapon unless the
   build is Assassination (daggers).
3. **Random-suffix items** ("of the Tiger"): each suffix option adds stats scaled by the item's
   rand-prop points. The item scores its base stats plus the **average over the suffixes that
   help the build** (anything with a weighted stat besides Stamina), and only counts if at least a
   third of its suffixes help. You can't choose the suffix, so they are tagged "· random suffix" in
   the Source column and listed in the report.
4. **Procs and use effects** are valued from the database and game tables, not the tooltip. Each
   effect becomes damage per second (or an average stat), then EP:
   - extra attack: procs/sec × the weapon's average hit × 1.3 (Attack Power on the swing)
   - flat or over-time damage: procs/sec × damage × 0.9 (resists) × 0.85 (it doesn't scale like
     weapon DPS) of a main-hand DPS point
   - granted stats (database), AP / Agility / Strength / crit / hit buffs and haste: amount ×
     uptime × the build's weight
   - use effects count once per cooldown
   - anything else (utility, absorbs, target debuffs) scores 0 and is flagged ⚠ in the report

   Rates come from the database (PPM or chance). When it has none, 1 PPM is assumed (flagged `~`);
   `curation.json` `ppm` sets a known rate for one item. Knobs are at the top of `rank.mjs`. There's
   no sim: it only runs at level 60.
5. **Baseline**: per slot and level, the median EP of fixed-stat greens with Rogue stats.
6. **Picks** per slot, **per faction**: the chain of upgrades that adds the most "better than
   green" over levels 10–58, where each pick has a small cost and picks sit a minimum number of
   levels apart (weapons 4, others 5). Items only one faction can get count at 92%, so the neutral
   item wins unless the exclusive one is clearly better; otherwise each faction gets its own best
   answer at about the same level. An item both factions can get is listed once as "Both"; one
   they reach by different quests or vendors is listed once per faction.
7. **Gap-fill**: no slot goes more than **6 levels** (level 10 → first pick, between picks, last
   pick → 58) without a recommendation, for each faction and each weapon family. A filler is the
   strongest available item that is still an upgrade over the pick before it (and weaker than the
   one after) and at least matches a typical green. Rings and trinkets, which have two slots, only
   need to match the green. Gaps nothing can fill are **reported, not padded**: the report's Coverage
   table lists them per build, slot and faction, and the same gap on both sides means the database
   has nothing (usually: not decrypted yet, or no source recorded).
8. **Pins** (`curation.json`): items you know matter that the model can't see or undervalues
   (Thrash Blade). They're forced in for the builds and slots they fit when the database has them;
   the report's "Pinned items" table shows what each scored, and a warning says if the database
   doesn't have the item.
9. **Chaseable sources only**:
   - quests (with the faction that can take them), dungeon drops, crafted (with a recipe players can
     get), vendors, and reputation rewards up to `maxRepLevel` (Honored) from reputations not in
     `notAtLaunch.reps`;
   - out: raids, anything PvP-flagged, world drops and rare spawns (unless `allow`), items with no
     source recorded. An item sold by a reputation vendor counts only through its reputation.
   - The Stockade and Ragefire Chasm are one faction's dungeons (`cityDungeons`).
10. **Available at launch**: `notAtLaunch.zones` keeps out drops and vendors in those zones (Dire
    Maul), and crafted items whose *recipe* drops or is sold there. A crafted item is only as available
    as its recipe; a recipe with no source listed isn't blocked (new Forever recipes often have none),
    but the report lists those picks to check. **Epics below level 60 are blocked by default**
    (`allowEpic: [ids]` lets one in); the report's "kept out" section lists every strong item this
    blocked.
11. **Range**: required level 10–58. Below 10 greens barely have stats; 59–60 items belong to
    pre-raid BiS.

### Levels

The level shown is the highest of: the item's required level (database), the required level
Wowhead lists for it when the database has none (`lookups.mjs`, www XML feed), and for a quest
reward the quest's level (Wowhead's quest tooltip, which shows it for some quests). With none of
those, item level − 4. `curation.json` `level` overrides. The report header counts where each
level came from. Wowhead's quest pages don't expose a quest's level or "requires level to accept"
to scripts, so the minimum accept level can't be read directly; the quest level is the closest
signal available.

### Wowhead links

An item can be in the database before Wowhead lists it. Such a pick is still emitted, flagged
`noWowhead` with its `icon` and a `tooltip` built from the database (`tooltip.mjs`); the Handbook
shows the same tooltip without a link. `links.mjs` runs **every** time: it rechecks every item
without a link (and links older than a week), so the flags drop off by themselves once Wowhead
adds the item. `run.mjs` also rebuilds when a listed item's link status changed. `npm run icons`
uses the database's icon name for unlisted items.

## curation.json

- `exclude: [{ "id": 1234, "why": "…" }]` drops an item.
- `allow: [1234]` lets a world drop, rare spawn or PvP-flagged item count as chaseable.
- `level: { "1234": 30 }` overrides the level shown.
- `source: { "1234": "Quest: …" }` overrides the Source text.
- `include: [{ "builds": ["combat/questing"], "item": { …LevelingItem } }]` adds an item the database can't see yet (omit `builds` for all six).
- `pins`, `ppm`, `dpsEp`, `notAtLaunch`, `allowEpic`, `maxRepLevel`, `cityDungeons`, `dungeonInZone`: see the `_readme` in the file.

## Known limits

- The database only has what WoWSims has decrypted, and many items have no source yet; thin slots show as gaps in the Coverage table.
- Stat ratings are scored at face value; if the game scales rating-to-percent by level (the sim only has level 60 constants), low-level hit/crit/expertise are undervalued.
- Procs are modeled, not simulated: rates the database lacks are assumed at 1 PPM, and effects outside the model score 0 (⚠). Judge those by hand and pin or `ppm` them.
- Quest levels are partial (see Levels).
- Bind-on-equip comes from the Wowhead tooltip, so an unlisted item isn't tagged BoE.
- Some Forever dungeons sit under an outdoor zone id in the database (City of Dalaran under Alterac Mountains); `dungeonInZone` names them.
