import { levelingGearFor } from '../gear';
import type { Build, Rotation, StatPriority } from '../types';
import { forLeveling, noEndgameGear, points, racialTips, sliceAndDiceStep, tip, withRiposte } from './shared';

/** Combat Dungeons (leveling) weights from its own WoWSims run. EP is relative to `relativeTo` (= 1). */
const dungeonsStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Agility', ep: 1.52 },
    { stat: 'Expertise Rating', ep: 1.42, op: '>' },
    { stat: 'Hit Rating', ep: 1.19, op: '>' },
    { stat: 'Crit Rating', ep: 1.18, op: '>' },
    { stat: 'Haste Rating', ep: 1.12, op: '>' },
    { stat: 'Strength', ep: 1, op: '>' },
    { stat: 'Attack Power', ep: 1, op: '=' },
    { stat: 'Spell Piercing', ep: 0.22, op: '>' },
    { stat: 'Armor Penetration', ep: 0.2, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Combat Questing (leveling) weights from its own WoWSims run. */
const questingStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Expertise Rating', ep: 3.22 },
    { stat: 'Agility', ep: 1.54, op: '>' },
    { stat: 'Hit Rating', ep: 1.33, op: '>' },
    { stat: 'Crit Rating', ep: 1.23, op: '>' },
    { stat: 'Haste Rating', ep: 1.22, op: '>' },
    { stat: 'Strength', ep: 1, op: '>' },
    { stat: 'Attack Power', ep: 1, op: '=' },
    { stat: 'Spell Piercing', ep: 0.21, op: '>' },
    { stat: 'Armor Penetration', ep: 0.19, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Combat Mutilate (daggers in both hands) weights from its own WoWSims run. */
const mutilateStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.44 },
    { stat: 'Expertise Rating', ep: 2.35, op: '>' },
    { stat: 'Agility', ep: 1.97, op: '>' },
    { stat: 'Crit Rating', ep: 1.73, op: '>' },
    { stat: 'Haste Rating', ep: 1.63, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1, op: '>' },
    { stat: 'Armor Penetration', ep: 0.41, op: '>' },
    { stat: 'Spell Piercing', ep: 0.27, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Combat Sinister Strike (slow main hand) weights from its own WoWSims run. */
const sinisterStrikeStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.43 },
    { stat: 'Expertise Rating', ep: 2.37, op: '>' },
    { stat: 'Agility', ep: 2.0, op: '>' },
    { stat: 'Crit Rating', ep: 1.75, op: '>' },
    { stat: 'Haste Rating', ep: 1.58, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1, op: '>' },
    { stat: 'Armor Penetration', ep: 0.39, op: '>' },
    { stat: 'Spell Piercing', ep: 0.17, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Combat Backstab (dagger main hand) weights from its own WoWSims run. */
const backstabStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.48 },
    { stat: 'Expertise Rating', ep: 2.42, op: '>' },
    { stat: 'Agility', ep: 1.95, op: '>' },
    { stat: 'Crit Rating', ep: 1.67, op: '>' },
    { stat: 'Haste Rating', ep: 1.62, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1, op: '>' },
    { stat: 'Armor Penetration', ep: 0.42, op: '>' },
    { stat: 'Spell Piercing', ep: 0.16, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/**
 * The WoWSims Rogue APL as the "Combat SS" preset runs it (Use Backstab off, sword main
 * hand). Regenerate the source rows with `npm run apl -- combat/sinister-strike`.
 * The opener, the melee uptime tip and the Vanish tip's wording are hand-edited.
 * Combat Questing resolves to the same rows, so it shares it.
 */
const sinisterStrikeRotation: Rotation = {
  opener: [
    'Blade Flurry + Evasion + Major Frenzy Potion + Trinket + Racial (-1s)',
    'Sinister Strike',
    'Slice and Dice',
    'Adrenaline Rush',
    'Sinister Strike to 5CP',
    'Cold Blood + Eviscerate',
  ],
  steps: [
    sliceAndDiceStep,
    { press: 'Sinister Strike', note: 'Until you have 5 combo points.' },
    { press: 'Cold Blood', note: "If it's off cooldown." },
    { press: 'Eviscerate', note: 'With all 5 combo points.' },
  ],
  tips: [
    tip.meleeUptime,
    tip.adrenalineRush,
    tip.bladeFlurry,
    tip.trinkets,
    ...racialTips({ adrenalineRush: true }),
    tip.thistleTea,
    tip.pool('Sinister Strike'),
    tip.vanishGarrote,
    tip.earlyEviscerate,
    tip.fightEnd(),
  ],
};

/**
 * "Combat BS" (Use Backstab on, dagger main hand): `npm run apl -- combat/backstab`.
 * Combat Dungeons resolves to the same rows, so it shares it.
 */
const backstabRotation: Rotation = {
  opener: [
    'Blade Flurry + Evasion + Major Frenzy Potion + Trinket + Racial (-1s)',
    'Backstab',
    'Slice and Dice',
    'Adrenaline Rush',
    'Backstab to 5CP',
    'Cold Blood + Eviscerate',
  ],
  steps: [
    sliceAndDiceStep,
    { press: 'Backstab', note: 'Until you have 5 combo points. Stay behind the target.' },
    { press: 'Cold Blood', note: "If it's off cooldown." },
    { press: 'Eviscerate', note: 'With all 5 combo points.' },
  ],
  tips: [
    tip.meleeUptime,
    tip.adrenalineRush,
    tip.bladeFlurry,
    tip.trinkets,
    ...racialTips({ adrenalineRush: true }),
    tip.thistleTea,
    tip.pool('Backstab'),
    tip.vanishGarrote,
    tip.earlyEviscerate,
    tip.fightEnd(),
  ],
};

/**
 * "Combat Muti" (daggers in both hands): `npm run apl -- combat/mutilate`. Mutilate adds 2
 * combo points, so the APL Eviscerates at 4 and Cold Blood only fires at 5.
 * Assassination Questing and Dungeons resolve to the same rows, so they share it.
 */
export const mutilateRotation: Rotation = {
  opener: [
    'Blade Flurry + Evasion + Major Frenzy Potion + Trinket + Racial (-1s)',
    'Mutilate',
    'Slice and Dice',
    'Mutilate to 4CP',
    'Eviscerate',
  ],
  steps: [
    sliceAndDiceStep,
    { press: 'Mutilate', note: 'Until you have 4 or more combo points. Needs a dagger in both hands.' },
    { press: 'Cold Blood', note: "If it's off cooldown and you have 5 combo points." },
    { press: 'Eviscerate', note: 'With 4 or 5 combo points.' },
  ],
  tips: [
    tip.meleeUptime,
    tip.bladeFlurry,
    tip.trinkets,
    ...racialTips({ adrenalineRush: false }),
    tip.thistleTea,
    tip.pool('Mutilate'),
    tip.vanishGarrote,
    tip.fightEnd(),
  ],
};

/** Leveling versions: Combat Questing and Dungeons, and Assassination Questing and Dungeons (`mutilateRotation`). */
const levelingSinisterStrikeRotation = forLeveling(sinisterStrikeRotation, ['Adrenaline Rush', 'Blade Flurry']);
const levelingBackstabRotation = forLeveling(backstabRotation, ['Adrenaline Rush', 'Blade Flurry']);
export const levelingMutilateRotation = forLeveling(mutilateRotation, ['Blade Flurry']);

export const combat: Build[] = [
  {
    id: 'mutilate',
    spec: 'combat',
    phase: 'endgame',
    name: 'Mutilate',
    grade: 'A',
    rank: 3,
    stale: true,
    talents: points(21, 29, 1),
    talentNote:
      'Dagger damage using Combat talents instead of Venom. Mutilate builds combo points two at a time and Eviscerate finishes, with Blade Flurry on cooldown. Keep Slice and Dice up, Mutilate to 4 or more combo points, then Eviscerate (Cold Blood first at 5). Needs a dagger in both hands.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200532310101401-320303202015152-001_t5/0CDEFgjm1ABDFGJmNQpR0nn2c0nnq',
    stats: mutilateStats,
    gear: noEndgameGear,
    rotation: mutilateRotation,
  },
  {
    id: 'sinister-strike',
    spec: 'combat',
    phase: 'endgame',
    name: 'Sinister Strike',
    grade: 'S',
    rank: 2,
    stale: true,
    talents: points(18, 33, 0),
    talentNote:
      'The traditional Classic Rogue Combat build: steady melee damage from Sinister Strike builders into Eviscerate, boosted by Adrenaline Rush and Blade Flurry. Keep Slice and Dice up, Sinister Strike to 5 combo points, then Cold Blood and Eviscerate.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v2005323101012-32030320201515231_t5/0CDEFgjm1ABDFGJmNQpRSt0nn',
    stats: sinisterStrikeStats,
    gear: noEndgameGear,
    rotation: sinisterStrikeRotation,
  },
  {
    id: 'backstab',
    spec: 'combat',
    phase: 'endgame',
    name: 'Backstab',
    grade: 'S',
    rank: 1,
    stale: true,
    talents: points(16, 33, 2),
    talentNote:
      'The Sinister Strike build with a dagger main hand and Backstab as the builder, boosted by Adrenaline Rush and Blade Flurry. Keep Slice and Dice up, Backstab from behind to 5 combo points, then Cold Blood and Eviscerate.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200532310101-32030320201515231-002_t5/0CDe2C0eFgjm1ABDFGJmNQpRSt',
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
    grade: 'S',
    rank: 1,
    stale: true,
    talents: points(17, 34, 0),
    talentNote:
      'Traditional Combat, centered on cleaving with Blade Flurry. Pull two or three mobs, turn on Blade Flurry and take them down together. Keep Slice and Dice up, Sinister Strike to 5 combo points, then Cold Blood and Eviscerate. No positioning to worry about.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v232232310001-32003321201515231_t0/1B0BA1AffEhfGjmnnnnpqqqqRs0F1sst0ddgdEcmc1qnj',
    stats: questingStats,
    gear: levelingGearFor('combat', 'questing'),
    rotation: withRiposte(levelingSinisterStrikeRotation, 'Sinister Strike'),
  },
  {
    id: 'dungeons',
    spec: 'combat',
    phase: 'leveling',
    activity: 'dungeons',
    name: 'Dungeons',
    grade: 'S',
    rank: 1,
    stale: true,
    talents: points(16, 33, 2),
    talentNote:
      'Combat for groups with a Backstab twist: Blade Flurry cleaves your damage onto a second target while Adrenaline Rush boosts the rest. Keep Slice and Dice up, Backstab from behind to 5 combo points, then Cold Blood and Eviscerate. Needs a dagger in the main hand. Keep Sinister Strike on your bar for when you can\'t attack from behind.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200532310101-32030320201515231-002_t0/2C1BADFGJmnnnnpqqqqRStnq0CFEgDjm',
    stats: dungeonsStats,
    gear: levelingGearFor('combat', 'dungeons'),
    rotation: levelingBackstabRotation,
  },
];
