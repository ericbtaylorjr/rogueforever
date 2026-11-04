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
    { press: 'Eviscerate', note: 'With 4 or 5 combo points.' },
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
    grade: 'X',
    rank: 1,
    stale: true,
    talents: points(0, 0, 0),
    talentNote:
      'Mutilate and poisons do the work: fast combo points from Mutilate while your poisons tick on everything you hit, finished with Eviscerate, with Blade Flurry on cooldown. Keep Slice and Dice up, Mutilate to 4 or more combo points, then Eviscerate (Cold Blood first at 5). Needs a dagger in both hands.',
    keyTalents: [],
    link: BLANK_TALENTS,
    stats: noStats,
    gear: levelingGearFor('assassination', 'questing'),
    rotation: noRotation,
  },
  {
    id: 'dungeons',
    spec: 'assassination',
    phase: 'leveling',
    activity: 'dungeons',
    name: 'Dungeons',
    grade: 'X',
    rank: 1,
    stale: true,
    talents: points(0, 0, 0),
    talentNote:
      'Mutilate and poisons do the work: fast combo points from Mutilate while your poisons tick on everything you hit, finished with Eviscerate, with Blade Flurry on cooldown. Keep Slice and Dice up, Mutilate to 4 or more combo points, then Eviscerate (Cold Blood first at 5). Needs a dagger in both hands.',
    keyTalents: [],
    link: BLANK_TALENTS,
    stats: noStats,
    gear: levelingGearFor('assassination', 'dungeons'),
    rotation: noRotation,
  },
];
