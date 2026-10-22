import levelingGear from './leveling-gear.json';
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

export const wowheadUrl = (itemId: number) => `https://www.wowhead.com/forever/item=${itemId}`;

/** Leveling gear is split into level ranges so readers only scan the stretch they're in. */
export const levelingBrackets = [
  { from: 1, to: 20 },
  { from: 21, to: 40 },
  { from: 41, to: 60 },
] as const;

/*
 * Leveling milestone building blocks, generated from Wowhead's Forever database by
 * scripts/gear-research (see its README). Don't edit leveling-gear.json by hand: fix
 * picks in scripts/gear-research/curation.json and rerun `rank.mjs --emit`.
 * Each leveling build in `builds/` combines the lists it can use.
 */
/** Armour, jewelry, trinkets and ranged: the same for every leveling build. */
export const levelingShared = levelingGear.shared as LevelingItem[];
/** Swords, axes, maces and fist weapons in the main hand, any one-hander in the off hand (Sinister Strike, Hemorrhage). */
export const levelingSlowWeapons = levelingGear.slow as LevelingItem[];
/** Daggers in both hands (Mutilate, Backstab, Ambush). */
export const levelingDaggers = levelingGear.daggers as LevelingItem[];

/** Faction badge colours, run through `tone()` for light mode. */
export const factionColor: Record<'Alliance' | 'Horde', string> = {
  Alliance: '#4A9BE8',
  Horde: '#E0453A',
};
