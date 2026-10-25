import { levelingShared, levelingSlowWeapons } from '../gear';
import type { Build, Rotation, StatPriority } from '../types';
import { byLevel, noEndgameGear, points, racialTips, sliceAndDiceStep, tip } from './shared';

/** WoWSims EP against current BiS gear. EP is relative to `relativeTo` (= 1). */
const stats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.43 },
    { stat: 'Expertise Rating', ep: 2.28, op: '>' },
    { stat: 'Agility', ep: 1.95, op: '>' },
    { stat: 'Haste Rating', ep: 1.73, op: '>' },
    { stat: 'Crit Rating', ep: 1.68, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1, op: '>' },
    { stat: 'Armor Penetration', ep: 0.43, op: '>' },
    { stat: 'Spell Piercing', ep: 0.21, op: '>' },
    { stat: 'Stamina', ep: 0, op: '>' },
  ],
};

const levelingGear = byLevel(levelingShared, levelingSlowWeapons);

/**
 * The WoWSims Rogue APL as the "Combat SS" preset runs it (Use Backstab off, sword main
 * hand). Regenerate the source rows with `npm run apl -- combat/sinister-strike`.
 * The opener, the melee uptime tip and the Vanish tip's wording are hand-edited.
 * Combat Questing and Dungeons resolve to the same rows, so they share it.
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

/** "Combat BS" (Use Backstab on, dagger main hand): `npm run apl -- combat/backstab`. */
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

export const combat: Build[] = [
  {
    id: 'mutilate',
    spec: 'combat',
    phase: 'endgame',
    name: 'Mutilate',
    grade: 'A',
    rank: 3,
    talents: points(21, 29, 1),
    talentNote:
      'A variation of the Assassination Mutilate build. It drops Venom in favor of leaning further into Combat talents.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200532310101401-320303202015152-001_t5/0CDEFgjm1ABDFGJmNQpR0nn2c0nnq',
    stats,
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
    talents: points(18, 33, 0),
    talentNote:
      'The traditional Classic Rogue Combat build: Sinister Strike as your builder and Eviscerate as your spender.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v2005323101012-32030320201515231_t5/0CDEFgjm1ABDFGJmNQpRSt0nn',
    stats,
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
    talents: points(16, 33, 2),
    talentNote:
      'A Backstab variant of the Sinister Strike build. It swaps to a dagger in the main hand and uses Backstab as the builder.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200532310101-32030320201515231-002_t5/0CDe2C0eFgjm1ABDFGJmNQpRSt',
    stats,
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
    talents: points(17, 34, 0),
    talentNote:
      'Traditional Combat, centered on cleaving with Blade Flurry. Pull two or three mobs, turn on Blade Flurry and take them down together with the familiar Sinister Strike, Slice and Dice and Eviscerate loop. No positioning to worry about.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v232232310001-32003321201515231_t0/1B0BA1AffEhfGjmnnnnpqqqqRs0F1sst0ddgdEcmc1qnj',
    stats,
    gear: levelingGear,
    rotation: sinisterStrikeRotation,
  },
  {
    id: 'dungeons',
    spec: 'combat',
    phase: 'leveling',
    activity: 'dungeons',
    name: 'Dungeons',
    grade: 'S',
    rank: 1,
    talents: points(18, 33, 0),
    talentNote: '',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200532310301-32003321101515231_t0/1BAEffhfGjmnnnnpQRsstsn0CFEgDjmjj',
    stats,
    gear: levelingGear,
    rotation: sinisterStrikeRotation,
  },
];
