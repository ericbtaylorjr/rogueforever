import type { GearItem, GearSetId, ItemQuality } from './types';

/**
 * Item data, intentionally empty.
 *
 * Blizzard has confirmed a full itemization pass across every dungeon boss for
 * Forever, so a Classic Era BiS list would be wrong at launch. The table is
 * data-driven and renders an empty state until these arrays are filled — drop
 * items in and every row fills, tooltips included.
 */
export const gearSets: Record<GearSetId, GearItem[]> = {
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

export const itemForSlot = (set: GearSetId, slot: string): GearItem | undefined =>
  gearSets[set].find((i) => i.slot === slot);
