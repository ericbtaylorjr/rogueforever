import levelingGear from './leveling-gear.json';
import type { ItemQuality, LevelingItem, SpecId } from './types';

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
 * Leveling milestone gear, generated per build from Wowhead's Forever database with each
 * build's own stat weights (scripts/gear-research, see its README and the
 * leveling-milestone-gear skill). Don't edit leveling-gear.json by hand: fix picks in
 * scripts/gear-research/curation.json and rerun `rank.mjs --emit`.
 */
const levelingBuilds = levelingGear.builds as Record<string, LevelingItem[]>;

/** The milestone list for one leveling build, in the order you reach each item. */
export const levelingGearFor = (spec: SpecId, build: string): LevelingItem[] => {
  const list = levelingBuilds[`${spec}/${build}`];
  if (!list) throw new Error(`No leveling gear generated for ${spec}/${build}`);
  return list;
};

/** Faction badge colours, run through `tone()` for light mode. */
export const factionColor: Record<'Alliance' | 'Horde', string> = {
  Alliance: '#4A9BE8',
  Horde: '#E0453A',
};
