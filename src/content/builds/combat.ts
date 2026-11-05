import { levelingGearFor } from '../gear';
import type { Build, Rotation, StatPriority } from '../types';
import { noEndgameGear, points, racialTips, shankStep, sliceAndDiceStep, tip, withRiposte } from './shared';

/**
 * Combat Dungeons, simplified from the APL run with these talents (`npm run apl -- combat/dungeons`, with Sinister Strike as the builder): no opener,
 * and no Thistle Tea or pooling. Blade Flurry is only cast before the pull in the APL.
 */
const levelingDungeonsRotation: Rotation = {
  opener: [],
  steps: [
    { press: 'Blade Flurry', note: 'Whenever a mob will live more than 15s or with a double pull.' },
    { press: 'Sinister Strike', note: 'This is your combo point builder.' },
    shankStep,
    { press: 'Slice and Dice', note: 'Only once it has fallen off, at any number of combo points. It is generally not worth casting until around the mid level 40s.' },
    { press: 'Cold Blood', note: 'Whenever it is off cooldown, but only at 5 combo points.' },
    { press: 'Eviscerate', note: 'With 5 combo points.' },
    { press: 'Adrenaline Rush', note: 'Align with large pulls or a boss.' },
  ],
  tips: [
    tip.meleeUptime,
    { text: 'Pair your trinkets and racial with Blade Flurry and Adrenaline Rush on a powerful mob or big pull.' },
    { text: 'Use Vanish and Evasion as defensive abilities if threat becomes an issue.' },
  ],
};

/** Combat Questing weights from its own WoWSims run (hit, crit, haste and expertise converted from per 1% at 10, 14, 10 and 10 rating). */
const questingStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Expertise Rating', ep: 2.83 },
    { stat: 'Agility', ep: 1.76, op: '>' },
    { stat: 'Crit Rating', ep: 1.22, op: '>' },
    { stat: 'Strength', ep: 1.0, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '=' },
    { stat: 'Hit Rating', ep: 0.99, op: '>' },
    { stat: 'Haste Rating', ep: 0.92, op: '>' },
    { stat: 'Armor Penetration', ep: 0.2, op: '>' },
    { stat: 'Spell Piercing', ep: 0.19, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/**
 * Combat Questing, simplified from the APL run with these talents (`npm run apl -- combat/questing`): no opener,
 * and no Rupture, Cold Blood, Adrenaline Rush or pooling. Blade Flurry is only cast before the pull in the APL.
 */
const levelingSinisterStrikeRotation: Rotation = withRiposte(
  {
    opener: [],
    steps: [
      { press: 'Blade Flurry', note: 'Whenever a mob will live more than 15s or with a double pull.' },
      { press: 'Sinister Strike', note: 'This is your combo point builder.' },
      shankStep,
      { press: 'Slice and Dice', note: 'Only once it has fallen off, at any number of combo points. It is generally not worth casting until around the mid level 40s.' },
      { press: 'Eviscerate', note: 'With 5 combo points.' },
    ],
    tips: [
      tip.meleeUptime,
      { text: 'Pair your trinkets and racial with Blade Flurry on a powerful mob or big pull.' },
      { text: 'Use Vanish and Evasion as defensive abilities if threat becomes an issue.' },
    ],
  },
  'Sinister Strike',
);

/** Combat Dungeons weights from its own WoWSims run (hit, crit, haste and expertise converted from per 1% at 10, 14, 10 and 10 rating). */
const dungeonsStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Agility', ep: 1.57 },
    { stat: 'Expertise Rating', ep: 1.35, op: '>' },
    { stat: 'Crit Rating', ep: 1.24, op: '>' },
    { stat: 'Strength', ep: 1.0, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '=' },
    { stat: 'Hit Rating', ep: 0.91, op: '>' },
    { stat: 'Haste Rating', ep: 0.7, op: '>' },
    { stat: 'Armor Penetration', ep: 0.2, op: '>' },
    { stat: 'Spell Piercing', ep: 0.19, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Combat Venom weights from its own WoWSims run. */
const venomStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.18 },
    { stat: 'Expertise Rating', ep: 2.07, op: '>' },
    { stat: 'Agility', ep: 2.01, op: '>' },
    { stat: 'Crit Rating', ep: 1.85, op: '>' },
    { stat: 'Haste Rating', ep: 1.42, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '>' },
    { stat: 'Armor Penetration', ep: 0.4, op: '>' },
    { stat: 'Spell Piercing', ep: 0.34, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Combat Sinister Strike (slow main hand) weights from its own WoWSims run. */
const sinisterStrikeStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.31 },
    { stat: 'Expertise Rating', ep: 2.24, op: '>' },
    { stat: 'Agility', ep: 2.02, op: '>' },
    { stat: 'Crit Rating', ep: 1.78, op: '>' },
    { stat: 'Haste Rating', ep: 1.28, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '>' },
    { stat: 'Armor Penetration', ep: 0.41, op: '>' },
    { stat: 'Spell Piercing', ep: 0.14, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Combat Backstab (dagger main hand) weights from its own WoWSims run. */
const backstabStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.19 },
    { stat: 'Expertise Rating', ep: 2.15, op: '>' },
    { stat: 'Agility', ep: 1.99, op: '>' },
    { stat: 'Crit Rating', ep: 1.75, op: '>' },
    { stat: 'Haste Rating', ep: 1.38, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '>' },
    { stat: 'Armor Penetration', ep: 0.43, op: '>' },
    { stat: 'Spell Piercing', ep: 0.15, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/**
 * Combat SS (Use Backstab off, sword main hand), from the Nov 2 rework APL:
 * `npm run apl -- combat/sinister-strike`, with the race runs. The APL casts Blade Flurry once,
 * three seconds before the pull (and for Orcs, paired with Blood Fury).
 */
const sinisterStrikeRotation: Rotation = {
  opener: [
    'Blade Flurry (-1s)',
    'Evasion + Major Frenzy Potion + Trinket + Racial + Sinister Strike',
    'Slice and Dice',
    'Vanish + Garrote',
    'Shank',
    'Adrenaline Rush',
    'Sinister Strike to 5CP',
    'Cold Blood + Eviscerate',
  ],
  steps: [
    shankStep,
    sliceAndDiceStep,
    { press: 'Sinister Strike', note: 'Until you have 5 combo points.' },
    { press: 'Cold Blood', note: "If it's off cooldown and you have 5 combo points." },
    { press: 'Eviscerate', note: 'With all 5 combo points.' },
  ],
  tips: [
    tip.meleeUptime,
    tip.adrenalineRush,
    tip.trinkets,
    ...racialTips({ adrenalineRush: true }),
    tip.thistleTea,
    tip.vanishGarroteWhenReady,
    tip.earlyEviscerate,
    tip.fightEnd(),
  ],
};

/** Combat BS (Use Backstab on, dagger main hand): `npm run apl -- combat/backstab`. No Cold Blood in these talents. */
const backstabRotation: Rotation = {
  opener: [
    'Blade Flurry (-1s)',
    'Evasion + Major Frenzy Potion + Trinket + Racial + Backstab',
    'Shank',
    'Vanish + Garrote',
    'Slice and Dice',
    'Adrenaline Rush',
    'Backstab to 5CP',
    'Eviscerate',
  ],
  steps: [
    shankStep,
    sliceAndDiceStep,
    { press: 'Backstab', note: 'Until you have 5 combo points. Stay behind the target.' },
    { press: 'Eviscerate', note: 'With all 5 combo points.' },
  ],
  tips: [
    tip.meleeUptime,
    tip.adrenalineRush,
    tip.trinkets,
    ...racialTips({ adrenalineRush: true, coldBlood: false }),
    tip.thistleTea,
    tip.vanishGarroteWhenReady,
    tip.earlyEviscerate,
    tip.fightEnd(),
  ],
};

/** Combat Venom (Sinister Strike builder, no Adrenaline Rush): `npm run apl -- combat/venom`. */
const venomRotation: Rotation = {
  opener: [
    'Blade Flurry (-1s)',
    'Evasion + Major Frenzy Potion + Trinket + Racial + Sinister Strike',
    'Slice and Dice',
    'Vanish + Garrote',
    'Shank',
    'Sinister Strike until 5CP',
    'Cold Blood + Eviscerate',
  ],
  steps: [
    shankStep,
    sliceAndDiceStep,
    { press: 'Sinister Strike', note: 'Until you have 5 combo points.' },
    { press: 'Cold Blood', note: "If it's off cooldown and you have 5 combo points." },
    { press: 'Eviscerate', note: 'With all 5 combo points.' },
  ],
  tips: [
    tip.meleeUptime,
    tip.trinkets,
    ...racialTips({ adrenalineRush: false }),
    tip.thistleTea,
    tip.vanishGarroteWhenReady,
    tip.earlyEviscerate,
    tip.fightEnd(),
  ],
};
export const combat: Build[] = [
  {
    id: 'venom',
    spec: 'combat',
    phase: 'endgame',
    name: 'Venom',
    grade: 'A',
    rank: 5,
    talents: points(21, 30, 0),
    talentNote:
      'Combat with Venom: Shank, your off-hand strike, applies Venom (more poison damage and a better poison chance for 6 seconds), so it goes on cooldown below 80 energy while poisons do extra work. Blade Flurry opens the fight. Keep Slice and Dice up, Sinister Strike to 5 combo points, then Cold Blood and Eviscerate.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200530320241001-320013220201232115_t5',
    stats: venomStats,
    gear: noEndgameGear,
    rotation: venomRotation,
  },
  {
    id: 'sinister-strike',
    spec: 'combat',
    phase: 'endgame',
    name: 'Sinister Strike',
    grade: 'A',
    rank: 2,
    talents: points(16, 35, 0),
    talentNote:
      'The traditional Classic Rogue Combat build: steady melee damage from Sinister Strike builders into Eviscerate, with Blade Flurry before the pull and Adrenaline Rush once Slice and Dice is up. Shank, your new off-hand strike, goes on cooldown below 80 energy. Keep Slice and Dice up, Sinister Strike to 5 combo points, then Cold Blood and Eviscerate.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200530320201-3200132202012321551_t5',
    stats: sinisterStrikeStats,
    gear: noEndgameGear,
    rotation: sinisterStrikeRotation,
  },
  {
    id: 'backstab',
    spec: 'combat',
    phase: 'endgame',
    name: 'Backstab',
    grade: 'A',
    rank: 3,
    talents: points(12, 34, 5),
    talentNote:
      'The Sinister Strike build with a dagger main hand and Backstab as the builder, boosted by Adrenaline Rush, with Blade Flurry before the pull. Shank goes on cooldown below 80 energy. Keep Slice and Dice up, Backstab from behind to 5 combo points, then Eviscerate.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v2005203002-3203130202012321351-005_t5',
    stats: backstabStats,
    gear: noEndgameGear,
    rotation: backstabRotation,
  },
  {
    id: 'questing',
    spec: 'combat',
    phase: 'leveling',
    activity: 'questing',
    name: 'Questing',
    grade: 'A',
    rank: 2,
    talents: points(14, 34, 3),
    talentNote:
      'Traditional Combat, centered on cleaving with Blade Flurry, which you use whenever a mob will live more than 15s or on a double pull. Sinister Strike builds combo points and Shank goes on cooldown below 80 energy. Keep Slice and Dice up, then Eviscerate at 5 combo points. No positioning to worry about.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v20253022-320033011201232155-3_t5/0B1BAEffjKfhnPqqsqRtV2A1tttt0CDGff',
    stats: questingStats,
    gear: levelingGearFor('combat', 'questing'),
    rotation: levelingSinisterStrikeRotation,
  },
  {
    id: 'dungeons',
    spec: 'combat',
    phase: 'leveling',
    activity: 'dungeons',
    name: 'Dungeons',
    grade: 'A',
    rank: 2,
    talents: points(16, 35, 0),
    talentNote:
      'Combat for groups: Blade Flurry cleaves your damage onto a second target while Adrenaline Rush boosts the rest. Sinister Strike builds combo points and Shank goes on cooldown below 80 energy. Keep Slice and Dice up, then Cold Blood and Eviscerate at 5 combo points.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200530221201-3210032202012321551_t5/1BAFGKHcnPqqsqRtVwtttt0CDffGJhm',
    stats: dungeonsStats,
    gear: levelingGearFor('combat', 'dungeons'),
    rotation: levelingDungeonsRotation,
  },
];
