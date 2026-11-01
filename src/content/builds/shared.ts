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
 * Adds the Riposte tip to a build that takes the Riposte talent (Combat tree, row 3): macro it with
 * the build's builder so it fires whenever it's available after a parry. It sits before the pooling tip.
 * The APL doesn't cast Riposte, so this is a talent tip, not a rotation row.
 */
export const withRiposte = (rotation: Rotation, builder: string): Rotation => {
  const riposte: ProTip = { text: `Macro Riposte with ${builder} so it fires whenever it's available after a parry.` };
  const at = rotation.tips.findIndex((t) => t.text.startsWith('Pool energy'));
  const index = at < 0 ? rotation.tips.length : at;
  return { ...rotation, tips: [...rotation.tips.slice(0, index), riposte, ...rotation.tips.slice(index)] };
};

/**
 * A leveling build's version of an endgame-style rotation: no Evasion or potion in the opener, no
 * racial or Thistle Tea tips, the offensive Vanish tip swapped for a defensive one, and the trinket and
 * cooldown tips folded into one line about pairing them (and your racial) on a powerful mob or big pull.
 * `cooldowns` names the cooldown tips it replaces, in the order the rotation lists them (e.g. Adrenaline
 * Rush, Blade Flurry).
 */
export const forLeveling = (rotation: Rotation, cooldowns: string[]): Rotation => {
  const folded = new Set<ProTip>([tip.adrenalineRush, tip.bladeFlurry, tip.trinkets]);
  const isVanish = (t: ProTip) => /Vanish into (Garrote|Ambush)/.test(t.text);
  const defensive: ProTip = { text: 'Use Vanish and Evasion as defensive abilities if threat becomes an issue.' };
  const isRacial = (t: ProTip) => /^(Orcs|Night Elves|Gnomes):/.test(t.text);
  const firstFolded = rotation.tips.findIndex((t) => folded.has(t));
  const list = cooldowns.length > 1 ? `${cooldowns.slice(0, -1).join(', ')} and ${cooldowns.at(-1)}` : cooldowns[0];
  const paired: ProTip = { text: `Pair your trinkets and racial with ${list} on a powerful mob or big pull.` };
  return {
    ...rotation,
    opener: rotation.opener.map((step) => {
      const [, actions, timing = ''] = step.match(/^(.*?)( \(-\d+s\))?$/) ?? [];
      return actions.split(' + ').filter((a) => a !== 'Evasion' && a !== 'Major Frenzy Potion').join(' + ') + timing;
    }),
    tips: rotation.tips.flatMap((t, i) =>
      i === firstFolded ? [paired] : isVanish(t) ? [defensive] : folded.has(t) || isRacial(t) || t === tip.thistleTea ? [] : [t],
    ),
  };
};

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
