import { levelingGearFor } from '../gear';
import type { Build, ProTip, Rotation, RotationStep, StatPriority } from '../types';
import { noEndgameGear, points, racialTips, sliceAndDiceStep, tip, withRiposte } from './shared';

/** Subtlety Hemo (slow main hand) weights from its own WoWSims run. */
const hemoStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.47 },
    { stat: 'Expertise Rating', ep: 2.18, op: '>' },
    { stat: 'Agility', ep: 2.07, op: '>' },
    { stat: 'Crit Rating', ep: 1.89, op: '>' },
    { stat: 'Haste Rating', ep: 1.27, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '>' },
    { stat: 'Armor Penetration', ep: 0.26, op: '>' },
    { stat: 'Spell Piercing', ep: 0.13, op: '>' },
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
    'Premeditation (-1s)',
    'Slice and Dice',
    'Evasion + Major Frenzy Potion + Trinket + Racial + Vanish + Garrote',
    'Preparation',
    'Premeditation + Death Mark',
    'Shank',
    'Rupture',
    'Hemorrhage to 5CP',
    'Death Mark',
  ],
  steps: [
    { press: 'Garrote', note: "Whenever it isn't on the target. Ghostly Strike beforehand means it needs no Stealth." },
    {
      press: 'Shank',
      note: 'On cooldown, at 3 combo points or fewer and 80 energy or less. Boot Knife adds 2 combo points.',
    },
    { press: 'Death Mark', note: 'With 4 or more combo points.' },
    ruptureStep,
    sliceAndDiceStep,
    { press: 'Ghostly Strike', note: 'When Garrote has 4s or less left, so the next Garrote needs no Stealth.' },
    { press: 'Hemorrhage', note: 'Until you have 5 combo points, while Garrote has 8s or more left.' },
  ],
  tips: [
    tip.meleeUptime,
    tip.premeditation,
    tip.trinkets,
    ...racialTips({ adrenalineRush: false, coldBlood: false, bladeFlurry: false }),
    { text: 'Thistle Tea at 25 energy or less, while Death Mark is up and you have under 3 combo points.' },
    hemoFightEnd,
  ],
};

const swapMacroTip: ProTip = {
  text: 'This rotation uses weapon swap macros, which can be found in the Macros section. If you prefer not to swap, always use Slow MH, ignore Stealth and start with Ghostly Strike instead.',
};
const sinisterForHemoTip: ProTip = {
  text: 'Use Sinister Strike in place of Hemorrhage as your combo point builder until you have unlocked the Hemorrhage talent.',
};
const preparationTip: ProTip = { text: 'Preparation whenever Vanish is on cooldown.' };
const subtletyShank = {
  press: 'Shank',
  note: 'On cooldown, at 3 combo points or fewer and 80 energy or less. Boot Knife adds 2 combo points.',
};
const deathMarkStep = { press: 'Death Mark', note: 'With 4+ combo points.' };

/** Subtlety leveling steps, the same for Questing and Dungeons. */
const levelingSteps: RotationStep[] = [
  { press: 'Ambush', note: 'Use weapon swap macro to equip Dagger with Stealth.' },
  {
    press: 'Ghostly Strike',
    note: 'On cooldown, whenever you have under 5 combo points. Macro in your slow main hand if weapon swapping.',
  },
  {
    press: 'Garrote',
    note: "Whenever it isn't on the target. Ghostly Strike beforehand means it needs no Stealth.",
  },
  subtletyShank,
  { press: 'Hemorrhage', note: 'Your combo point builder when you cannot Ambush, until you have 5 combo points.' },
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
    rank: 4,
    talents: points(12, 8, 31),
    talentNote:
      'A Subtlety bleed build: Garrote is kept up (Ghostly Strike makes the next one free of Stealth), Hemorrhage builds combo points, and Shank adds 2 more through Boot Knife. Rupture and Death Mark finish, with Slice and Dice up. Open from Stealth with Premeditation, Garrote, Shank and Death Mark.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200530301-320003-305230031321001151_t5',
    stats: hemoStats,
    gear: noEndgameGear,
    rotation: hemoRotation,
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
