import { levelingGearFor } from '../gear';
import type { Build, ProTip, Rotation, StatPriority } from '../types';
import {
  BLANK_TALENTS,
  forLeveling,
  noEndgameGear,
  points,
  racialTips,
  sliceAndDiceStep,
  tip,
  withRiposte,
} from './shared';

/** Subtlety Dungeons (leveling) weights from its own WoWSims run. EP is relative to `relativeTo` (= 1). */
const dungeonsStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Agility', ep: 1.52 },
    { stat: 'Expertise Rating', ep: 1.48, op: '>' },
    { stat: 'Hit Rating', ep: 1.34, op: '>' },
    { stat: 'Haste Rating', ep: 1.25, op: '>' },
    { stat: 'Crit Rating', ep: 1.18, op: '>' },
    { stat: 'Strength', ep: 1, op: '>' },
    { stat: 'Attack Power', ep: 1, op: '=' },
    { stat: 'Spell Piercing', ep: 0.23, op: '>' },
    { stat: 'Armor Penetration', ep: 0.17, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Subtlety Questing (leveling) weights from its own WoWSims run. */
const questingStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Expertise Rating', ep: 3.04 },
    { stat: 'Agility', ep: 1.5, op: '>' },
    { stat: 'Hit Rating', ep: 1.34, op: '>' },
    { stat: 'Haste Rating', ep: 1.2, op: '>' },
    { stat: 'Crit Rating', ep: 1.14, op: '>' },
    { stat: 'Strength', ep: 1, op: '>' },
    { stat: 'Attack Power', ep: 1, op: '=' },
    { stat: 'Spell Piercing', ep: 0.2, op: '>' },
    { stat: 'Armor Penetration', ep: 0.15, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

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

/** The leveling builds open from Stealth with Ambush, and with Preparation the APL Vanishes again for another. */
const vanishAmbush: ProTip = {
  text: 'Vanish into Ambush whenever Vanish is ready, then Preparation to reset Vanish and do it again. It lets you be aggressive with your damage and resets your threat. Ambush needs a dagger in your main hand and you behind the target.',
  sweaty: true,
};

const ruptureStep = { press: 'Rupture', note: "With 3 or more combo points, whenever it isn't on the target." };
const ghostlyStrikeStep = { press: 'Ghostly Strike', note: "If it's off cooldown." };

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

/**
 * No WoWSims preset: the APL with Use Ambush Opener on, a dagger main hand and Hemorrhage
 * as the builder (Use Backstab off), `npm run apl -- subtlety/questing`.
 */
const questingRotation: Rotation = forLeveling(
  {
    opener: [
      'Blade Flurry + Premeditation (-2s)',
      'Stealth + Evasion + Major Frenzy Potion + Trinket + Racial (-1s)',
      'Ambush',
      'Slice and Dice',
      'Ghostly Strike',
      'Hemorrhage to 3CP',
      'Rupture',
      'Hemorrhage to 5CP',
      'Eviscerate',
    ],
    steps: [
      sliceAndDiceStep,
      ruptureStep,
      ghostlyStrikeStep,
      { press: 'Hemorrhage', note: 'Until you have 5 combo points.' },
      { press: 'Eviscerate', note: 'With all 5 combo points.' },
    ],
    tips: [
      tip.meleeUptime,
      tip.premeditation,
      tip.bladeFlurry,
      tip.trinkets,
      ...racialTips({ adrenalineRush: false, coldBlood: false }),
      tip.thistleTea,
      tip.pool('Hemorrhage'),
      vanishAmbush,
      tip.earlyEviscerate,
      tip.fightEnd('Slice and Dice and Rupture'),
    ],
  },
  ['Blade Flurry'],
);

/**
 * No WoWSims preset: the APL with Use Ambush Opener on and Backstab as the builder
 * (Use Backstab on, dagger main hand), `npm run apl -- subtlety/dungeons`.
 */
const dungeonsRotation: Rotation = forLeveling(
  {
    opener: [
      'Blade Flurry + Premeditation (-2s)',
      'Stealth + Evasion + Major Frenzy Potion + Trinket + Racial (-1s)',
      'Ambush',
      'Slice and Dice',
      'Ghostly Strike',
      'Backstab to 5CP',
      'Eviscerate',
    ],
    steps: [
      sliceAndDiceStep,
      ghostlyStrikeStep,
      { press: 'Backstab', note: 'Until you have 5 combo points. Stay behind the target.' },
      { press: 'Eviscerate', note: 'With all 5 combo points.' },
    ],
    tips: [
      tip.meleeUptime,
      tip.premeditation,
      tip.bladeFlurry,
      tip.trinkets,
      ...racialTips({ adrenalineRush: false, coldBlood: false }),
      tip.thistleTea,
      tip.pool('Backstab'),
      vanishAmbush,
      tip.earlyEviscerate,
      tip.fightEnd(),
    ],
  },
  ['Blade Flurry'],
);

export const subtlety: Build[] = [
  {
    id: 'hemo',
    spec: 'subtlety',
    phase: 'endgame',
    name: 'Hemo',
    grade: 'B',
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
    grade: 'B',
    rank: 3,
    stale: true,
    talents: points(0, 0, 0),
    talentNote:
      'A Subtlety hybrid built around a big Ambush opener. Stealth in, Ambush, and finish most mobs before they can fight back, then reset and move on. Fights that last follow the Hemorrhage loop: Slice and Dice, Rupture at 3+ combo points, Ghostly Strike, Hemorrhage to 5, then Eviscerate. Vanish into Ambush when you want another opener.',
    keyTalents: [],
    link: BLANK_TALENTS,
    stats: questingStats,
    gear: levelingGearFor('subtlety', 'questing'),
    rotation: withRiposte(questingRotation, 'Hemorrhage'),
  },
  {
    id: 'dungeons',
    spec: 'subtlety',
    phase: 'leveling',
    activity: 'dungeons',
    name: 'Dungeons',
    grade: 'B',
    rank: 3,
    stale: true,
    talents: points(0, 0, 0),
    talentNote:
      "Burst opener into steady Backstab damage. Stealth in, Ambush, then keep Slice and Dice up, Ghostly Strike on cooldown, Backstab from behind to 5 combo points and Eviscerate. Blade Flurry on cooldown, and Vanish into Ambush when you want another opener. Needs a dagger in the main hand. Keep Sinister Strike on your bar for when you can't attack from behind.",
    keyTalents: [],
    link: BLANK_TALENTS,
    stats: dungeonsStats,
    gear: levelingGearFor('subtlety', 'dungeons'),
    rotation: dungeonsRotation,
  },
];
