import { levelingGearFor } from '../gear';
import type { Build, ProTip, Rotation, StatPriority } from '../types';
import { forLeveling, noEndgameGear, points, racialTips, sliceAndDiceStep, tip, withRiposte } from './shared';

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

/** Subtlety Backstab (dagger main hand) weights from its own WoWSims run. */
const backstabStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.99 },
    { stat: 'Expertise Rating', ep: 2.61, op: '>' },
    { stat: 'Agility', ep: 2.0, op: '>' },
    { stat: 'Crit Rating', ep: 1.77, op: '>' },
    { stat: 'Haste Rating', ep: 1.33, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1, op: '>' },
    { stat: 'Armor Penetration', ep: 0.35, op: '>' },
    { stat: 'Spell Piercing', ep: 0.16, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Subtlety Hemo (slow main hand) weights from its own WoWSims run. */
const hemoStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.59 },
    { stat: 'Expertise Rating', ep: 2.27, op: '>' },
    { stat: 'Agility', ep: 1.98, op: '>' },
    { stat: 'Crit Rating', ep: 1.74, op: '>' },
    { stat: 'Haste Rating', ep: 1.31, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1, op: '>' },
    { stat: 'Armor Penetration', ep: 0.32, op: '>' },
    { stat: 'Spell Piercing', ep: 0.2, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/**
 * Subtlety opens from Stealth, as the APL does: Premeditation before the pull, then Garrote
 * (or Ambush, for the leveling builds). With Preparation, the APL Vanishes again for another.
 */
const vanishGarrote: ProTip = {
  text: 'Vanish into Garrote whenever Garrote has fallen off, then Preparation to reset Vanish and do it again. It lets you be aggressive with your damage and resets your threat.',
  sweaty: true,
};

const vanishAmbush: ProTip = {
  text: 'Vanish into Ambush whenever Vanish is ready, then Preparation to reset Vanish and do it again. It lets you be aggressive with your damage and resets your threat. Ambush needs a dagger in your main hand and you behind the target.',
  sweaty: true,
};

const ruptureStep = { press: 'Rupture', note: "With 3 or more combo points, whenever it isn't on the target." };
const ghostlyStrikeStep = { press: 'Ghostly Strike', note: "If it's off cooldown." };

/** Thousand Cuts: the APL only Eviscerates while Rupture has 4s or more left, unless energy is about to cap. */
const eviscerateWithRupture = {
  press: 'Eviscerate',
  note: 'With all 5 combo points, as long as Rupture has 4s or more left or you have 75+ energy.',
};

/** The WoWSims Rogue APL as the "Subtlety BS" preset runs it (Use Backstab on, dagger main hand): `npm run apl -- subtlety/backstab`. */
const backstabRotation: Rotation = {
  opener: [
    'Premeditation (-2s)',
    'Stealth + Evasion + Major Frenzy Potion + Trinket + Racial (-1s)',
    'Garrote',
    'Slice and Dice',
    'Ghostly Strike',
    'Hemorrhage',
    'Backstab to 3CP',
    'Rupture',
    'Backstab to 5CP',
    'Eviscerate',
  ],
  steps: [
    sliceAndDiceStep,
    ruptureStep,
    ghostlyStrikeStep,
    { press: 'Hemorrhage', note: "Whenever its debuff isn't on the target." },
    { press: 'Backstab', note: 'Until you have 5 combo points. Stay behind the target.' },
    eviscerateWithRupture,
  ],
  tips: [
    tip.meleeUptime,
    tip.premeditation,
    tip.trinkets,
    ...racialTips({ adrenalineRush: false, coldBlood: false }),
    tip.thistleTea,
    tip.pool('Backstab'),
    vanishGarrote,
    tip.earlyEviscerate,
    tip.fightEnd('Slice and Dice and Rupture'),
  ],
};

/** "Subtlety Hemo" (Use Backstab off, slow main hand, Cold Blood talented, no Ghostly Strike): `npm run apl -- subtlety/hemo`. */
const hemoRotation: Rotation = {
  opener: [
    'Premeditation (-2s)',
    'Stealth + Evasion + Major Frenzy Potion + Trinket + Racial (-1s)',
    'Garrote',
    'Slice and Dice',
    'Hemorrhage to 3CP',
    'Rupture',
    'Hemorrhage to 5CP',
    'Cold Blood + Eviscerate',
  ],
  steps: [
    sliceAndDiceStep,
    ruptureStep,
    { press: 'Hemorrhage', note: 'Until you have 5 combo points.' },
    { press: 'Cold Blood', note: "If it's off cooldown and you have 5 combo points." },
    eviscerateWithRupture,
  ],
  tips: [
    tip.meleeUptime,
    tip.premeditation,
    tip.trinkets,
    ...racialTips({ adrenalineRush: false }),
    tip.thistleTea,
    tip.pool('Hemorrhage'),
    vanishGarrote,
    tip.earlyEviscerate,
    tip.fightEnd('Slice and Dice and Rupture'),
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
    id: 'backstab',
    spec: 'subtlety',
    phase: 'endgame',
    name: 'Backstab',
    grade: 'B',
    rank: 5,
    talents: points(12, 8, 31),
    talentNote:
      'The traditional Subtlety Backstab build: bleed damage from Garrote and Rupture, plus Backstab builders and Eviscerate finishers. Keep Slice and Dice up, Rupture at 3+ combo points, Ghostly Strike and Hemorrhage as needed, Backstab from behind to 5, then Eviscerate while Rupture is up.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v20053031-3203-1323200310213211501_t5/2CBaEDHjnPMsrQTw0CDFg1ABD',
    stats: backstabStats,
    gear: noEndgameGear,
    rotation: backstabRotation,
  },
  {
    id: 'hemo',
    spec: 'subtlety',
    phase: 'endgame',
    name: 'Hemo',
    grade: 'B',
    rank: 4,
    talents: points(20, 0, 31),
    talentNote:
      'A Subtlety Backstab variant using Hemorrhage as the builder, so it works with a slow main hand instead of a dagger. Bleed damage from Garrote and Rupture, with Eviscerate finishers. Keep Slice and Dice up, Rupture at 3+ combo points, Hemorrhage to 5, then Cold Blood and Eviscerate while Rupture is up.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v2005323101014--4323200300013211501_t5',
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
    talents: points(2, 27, 22),
    talentNote:
      'A Subtlety hybrid built around a big Ambush opener. Stealth in, Ambush, and finish most mobs before they can fight back, then reset and move on. Fights that last follow the Hemorrhage loop: Slice and Dice, Rupture at 3+ combo points, Ghostly Strike, Hemorrhage to 5, then Eviscerate. Vanish into Ambush when you want another opener.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v202-321033210014142-4323003010013011_t0/1B0B2BCGddjdaaaPnasr1AFEhGcmnnnnpqqqqR',
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
    talents: points(0, 30, 21),
    talentNote:
      "Burst opener into steady Backstab damage. Stealth in, Ambush, then keep Slice and Dice up, Ghostly Strike on cooldown, Backstab from behind to 5 combo points and Eviscerate. Blade Flurry on cooldown, and Vanish into Ambush when you want another opener. Needs a dagger in the main hand. Keep Sinister Strike on your bar for when you can't attack from behind.",
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v2-3223032000141423-532000321001301_t0/1B2CaaaGaajhhbbnPbr1AFDGccmnnnnpqqqqRS',
    stats: dungeonsStats,
    gear: levelingGearFor('subtlety', 'dungeons'),
    rotation: dungeonsRotation,
  },
];
