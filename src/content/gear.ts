import type {
  GearItem,
  ItemQuality,
  LevelingItem,
  SpecId,
  StatPriority,
} from './types';

/**
 * Item data, intentionally empty.
 *
 * Blizzard has confirmed a full itemization pass across every dungeon boss for
 * Forever, so a Classic Era BiS list would be wrong at launch. The table is
 * data-driven and renders an empty state until these arrays are filled — drop
 * items in and every row fills, tooltips included.
 */
export const gearSets: Record<'bis' | 'prebis', GearItem[]> = {
  bis: [],
  prebis: [],
};

/** Wowhead-style quality colours. */
export const qualityColor: Record<ItemQuality, string> = {
  poor: '#9D9D9D',
  common: '#FFFFFF',
  uncommon: '#1EFF00',
  rare: '#0070DD',
  epic: '#A335EE',
  legendary: '#FF8000',
};

export const wowheadUrl = (itemId: number) => `https://www.wowhead.com/classic/item=${itemId}`;

export const itemForSlot = (set: keyof typeof gearSets, slot: string): GearItem | undefined =>
  gearSets[set].find((i) => i.slot === slot);

/**
 * Leveling stat priority per spec. EP is relative to Agility = 1.
 *
 * TODO: placeholder weights. Replace once Forever sims are run.
 */
export const statPriority: Record<SpecId, StatPriority> = {
  cbsword: {
    stats: [
      { stat: 'Agility', ep: 1 },
      { stat: 'Hit', ep: 0.9, op: '>' },
      { stat: 'Attack Power', ep: 0.5, op: '>' },
      { stat: 'Strength', ep: 0.5, op: '=' },
    ],
  },
  cbdagger: {
    stats: [
      { stat: 'Agility', ep: 1 },
      { stat: 'Hit', ep: 0.85, op: '>' },
      { stat: 'Attack Power', ep: 0.5, op: '>' },
      { stat: 'Strength', ep: 0.5, op: '=' },
    ],
  },
  assn: {
    stats: [
      { stat: 'Agility', ep: 1 },
      { stat: 'Hit', ep: 0.8, op: '>' },
      { stat: 'Attack Power', ep: 0.5, op: '>' },
      { stat: 'Strength', ep: 0.5, op: '=' },
    ],
  },
  subt: {
    stats: [
      { stat: 'Agility', ep: 1 },
      { stat: 'Hit', ep: 0.75, op: '>' },
      { stat: 'Attack Power', ep: 0.55, op: '>' },
      { stat: 'Strength', ep: 0.55, op: '=' },
    ],
  },
};

/*
 * Leveling milestones. Armour and accessories are shared; weapons follow the
 * spec's weapon type.
 *
 * TODO: placeholder list built from Classic Era. Forever re-itemizes dungeons,
 * so verify every item, level and item ID before this goes live.
 */
const levelingShared: LevelingItem[] = [
  { level: 18, slot: 'Legs', itemId: 10400, name: 'Blackened Defias Leggings', quality: 'uncommon', source: 'The Deadmines', faction: 'Both' },
  { level: 20, slot: 'Chest', itemId: 10403, name: 'Blackened Defias Armor', quality: 'uncommon', source: 'The Deadmines', faction: 'Both' },
  { level: 20, slot: 'Waist', itemId: 6460, name: "Cobrahn's Grasp", quality: 'rare', source: 'Wailing Caverns', faction: 'Both' },
  { level: 21, slot: 'Back', itemId: 6449, name: 'Glowing Lizardscale Cloak', quality: 'rare', source: 'Wailing Caverns', faction: 'Both' },
  { level: 22, slot: 'Chest', itemId: 2041, name: 'Tunic of Westfall', quality: 'uncommon', source: 'Quest: The Defias Brotherhood', faction: 'Alliance' },
  { level: 22, slot: 'Ranged', itemId: 6469, name: 'Venomstrike', quality: 'rare', source: 'Wailing Caverns', faction: 'Both' },
  { level: 48, slot: 'Ring 1', itemId: 17713, name: 'Blackstone Ring', quality: 'rare', source: 'Quest: Maraudon', faction: 'Both' },
  { level: 53, slot: 'Hands', itemId: 15063, name: 'Devilsaur Gauntlets', quality: 'rare', source: 'Leatherworking', faction: 'Both' },
  { level: 53, slot: 'Legs', itemId: 15062, name: 'Devilsaur Leggings', quality: 'rare', source: 'Leatherworking', faction: 'Both' },
  { level: 57, slot: 'Head', itemId: 13404, name: 'Mask of the Unforgiven', quality: 'rare', source: 'Stratholme', faction: 'Both' },
  { level: 58, slot: 'Trinket 1', itemId: 11815, name: 'Hand of Justice', quality: 'rare', source: 'Blackrock Depths', faction: 'Both' },
  { level: 58, slot: 'Neck', itemId: 15411, name: 'Mark of Fordring', quality: 'rare', source: 'Quest: Eastern Plaguelands', faction: 'Both' },
  { level: 60, slot: 'Chest', itemId: 14637, name: 'Cadaverous Armor', quality: 'rare', source: 'Scholomance', faction: 'Both' },
  { level: 60, slot: 'Shoulders', itemId: 12927, name: 'Truestrike Shoulders', quality: 'rare', source: 'Upper Blackrock Spire', faction: 'Both' },
];

const levelingSwords: LevelingItem[] = [
  { level: 19, slot: 'Main hand', itemId: 5191, name: 'Cruel Barb', quality: 'rare', source: 'The Deadmines', faction: 'Both' },
  { level: 25, slot: 'Main hand', itemId: 6504, name: 'Wingblade', quality: 'rare', source: 'Quest: Leaders of the Fang', faction: 'Horde' },
  { level: 45, slot: 'Main hand', itemId: 9639, name: "Jang'thraze the Protector", quality: 'rare', source: "Zul'Farrak", faction: 'Both' },
  { level: 58, slot: 'Main hand', itemId: 12940, name: "Dal'Rend's Sacred Charge", quality: 'rare', source: 'Upper Blackrock Spire', faction: 'Both' },
  { level: 58, slot: 'Off hand', itemId: 12939, name: "Dal'Rend's Tribal Guardian", quality: 'rare', source: 'Upper Blackrock Spire', faction: 'Both' },
];

const levelingDaggers: LevelingItem[] = [
  { level: 25, slot: 'Main hand', itemId: 5616, name: 'Gutwrencher', quality: 'rare', source: 'Shadowfang Keep', faction: 'Both' },
  { level: 55, slot: 'Main hand', itemId: 13218, name: 'Fang of the Crystal Spider', quality: 'rare', source: 'Lower Blackrock Spire', faction: 'Both' },
  { level: 56, slot: 'Off hand', itemId: 12791, name: 'Barman Shanker', quality: 'rare', source: 'Blackrock Depths', faction: 'Both' },
];

const byLevel = (items: LevelingItem[]) => [...items].sort((a, b) => a.level - b.level);

export const levelingItems: Record<SpecId, LevelingItem[]> = {
  cbsword: byLevel([...levelingShared, ...levelingSwords]),
  cbdagger: byLevel([...levelingShared, ...levelingDaggers]),
  assn: byLevel([...levelingShared, ...levelingDaggers]),
  subt: byLevel([...levelingShared, ...levelingDaggers]),
};

/** Faction badge colours, run through `tone()` for light mode. */
export const factionColor: Record<'Alliance' | 'Horde', string> = {
  Alliance: '#4A9BE8',
  Horde: '#E0453A',
};
