import { levelingGearFor } from '../gear';
import type { Build, Rotation, StatPriority } from '../types';
import {
  BLANK_TALENTS,
  noEndgameGear,
  noRotation,
  noStats,
  points,
  racialTips,
  shankStep,
  sliceAndDiceStep,
  tip,
} from './shared';

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
    grade: 'X',
    rank: 1,
    stale: true,
    talents: points(0, 0, 0),
    talentNote:
      'Traditional Combat, centered on cleaving with Blade Flurry. Pull two or three mobs, turn on Blade Flurry and take them down together. Keep Slice and Dice up, Sinister Strike to 5 combo points, then Cold Blood and Eviscerate. No positioning to worry about.',
    keyTalents: [],
    link: BLANK_TALENTS,
    stats: noStats,
    gear: levelingGearFor('combat', 'questing'),
    rotation: noRotation,
  },
  {
    id: 'dungeons',
    spec: 'combat',
    phase: 'leveling',
    activity: 'dungeons',
    name: 'Dungeons',
    grade: 'X',
    rank: 1,
    stale: true,
    talents: points(0, 0, 0),
    talentNote:
      "Combat for groups with a Backstab twist: Blade Flurry cleaves your damage onto a second target while Adrenaline Rush boosts the rest. Keep Slice and Dice up, Backstab from behind to 5 combo points, then Cold Blood and Eviscerate. Needs a dagger in the main hand. Keep Sinister Strike on your bar for when you can't attack from behind.",
    keyTalents: [],
    link: BLANK_TALENTS,
    stats: noStats,
    gear: levelingGearFor('combat', 'dungeons'),
    rotation: noRotation,
  },
];
