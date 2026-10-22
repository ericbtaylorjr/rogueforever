/**
 * Wowhead source codes and zone ids → the "Source" text the Gear table shows.
 * Zone ids are Classic area ids, which Forever keeps. An id missing here shows as
 * "Zone <id>" in the report; add it below (the zone's Wowhead URL has the id).
 */

export const DUNGEONS = {
  2437: 'Ragefire Chasm', 1581: 'The Deadmines', 718: 'Wailing Caverns', 209: 'Shadowfang Keep',
  719: 'Blackfathom Deeps', 717: 'The Stockade', 721: 'Gnomeregan', 491: 'Razorfen Kraul',
  796: 'Scarlet Monastery', 722: 'Razorfen Downs', 1337: 'Uldaman', 1176: "Zul'Farrak",
  2100: 'Maraudon', 1477: 'Sunken Temple', 1584: 'Blackrock Depths', 1583: 'Blackrock Spire',
  2557: 'Dire Maul', 2017: 'Stratholme', 2057: 'Scholomance',
  // New in Forever. Wowhead lists Dalaran under two zone ids.
  16919: 'Hall of Thanes', 16611: 'Ruins of Lordaeron', 16732: 'Excavation Site',
  16544: 'City of Dalaran', 16560: 'City of Dalaran',
};

/**
 * Wowhead files some dungeon bosses under the outdoor zone the dungeon sits in. When a
 * drop is marked as a dungeon drop (`dd`) in one of these zones, it's this dungeon.
 */
export const DUNGEON_IN_ZONE = { 36: 'City of Dalaran' };

/** Dungeons inside a capital city, only practical for that city's faction. */
export const CITY_DUNGEONS = { 2437: 'Horde', 717: 'Alliance' };

/** Battlegrounds: their quest rewards are PvP gear, not leveling milestones. */
export const BATTLEGROUNDS = { 2597: 'Alterac Valley', 3277: 'Warsong Gulch', 3358: 'Arathi Basin' };

export const RAIDS = {
  2717: 'Molten Core', 2159: "Onyxia's Lair", 1977: "Zul'Gurub", 2677: 'Blackwing Lair',
  3429: "Ruins of Ahn'Qiraj", 3428: "Temple of Ahn'Qiraj", 3456: 'Naxxramas',
};

export const ZONES = {
  1: 'Dun Morogh', 3: 'Badlands', 4: 'Blasted Lands', 8: 'Swamp of Sorrows', 10: 'Duskwood',
  11: 'Wetlands', 12: 'Elwynn Forest', 14: 'Durotar', 15: 'Dustwallow Marsh', 16: 'Azshara',
  17: 'The Barrens', 28: 'Western Plaguelands', 33: 'Stranglethorn Vale', 36: 'Alterac Mountains',
  38: 'Loch Modan', 40: 'Westfall', 41: 'Deadwind Pass', 44: 'Redridge Mountains', 45: 'Arathi Highlands',
  46: 'Burning Steppes', 47: 'The Hinterlands', 51: 'Searing Gorge', 85: 'Tirisfal Glades',
  130: 'Silverpine Forest', 139: 'Eastern Plaguelands', 141: 'Teldrassil', 148: 'Darkshore',
  215: 'Mulgore', 267: 'Hillsbrad Foothills', 331: 'Ashenvale', 357: 'Feralas', 361: 'Felwood',
  400: 'Thousand Needles', 405: 'Desolace', 406: 'Stonetalon Mountains', 440: 'Tanaris',
  490: "Un'Goro Crater", 493: 'Moonglade', 618: 'Winterspring', 1377: 'Silithus',
  1497: 'Undercity', 1519: 'Stormwind City', 1537: 'Ironforge', 1637: 'Orgrimmar',
  1638: 'Thunder Bluff', 1657: 'Darnassus',
  ...DUNGEONS,
  ...RAIDS,
};

export const PROFESSIONS = {
  164: 'Blacksmithing', 165: 'Leatherworking', 197: 'Tailoring', 202: 'Engineering',
  333: 'Enchanting', 755: 'Jewelcrafting', 171: 'Alchemy',
};

const zone = (id) => (id == null ? undefined : (ZONES[id] ?? `Zone ${id}`));

/**
 * Wowhead's `source` codes (1 crafted, 2 drop, 3 PvP, 4 quest, 5 vendor, …) paired with
 * `sourcemore` entries, best source first. `kind` drives rank.mjs's accessibility rules.
 */
export function describeSource(codes, more) {
  const all = codes.map((code, i) => one(code, more[i] ?? {}));
  const order = ['quest', 'dungeon', 'crafted', 'vendor', 'drop', 'world', 'raid', 'pvp', 'other'];
  all.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
  return all[0] ?? { kind: 'unknown', text: 'Unknown' };
}

function one(code, m) {
  switch (code) {
    case 1:
      return { kind: 'crafted', text: PROFESSIONS[m.s] ?? 'Crafted', profession: PROFESSIONS[m.s] };
    case 2: {
      if (m.z in RAIDS) return { kind: 'raid', text: RAIDS[m.z], zone: RAIDS[m.z], npc: m.n };
      // `dd` (dungeon difficulty) marks instance drops, including dungeons Wowhead files under an outdoor zone.
      const dungeon = DUNGEONS[m.z] ?? (m.dd != null ? (DUNGEON_IN_ZONE[m.z] ?? zone(m.z)) : undefined);
      if (dungeon)
        return { kind: 'dungeon', text: m.n ? `${dungeon} (${m.n})` : dungeon, zone: dungeon, npc: m.n, boss: !!m.bd, faction: CITY_DUNGEONS[m.z] };
      if (m.n) return { kind: 'drop', text: `${m.n}${m.z ? `, ${zone(m.z)}` : ''}`, zone: zone(m.z), npc: m.n };
      return { kind: 'world', text: m.z ? `World drop, ${zone(m.z)}` : 'World drop', zone: zone(m.z) };
    }
    case 3:
      return { kind: 'pvp', text: 'PvP' };
    case 4:
      if ((m.c ?? m.z) in BATTLEGROUNDS) return { kind: 'pvp', text: `Quest, ${BATTLEGROUNDS[m.c ?? m.z]}` };
      // Some quest sources only name the zone (often a dungeon quest).
      return { kind: 'quest', text: m.n ? `Quest: ${m.n}` : `Quest, ${zone(m.c ?? m.z) ?? 'unknown zone'}`, quest: m.n, questId: m.ti, zone: zone(m.c ?? m.z) };
    case 5:
      return { kind: 'vendor', text: m.n ? `Vendor: ${m.n}${m.z ? `, ${zone(m.z)}` : ''}` : 'Vendor', npc: m.n, zone: zone(m.z) };
    default:
      return { kind: 'other', text: `Source ${code}` };
  }
}
