import { levelingGearFor } from '../gear';
import type { Build, ProTip, Rotation, RotationStep, StatPriority } from '../types';
import { backstabMainHandAlternatives, points, preRaidGear, trinkets, weapons, racialTips, shankStep, sliceAndDiceStep, tip, withRiposte } from './shared';

/** Subtlety Hemo (slow main hand) weights from its own WoWSims run. */
const hemoStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Expertise Rating', ep: 2.29 },
    { stat: 'Agility', ep: 1.88, op: '>' },
    { stat: 'Hit Rating', ep: 1.82, op: '>' },
    { stat: 'Haste Rating', ep: 1.6, op: '>' },
    { stat: 'Crit Rating', ep: 1.57, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '>' },
    { stat: 'Spell Piercing', ep: 0.44, op: '>' },
    { stat: 'Armor Penetration', ep: 0.25, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Subtlety Hemo Seal Fate weights from its own WoWSims run (hit, crit, haste and expertise converted from per 1% at 10, 14, 10 and 10 rating). */
const hemoSealFateStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Expertise Rating', ep: 2.34 },
    { stat: 'Agility', ep: 1.9, op: '>' },
    { stat: 'Hit Rating', ep: 1.71, op: '>' },
    { stat: 'Crit Rating', ep: 1.67, op: '>' },
    { stat: 'Haste Rating', ep: 1.44, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '>' },
    { stat: 'Spell Piercing', ep: 0.71, op: '>' },
    { stat: 'Armor Penetration', ep: 0.3, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Subtlety Questing weights from its own WoWSims run (hit, crit, haste and expertise converted from per 1% at 10, 14, 10 and 10 rating). */
const questingStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Expertise Rating', ep: 2.32 },
    { stat: 'Agility', ep: 1.7, op: '>' },
    { stat: 'Crit Rating', ep: 1.26, op: '>' },
    { stat: 'Strength', ep: 1.0, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '=' },
    { stat: 'Hit Rating', ep: 0.82, op: '>' },
    { stat: 'Haste Rating', ep: 0.78, op: '>' },
    { stat: 'Spell Piercing', ep: 0.19, op: '>' },
    { stat: 'Armor Penetration', ep: 0.13, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Subtlety Dungeons weights from its own WoWSims run (hit, crit, haste and expertise converted from per 1% at 10, 14, 10 and 10 rating). */
const dungeonsStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Agility', ep: 1.59 },
    { stat: 'Expertise Rating', ep: 1.43, op: '>' },
    { stat: 'Crit Rating', ep: 1.27, op: '>' },
    { stat: 'Strength', ep: 1.0, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '=' },
    { stat: 'Hit Rating', ep: 0.86, op: '>' },
    { stat: 'Spell Piercing', ep: 0.17, op: '>' },
    { stat: 'Armor Penetration', ep: 0.12, op: '>' },
    { stat: 'Haste Rating', ep: 0.06, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Preparation waits for Vanish, Ghostly Strike and Premeditation to all be on cooldown. */
const preparationTip: ProTip = {
  text: "Preparation when Vanish, Ghostly Strike and Premeditation are all on cooldown and you're at 85 energy or less.",
};
const ruptureStep = { press: 'Rupture', note: "With 3 or more combo points, whenever it isn't on the target." };
/** Death Mark replaces Eviscerate in Hemo's talents, and the APL stops refreshing bleeds and Slice and Dice at the end. */
const hemoFightEnd: ProTip = {
  text: 'In the last 6s of the fight, stop refreshing Slice and Dice and Rupture.',
  sweaty: true,
};

/**
 * "Subtlety Hemo" (slow main hand, Start In Stealth on, Death Mark and Boot Knife talented, Ghostly Strike
 * for Garrote): `npm run apl -- subtlety/hemo`. No Eviscerate or Cold Blood in these talents.
 */
const hemoRotation: Rotation = {
  opener: [
    'Premeditation (-3s)',
    'Sprint (-2s)',
    'Slice and Dice (-1s)',
    { text: 'Evasion + Major Frenzy Potion + Trinket + Racial + Vanish + Garrote', icon: 'Vanish' },
    'Shank',
    'Death Mark',
    'Hemorrhage',
    'Ghostly Strike',
    'Preparation',
    'Premeditation + Rupture',
  ],
  steps: [
    { press: 'Garrote', note: "Whenever it isn't on the target. Ghostly Strike beforehand means it needs no Stealth." },
    {
      press: 'Shank',
      note: "On cooldown, whenever you won't cap energy, at 3 combo points or fewer. Boot Knife adds 2 combo points.",
    },
    { press: 'Death Mark', note: 'With 4 or more combo points.' },
    ruptureStep,
    sliceAndDiceStep,
    {
      press: 'Ghostly Strike',
      note: 'With under 5 combo points, when Garrote has 4s or less left, so the next Garrote needs no Stealth. Also when Garrote has 21s or more left and Hemorrhage has 2s or more left on the target.',
    },
    {
      press: 'Hemorrhage',
      note: "Until you have 5 combo points, while Garrote has 8s or more left and Ghostly Strike's buff is down. Hold it while Ghostly Strike is ready and Garrote has 21s or more left. At 75+ energy, use it whenever you have under 5 combo points.",
    },
  ],
  tips: [
    tip.meleeUptime,
    tip.premeditation,
    tip.trinkets,
    ...racialTips({ adrenalineRush: false, coldBlood: false, bladeFlurry: false }),
    { text: 'Thistle Tea at 25 energy or less, while Death Mark is up and you have under 3 combo points.' },
    preparationTip,
    hemoFightEnd,
  ],
};

/**
 * "Subtlety Hemo Seal Fate" (slow main hand, Start In Stealth on, Cold Blood and Seal Fate instead of Death Mark
 * and Boot Knife, Ghostly Strike for Garrote): `npm run apl -- subtlety/hemo-seal-fate`. Eviscerate finishes at 5 combo points.
 */
const hemoSealFateRotation: Rotation = {
  opener: [
    'Premeditation (-3s)',
    'Sprint (-2s)',
    'Slice and Dice (-1s)',
    { text: 'Evasion + Major Frenzy Potion + Trinket + Racial + Vanish + Garrote', icon: 'Vanish' },
    'Shank',
    'Rupture',
    'Hemorrhage',
    'Ghostly Strike',
    'Ambush',
    'Cold Blood + Eviscerate',
  ],
  steps: [
    {
      press: 'Hemorrhage',
      note: "Your combo point builder, until you have 5 combo points, while Garrote has 8s or more left and Ghostly Strike's buff is down. Hold it while Ghostly Strike is ready and Garrote has 21s or more left. At 75+ energy, use it whenever you have under 5 combo points.",
    },
    shankStep,
    {
      press: 'Ghostly Strike',
      note: 'With under 5 combo points, when Garrote has 4s or less left, so the next Garrote needs no Stealth. Also when Garrote has 21s or more left and Hemorrhage has 2s or more left on the target.',
    },
    { press: 'Garrote', note: "Whenever it isn't on the target. Ghostly Strike beforehand means it needs no Stealth." },
    ruptureStep,
    sliceAndDiceStep,
    { press: 'Cold Blood', note: "If it's off cooldown and you have 5 combo points." },
    { press: 'Eviscerate', note: 'With 5 combo points, as long as Rupture has 3s or more left.' },
  ],
  tips: [
    tip.meleeUptime,
    tip.premeditation,
    tip.trinkets,
    ...racialTips({ adrenalineRush: false, bladeFlurry: false }),
    tip.thistleTea,
    tip.vanishGarroteWhenReady,
    {
      text: 'In the last 6s of the fight, Eviscerate at 3+ combo points and stop refreshing Slice and Dice and Rupture.',
      sweaty: true,
    },
  ],
};

const swapMacroTip: ProTip = {
  text: 'This rotation uses weapon swap macros, which can be found in the Macros section. If you prefer not to swap, always use Slow MH, ignore Stealth and start with Ghostly Strike instead.',
};
const sinisterForHemoTip: ProTip = {
  text: 'Use Sinister Strike in place of Hemorrhage as your combo point builder until you have unlocked the Hemorrhage talent.',
};
const subtletyShank = {
  press: 'Shank',
  note: "On cooldown, whenever you won't cap energy, at 3 combo points or fewer. Boot Knife adds 2 combo points.",
};
const deathMarkStep = { press: 'Death Mark', note: 'With 4+ combo points.' };

/** Subtlety leveling steps, the same for Questing and Dungeons. */
const levelingSteps: RotationStep[] = [
  { press: 'Ambush', note: 'Use weapon swap macro to equip Dagger with Stealth.' },
  {
    press: 'Ghostly Strike',
    note: 'With under 5 combo points, when Garrote has 4s or less left, or has 21s or more left with 2s or more of Hemorrhage left on the target. Macro in your slow main hand if weapon swapping.',
  },
  {
    press: 'Garrote',
    note: "Whenever it isn't on the target. Ghostly Strike beforehand means it needs no Stealth.",
  },
  subtletyShank,
  {
    press: 'Hemorrhage',
    note: "Your combo point builder when you cannot Ambush, until you have 5 combo points, while Garrote has 8s or more left and Ghostly Strike's buff is down. At 75+ energy, use it whenever you have under 5 combo points.",
  },
  deathMarkStep,
  ruptureStep,
];

/**
 * Subtlety Questing, simplified from the APL run with these talents (`npm run apl -- subtlety/questing`): no opener,
 * and no Thistle Tea or potion. Ambush needs a dagger in the main hand, so this build swaps weapons.
 */
const levelingQuestingRotation: Rotation = withRiposte(
  {
    opener: [],
    steps: levelingSteps,
    tips: [
      swapMacroTip,
      sinisterForHemoTip,
      tip.meleeUptime,
      tip.premeditation,
      preparationTip,
      { text: 'Pair your trinkets and racial with Death Mark on a powerful mob or big pull.' },
      { text: 'Use Vanish and Evasion as defensive abilities if threat becomes an issue.' },
    ],
  },
  'Hemorrhage',
);

/**
 * Subtlety Dungeons (`npm run apl -- subtlety/dungeons`): no opener, no Thistle Tea or potion.
 * Ambush needs a dagger in the main hand, so this build swaps weapons.
 */
const levelingDungeonsRotation: Rotation = {
  opener: [],
  steps: levelingSteps,
  tips: [
    swapMacroTip,
    sinisterForHemoTip,
    tip.meleeUptime,
    tip.premeditation,
    preparationTip,
    { text: 'Pair your trinkets and racial with Death Mark on a powerful mob or big pull.' },
    { text: 'Use Vanish and Evasion as defensive abilities if threat becomes an issue.' },
  ],
};

export const subtlety: Build[] = [
  {
    id: 'hemo',
    spec: 'subtlety',
    phase: 'endgame',
    name: 'Hemo',
    grade: 'A',
    rank: 2,
    talents: points(12, 8, 31),
    talentNote:
      'A Subtlety bleed build: Garrote is kept up (Ghostly Strike makes the next one free of Stealth), Hemorrhage builds combo points, and Shank adds 2 more through Boot Knife. Rupture and Death Mark finish, with Slice and Dice up. Open from Stealth with Premeditation, Garrote, Shank and Death Mark.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200530301-320003-305230031321001151_t5',
    stats: hemoStats,
    gear: preRaidGear({
      trinket: trinkets.handOfJustice,
      legs: 'agility',
      devilsaur: true,
      mainHand: [weapons.felstriker, 'crusader'],
      mainHandAlternatives: backstabMainHandAlternatives,
      offHand: [weapons.distractingDagger, 'crusader'],
    }),
    rotation: hemoRotation,
  },
  {
    id: 'hemo-seal-fate',
    spec: 'subtlety',
    phase: 'endgame',
    name: 'Hemo Seal Fate',
    grade: 'A',
    rank: 3,
    talents: points(28, 2, 21),
    talentNote:
      'A Subtlety bleed build with Seal Fate: Garrote is kept up (Ghostly Strike makes the next one free of Stealth), Hemorrhage and Shank build combo points, and Rupture and Slice and Dice stay up. Cold Blood and Eviscerate finish at 5 combo points. Open from Stealth with Premeditation, Garrote, Shank and Slice and Dice.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/vkndmh0053031121135102-02-0052030313210001_t0/2CFDHjKnMs0CFDghJnnnmkPqss1B',
    stats: hemoSealFateStats,
    gear: preRaidGear({
      trinket: trinkets.handOfJustice,
      legs: 'agility',
      devilsaur: true,
      mainHand: [weapons.felstriker, 'crusader'],
      mainHandAlternatives: backstabMainHandAlternatives,
      offHand: [weapons.distractingDagger, 'crusader'],
    }),
    rotation: hemoSealFateRotation,
  },
  {
    id: 'questing',
    spec: 'subtlety',
    phase: 'leveling',
    activity: 'questing',
    name: 'Questing',
    grade: 'A',
    rank: 1,
    talents: points(3, 17, 31),
    talentNote:
      'A Subtlety build around Ambush from Stealth, then Ghostly Strike, Garrote and Hemorrhage for combo points, with Shank adding more through Boot Knife. Use Death Mark at 4+ combo points and keep Rupture up. Swap to a dagger for Ambush.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/vkndmh021-3200330112002-305223031301001151_t0/0B1B2CFeejKhnDhhsrATv1AEffjKfhP0c',
    stats: questingStats,
    gear: levelingGearFor('subtlety', 'questing'),
    rotation: levelingQuestingRotation,
  },
  {
    id: 'dungeons',
    spec: 'subtlety',
    phase: 'leveling',
    activity: 'dungeons',
    name: 'Dungeons',
    grade: 'A',
    rank: 1,
    talents: points(14, 6, 31),
    talentNote:
      'A Subtlety build around Ambush from Stealth, then Ghostly Strike, Garrote and Hemorrhage for combo points, with Shank adding more through Boot Knife. Use Death Mark at 4+ combo points and keep Rupture up. Swap to a dagger for Ambush.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v2005302211-320001-025233031301001151_t0/1B2CFDjKhnhheesrebbTv0CDffhGj1Af',
    stats: dungeonsStats,
    gear: levelingGearFor('subtlety', 'dungeons'),
    rotation: levelingDungeonsRotation,
  },
];
