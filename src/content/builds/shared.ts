import type { GearItem, GearSetId, LevelingItem, ProTip, Rotation, RotationStep, TalentTree } from '../types';

/** Talent point split, Assassination / Combat / Subtlety, in each tree's colour. */
export const points = (assassination: number, combat: number, subtlety: number): TalentTree[] => [
  { name: 'Assassination', pts: assassination, color: '#7BE06B' },
  { name: 'Combat', pts: combat, color: '#FF6B5E' },
  { name: 'Subtlety', pts: subtlety, color: '#B98BFF' },
];

/** A rotation that hasn't been written yet. */
export const noRotation: Rotation = { opener: [], steps: [], tips: [] };

/**
 * Rotation lines every build shares, worded once so a row of the WoWSims APL reads the
 * same in every build that can fire it. Regenerate a build's rows with `npm run apl -- <spec>/<id>`.
 */
export const sliceAndDiceStep: RotationStep = {
  press: 'Slice and Dice',
  note: "Only once it has fallen off, with however many combo points you have. Don't refresh it early.",
};

export const tip = {
  meleeUptime: {
    text: 'Melee uptime is very important. Start attacking the moment the tank engages, and stay in melee range as much as possible.',
  },
  adrenalineRush: { text: 'Adrenaline Rush on cooldown, as long as Slice and Dice is up.' },
  bladeFlurry: { text: 'Blade Flurry on cooldown, unless Slice and Dice has 2s or less left.' },
  premeditation: { text: 'Premeditation on cooldown, while you have 3 combo points or fewer.' },
  trinkets: { text: 'Trinkets on cooldown. Trolls use Berserking on cooldown too.' },
  thistleTea: { text: 'Thistle Tea at 15 energy or less, while you have under 3 combo points.' },
  pool: (builder: string): ProTip => ({
    text: `Pool energy in the last 2s of Slice and Dice. Only ${builder} at 0 combo points or 75+ energy, so you can reapply it the moment it falls off.`,
  }),
  vanishGarrote: {
    text: 'Consider fitting in a Vanish into Garrote right after the opener. It lets you be aggressive with your damage and resets your threat. Garrote needs you behind the target.',
    sweaty: true,
  },
  earlyEviscerate: { text: 'At 4 combo points with 2 to 6s of Slice and Dice left, Eviscerate early.', sweaty: true },
  fightEnd: (letGo = 'Slice and Dice'): ProTip => ({
    text: `In the last 6s of the fight, Eviscerate at 3+ combo points and let ${letGo} go.`,
    sweaty: true,
  }),
} satisfies Record<string, ProTip | ((...args: never[]) => ProTip)>;

/**
 * One tip per race with a DPS racial. The APL times them around Adrenaline Rush, so builds
 * without it just use them on cooldown. Night Elves hold Cold Blood while Elune's Light is up.
 */
export const racialTips = ({ adrenalineRush, coldBlood = true }: { adrenalineRush: boolean; coldBlood?: boolean }): ProTip[] =>
  adrenalineRush
    ? [
        { text: 'Orcs: Blood Fury right after Adrenaline Rush, or on its own when Adrenaline Rush is 1.9 min or more away.' },
        {
          text: "Night Elves: Elune's Light, then Adrenaline Rush, holding Adrenaline Rush until both are ready. Use Elune's Light on its own when Adrenaline Rush is 1.9 min or more away, and save Cold Blood until Elune's Light ends.",
        },
        {
          text: "Gnomes: pool to 90 energy, then Eureka! during Adrenaline Rush or whenever Adrenaline Rush is further away than Eureka!'s cooldown. During Eureka!, Thistle Tea at 25 energy or less.",
        },
      ]
    : [
        { text: 'Orcs: Blood Fury on cooldown.' },
        {
          text: coldBlood
            ? "Night Elves: Elune's Light on cooldown, and save Cold Blood until Elune's Light ends."
            : "Night Elves: Elune's Light on cooldown.",
        },
        { text: 'Gnomes: pool to 90 energy, then Eureka! on cooldown. During Eureka!, Thistle Tea at 25 energy or less.' },
      ];

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
