import type { ItemQuality, LevelingItem } from './types';

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

/*
 * Leveling milestone building blocks. Each leveling build in `builds/` picks
 * its own list from these: armour and accessories, plus the weapons it uses.
 *
 * TODO: placeholder list built from Classic Era. Forever re-itemizes dungeons,
 * so verify every item, level and item ID before this goes live.
 */
export const levelingShared: LevelingItem[] = [
  { level: 18, slot: 'Legs', itemId: 10400, name: 'Blackened Defias Leggings', quality: 'uncommon', source: 'The Deadmines', faction: 'Both' },
  { level: 20, slot: 'Chest', itemId: 10399, name: 'Blackened Defias Armor', quality: 'rare', source: 'The Deadmines', faction: 'Both' },
  { level: 17, slot: 'Waist', itemId: 10403, name: 'Blackened Defias Belt', quality: 'uncommon', source: 'The Deadmines', faction: 'Both' },
  { level: 21, slot: 'Back', itemId: 6449, name: 'Glowing Lizardscale Cloak', quality: 'rare', source: 'Wailing Caverns', faction: 'Both' },
  { level: 22, slot: 'Chest', itemId: 2041, name: 'Tunic of Westfall', quality: 'rare', source: 'Quest: The Defias Brotherhood', faction: 'Alliance' },
  { level: 22, slot: 'Ranged', itemId: 6469, name: 'Venomstrike', quality: 'rare', source: 'Wailing Caverns', faction: 'Both' },
  { level: 49, slot: 'Ring 1', itemId: 17713, name: 'Blackstone Ring', quality: 'rare', source: 'Quest: Maraudon', faction: 'Both' },
  { level: 53, slot: 'Hands', itemId: 15063, name: 'Devilsaur Gauntlets', quality: 'rare', source: 'Leatherworking', faction: 'Both' },
  { level: 55, slot: 'Legs', itemId: 15062, name: 'Devilsaur Leggings', quality: 'rare', source: 'Leatherworking', faction: 'Both' },
  { level: 57, slot: 'Head', itemId: 13404, name: 'Mask of the Unforgiven', quality: 'rare', source: 'Stratholme', faction: 'Both' },
  { level: 58, slot: 'Trinket 1', itemId: 11815, name: 'Hand of Justice', quality: 'rare', source: 'Blackrock Depths', faction: 'Both' },
  { level: 58, slot: 'Neck', itemId: 15411, name: 'Mark of Fordring', quality: 'rare', source: 'Quest: Eastern Plaguelands', faction: 'Both' },
  { level: 60, slot: 'Chest', itemId: 14637, name: 'Cadaverous Armor', quality: 'rare', source: 'Scholomance', faction: 'Both' },
  { level: 60, slot: 'Shoulders', itemId: 12927, name: 'Truestrike Shoulders', quality: 'rare', source: 'Upper Blackrock Spire', faction: 'Both' },
];

export const levelingSwords: LevelingItem[] = [
  { level: 19, slot: 'Main hand', itemId: 5191, name: 'Cruel Barb', quality: 'rare', source: 'The Deadmines', faction: 'Both' },
  { level: 25, slot: 'Main hand', itemId: 6504, name: 'Wingblade', quality: 'rare', source: 'Quest: Leaders of the Fang', faction: 'Horde' },
  { level: 45, slot: 'Main hand', itemId: 9380, name: "Jang'thraze the Protector", quality: 'rare', source: "Zul'Farrak", faction: 'Both' },
  { level: 58, slot: 'Main hand', itemId: 12940, name: "Dal'Rend's Sacred Charge", quality: 'rare', source: 'Upper Blackrock Spire', faction: 'Both' },
  { level: 58, slot: 'Off hand', itemId: 12939, name: "Dal'Rend's Tribal Guardian", quality: 'rare', source: 'Upper Blackrock Spire', faction: 'Both' },
];

export const levelingDaggers: LevelingItem[] = [
  { level: 42, slot: 'Main hand', itemId: 5616, name: 'Gutwrencher', quality: 'rare', source: 'Shadowfang Keep', faction: 'Both' },
  { level: 56, slot: 'Off hand', itemId: 13218, name: 'Fang of the Crystal Spider', quality: 'rare', source: 'Lower Blackrock Spire', faction: 'Both' },
  { level: 50, slot: 'Main hand', itemId: 12791, name: 'Barman Shanker', quality: 'rare', source: 'Blackrock Depths', faction: 'Both' },
];

/** Faction badge colours, run through `tone()` for light mode. */
export const factionColor: Record<'Alliance' | 'Horde', string> = {
  Alliance: '#4A9BE8',
  Horde: '#E0453A',
};
