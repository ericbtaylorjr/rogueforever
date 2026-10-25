import type { GearItem, GearSetId, LevelingItem, Rotation, TalentTree } from '../types';

/** Talent point split, Assassination / Combat / Subtlety, in each tree's colour. */
export const points = (assassination: number, combat: number, subtlety: number): TalentTree[] => [
  { name: 'Assassination', pts: assassination, color: '#7BE06B' },
  { name: 'Combat', pts: combat, color: '#FF6B5E' },
  { name: 'Subtlety', pts: subtlety, color: '#B98BFF' },
];

/** A rotation that hasn't been written yet. */
export const noRotation: Rotation = { opener: [], steps: [], tips: [] };

/**
 * Level 60 gear that hasn't been listed yet. Blizzard has confirmed a full
 * itemization pass for Forever, so Classic Era BiS lists would be wrong at launch.
 */
export const noEndgameGear: Record<GearSetId, GearItem[]> = { prebis: [], bis: [] };

/** Leveling milestones from one or more lists, in the order you reach them. An item in two lists for the same slot shows once. */
export const byLevel = (...lists: LevelingItem[][]) => {
  const seen = new Set<string>();
  return lists
    .flat()
    .filter((i) => {
      const key = `${i.itemId}:${i.slot}`;
      return !seen.has(key) && seen.add(key);
    })
    .sort((a, b) => a.level - b.level);
};
