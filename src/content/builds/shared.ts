import type { GearItem, GearSetId, LevelingItem, Rotation, TalentTree } from '../types';

/** Talent point split, Assassination / Combat / Subtlety, in each tree's colour. */
export const points = (assassination: number, combat: number, subtlety: number): TalentTree[] => [
  { name: 'Assassination', pts: assassination, color: '#7BE06B' },
  { name: 'Combat', pts: combat, color: '#FF6B5E' },
  { name: 'Subtlety', pts: subtlety, color: '#B98BFF' },
];

/** A rotation that hasn't been written yet. */
export const noRotation: Rotation = { apl: [], opener: [], nevers: [] };

/**
 * Level 60 gear that hasn't been listed yet. Blizzard has confirmed a full
 * itemization pass for Forever, so Classic Era BiS lists would be wrong at launch.
 */
export const noEndgameGear: Record<GearSetId, GearItem[]> = { prebis: [], bis: [] };

/** Leveling milestones in the order you reach them. */
export const byLevel = (items: LevelingItem[]) => [...items].sort((a, b) => a.level - b.level);
