import { levelingGearFor } from '../gear';
import type { Build, Rotation, StatPriority } from '../types';
import { noEndgameGear, points, racialTips, shankStep, sliceAndDiceStep, tip } from './shared';

/** Assassination Mutilate (daggers in both hands) weights from its own WoWSims run. */
const mutilateStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.42 },
    { stat: 'Expertise Rating', ep: 2.3, op: '>' },
    { stat: 'Crit Rating', ep: 2.24, op: '>' },
    { stat: 'Agility', ep: 2.21, op: '>' },
    { stat: 'Haste Rating', ep: 1.22, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '>' },
    { stat: 'Spell Piercing', ep: 0.5, op: '>' },
    { stat: 'Armor Penetration', ep: 0.46, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Assassination Questing weights from its own WoWSims run (the sim lists hit, crit, haste and expertise per 1%; converted at 10, 14, 10 and 10 rating per 1%). */
const questingStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Expertise Rating', ep: 3.39 },
    { stat: 'Agility', ep: 1.61, op: '>' },
    { stat: 'Crit Rating', ep: 1.5, op: '>' },
    { stat: 'Hit Rating', ep: 1.25, op: '>' },
    { stat: 'Strength', ep: 1.0, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '=' },
    { stat: 'Haste Rating', ep: 0.97, op: '>' },
    { stat: 'Spell Piercing', ep: 0.76, op: '>' },
    { stat: 'Armor Penetration', ep: 0.2, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/** Assassination Dungeons weights from its own WoWSims run (hit, crit, haste and expertise converted from per 1% at 10, 14, 10 and 10 rating). */
const dungeonsStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Agility', ep: 1.62 },
    { stat: 'Crit Rating', ep: 1.53, op: '>' },
    { stat: 'Expertise Rating', ep: 1.49, op: '>' },
    { stat: 'Strength', ep: 1.0, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '=' },
    { stat: 'Hit Rating', ep: 0.95, op: '>' },
    { stat: 'Spell Piercing', ep: 0.72, op: '>' },
    { stat: 'Haste Rating', ep: 0.5, op: '>' },
    { stat: 'Armor Penetration', ep: 0.18, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

/**
 * The WoWSims Rogue APL as the "Asn Muti" preset runs it (daggers in both hands):
 * `npm run apl -- assassination/mutilate`. Mutilate adds 2 combo points, so the APL
 * Eviscerates at 4 and Cold Blood only fires at 5. Venom is a Shank effect now, not a finisher.
 * These talents take Flawless Execution, which the APL treats as "no Rupture".
 */
const mutilateRotation: Rotation = {
  opener: [
    'Evasion + Major Frenzy Potion + Trinket + Racial + Mutilate',
    'Slice and Dice',
    'Vanish + Garrote',
    'Shank',
    'Mutilate',
    'Cold Blood + Eviscerate',
  ],
  steps: [
    shankStep,
    sliceAndDiceStep,
    { press: 'Mutilate', note: 'Until you have 4 or more combo points. Needs a dagger in both hands.' },
    { press: 'Cold Blood', note: "If it's off cooldown and you have 5 combo points." },
    { press: 'Eviscerate', note: 'With 4+ combo points.' },
  ],
  tips: [
    tip.meleeUptime,
    tip.trinkets,
    ...racialTips({ adrenalineRush: false, bladeFlurry: false }),
    tip.thistleTea,
    tip.vanishGarroteWhenReady,
    tip.fightEnd(),
  ],
};

/**
 * Assassination leveling (Questing and Dungeons share it), simplified from the APL run with these talents, with no opener
 * (`npm run apl -- assassination/questing`): no Blade Flurry, Adrenaline Rush or Premeditation, and
 * no pooling, Thistle Tea, potion or racial rows.
 */
const levelingMutilateRotation: Rotation = {
  opener: [],
  steps: [
    { press: 'Mutilate', note: 'This is your combo point builder. Needs a dagger in both hands.' },
    { press: 'Shank', note: 'Whenever it is on cooldown and you are under 80 energy.' },
    { press: 'Rupture', note: 'At 3 or more combo points, if the mob will live for 12 seconds.' },
    { press: 'Slice and Dice', note: 'Only once it has fallen off, at any number of combo points. It is generally not worth casting until around the mid level 40s.' },
    { press: 'Cold Blood', note: 'Whenever it is off cooldown, but only at 5 combo points.' },
    { press: 'Eviscerate', note: 'With 4+ combo points.' },
  ],
  tips: [
    tip.meleeUptime,
    { text: 'Pair your trinkets and racial on a powerful mob or big pull.' },
    { text: 'Use Vanish and Evasion as defensive abilities if threat becomes an issue.' },
  ],
};

export const assassination: Build[] = [
  {
    id: 'mutilate',
    spec: 'assassination',
    phase: 'endgame',
    name: 'Mutilate',
    grade: 'S',
    rank: 1,
    talents: points(31, 19, 1),
    talentNote:
      'Poison-focused dagger damage. Mutilate builds combo points two at a time and Shank, your off-hand strike, goes on cooldown below 80 energy with Venom boosting your poisons for 6 seconds. Keep Slice and Dice up, Mutilate to 4 combo points, then Eviscerate (Cold Blood first at 5). Needs a dagger in both hands.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200530311231251031-32030302020103-001_t5',
    stats: mutilateStats,
    gear: noEndgameGear,
    rotation: mutilateRotation,
  },
  {
    id: 'questing',
    spec: 'assassination',
    phase: 'leveling',
    activity: 'questing',
    name: 'Questing',
    grade: 'A',
    rank: 3,
    talents: points(38, 8, 5),
    talentNote:
      'Only useful at level 40 and up, once Mutilate is talented. Poison-focused dagger damage: Mutilate builds your combo points while Shank and Rupture add damage. Keep Slice and Dice up, then Eviscerate at 4+ combo points (Cold Blood first at 5). Needs a dagger in both hands.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v202530321241551031-3023-005_t0_r95/0BcccDffGccjmjnnnqppppSpnt2C1AccD0nhkkkkf',
    stats: questingStats,
    gear: levelingGearFor('assassination', 'questing'),
    rotation: levelingMutilateRotation,
  },
  {
    id: 'dungeons',
    spec: 'assassination',
    phase: 'leveling',
    activity: 'dungeons',
    name: 'Dungeons',
    grade: 'A',
    rank: 3,
    talents: points(37, 9, 5),
    talentNote:
      'Only useful at level 40 and up, once Mutilate is talented. Poison-focused dagger damage: Mutilate builds your combo points while Shank and Rupture add damage. Keep Slice and Dice up, then Eviscerate at 4+ combo points (Cold Blood first at 5). Needs a dagger in both hands.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200530321251551031-302301-005_t0_r95/0CDffGJfmnnnnqppppSpnt2C1AccD0hK1f',
    stats: dungeonsStats,
    gear: levelingGearFor('assassination', 'dungeons'),
    rotation: levelingMutilateRotation,
  },
];
