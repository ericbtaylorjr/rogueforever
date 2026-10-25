import { levelingDaggers, levelingShared, levelingSlowWeapons } from '../gear';
import type { Build, ProTip, Rotation, StatPriority } from '../types';
import { byLevel, noEndgameGear, points, racialTips, sliceAndDiceStep, tip } from './shared';

/** WoWSims EP against current BiS gear. EP is relative to `relativeTo` (= 1). */
const stats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.24 },
    { stat: 'Expertise Rating', ep: 2.24, op: '=' },
    { stat: 'Agility', ep: 1.96, op: '>' },
    { stat: 'Crit Rating', ep: 1.71, op: '>' },
    { stat: 'Haste Rating', ep: 1.48, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1, op: '>' },
    { stat: 'Armor Penetration', ep: 0.36, op: '>' },
    { stat: 'Spell Piercing', ep: 0.21, op: '>' },
    { stat: 'Stamina', ep: 0, op: '>' },
  ],
};

/** Hemorrhage works with any weapon, and Ambush only needs a dagger in the main hand, so Subtlety gets every weapon list. */
const levelingGear = byLevel(levelingShared, levelingSlowWeapons, levelingDaggers);

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

/** "Subtlety Hemo" (Use Backstab off, slow main hand): `npm run apl -- subtlety/hemo`. */
const hemoRotation: Rotation = {
  opener: [
    'Premeditation (-2s)',
    'Stealth + Evasion + Major Frenzy Potion + Trinket + Racial (-1s)',
    'Garrote',
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
    eviscerateWithRupture,
  ],
  tips: [
    tip.meleeUptime,
    tip.premeditation,
    tip.trinkets,
    ...racialTips({ adrenalineRush: false, coldBlood: false }),
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
const questingRotation: Rotation = {
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
};

/**
 * No WoWSims preset: the APL with Use Ambush Opener on and Backstab as the builder
 * (Use Backstab on, dagger main hand), `npm run apl -- subtlety/dungeons`.
 */
const dungeonsRotation: Rotation = {
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
};

export const subtlety: Build[] = [
  {
    id: 'backstab',
    spec: 'subtlety',
    phase: 'endgame',
    name: 'Backstab',
    grade: 'B',
    rank: 5,
    talents: points(12, 8, 31),
    talentNote: 'The traditional Subtlety Backstab build, focused on bleed damage.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v20053031-3203-1323200310213211501_t5/2CBaEDHjnPMsrQTw0CDFg1ABD',
    stats,
    gear: noEndgameGear,
    rotation: backstabRotation,
  },
  {
    id: 'hemo',
    spec: 'subtlety',
    phase: 'endgame',
    name: 'Hemo',
    grade: 'A',
    rank: 4,
    talents: points(20, 0, 31),
    talentNote:
      'A variant of the Subtlety Backstab build that uses Hemorrhage as the builder instead. It leans on a slow main hand rather than a dagger.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v2005323101005--1323200310213211501_t5/2CBaEDHjnPMsrQTw0CDEFgjN',
    stats,
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
    rank: 3,
    talents: points(2, 27, 22),
    talentNote:
      'A Subtlety hybrid built around a devastating opener. Stealth in, open with a big Ambush and finish most mobs before they can fight back, then reset and move on. Quick kills, less downtime, and more picking your battles.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v202-321033210014142-4323003010013011_t0/1B0B2BCGddjdaaaPnasr1AFEhGcmnnnnpqqqqR',
    stats,
    gear: levelingGear,
    rotation: questingRotation,
  },
  {
    id: 'dungeons',
    spec: 'subtlety',
    phase: 'leveling',
    activity: 'dungeons',
    name: 'Dungeons',
    grade: 'A',
    rank: 3,
    talents: points(0, 30, 21),
    talentNote: '',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v2-3200332110141423-532000321001301_t0/1B2BCGaajaaahPnhr1AEffhfGjmnnnnpqqqqRS',
    stats,
    gear: levelingGear,
    rotation: dungeonsRotation,
  },
];
