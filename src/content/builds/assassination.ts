import { levelingDaggers, levelingShared } from '../gear';
import type { Build, Rotation, StatPriority } from '../types';
import { mutilateRotation } from './combat';
import { byLevel, noEndgameGear, points, racialTips, sliceAndDiceStep, tip } from './shared';

/** WoWSims EP against current BiS gear. EP is relative to `relativeTo` (= 1). */
const stats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Expertise Rating', ep: 2.78 },
    { stat: 'Hit Rating', ep: 2.73, op: '>' },
    { stat: 'Agility', ep: 2.08, op: '>' },
    { stat: 'Crit Rating', ep: 2.03, op: '>' },
    { stat: 'Haste Rating', ep: 1.95, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1, op: '>' },
    { stat: 'Spell Piercing', ep: 0.65, op: '>' },
    { stat: 'Armor Penetration', ep: 0.4, op: '>' },
    { stat: 'Stamina', ep: 0, op: '>' },
  ],
};

const levelingGear = byLevel(levelingShared, levelingDaggers);

/**
 * The WoWSims Rogue APL as the "Asn Muti" preset runs it (daggers in both hands):
 * `npm run apl -- assassination/mutilate-venom`. Mutilate adds 2 combo points, so the APL
 * Eviscerates at 4 and Cold Blood only fires at 5. Venom goes up at 3+ combo points.
 */
const mutilateVenomRotation: Rotation = {
  opener: [
    'Evasion + Major Frenzy Potion + Trinket + Racial (-1s)',
    'Mutilate',
    'Slice and Dice',
    'Mutilate to 3CP',
    'Venom',
    'Mutilate to 4CP',
    'Eviscerate',
  ],
  steps: [
    sliceAndDiceStep,
    { press: 'Venom', note: 'Once it has fallen off, with 3 or more combo points.' },
    { press: 'Mutilate', note: 'Until you have 4 or more combo points. Needs a dagger in both hands.' },
    { press: 'Cold Blood', note: "If it's off cooldown and you have 5 combo points." },
    { press: 'Eviscerate', note: 'With 4 or 5 combo points.' },
  ],
  tips: [
    tip.meleeUptime,
    tip.trinkets,
    ...racialTips({ adrenalineRush: false }),
    tip.thistleTea,
    tip.pool('Mutilate'),
    tip.vanishGarrote,
    tip.fightEnd(),
  ],
};

export const assassination: Build[] = [
  {
    id: 'mutilate-venom',
    spec: 'assassination',
    phase: 'endgame',
    name: 'Mutilate Venom',
    grade: 'C',
    rank: 6,
    talents: points(31, 20, 0),
    talentNote:
      'This build revolves around keeping the Venom buff up at all times and using Mutilate as your main builder, with an emphasis on poison damage.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200532310131501051-302303202014_t5/0CDEFgjnnnnq1AccDF0kkkmnSt1GJmnnnn',
    stats,
    gear: noEndgameGear,
    rotation: mutilateVenomRotation,
  },
  {
    id: 'questing',
    spec: 'assassination',
    phase: 'leveling',
    activity: 'questing',
    name: 'Questing',
    grade: 'A',
    rank: 2,
    talents: points(22, 27, 2),
    talentNote:
      'Built entirely around Mutilate and your poisons. Every fight runs on Mutilate for fast combo points while poisons tick on everything you hit. Straightforward, hard-hitting, and at its best when you keep your poisons topped up.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v202532310001401-302333010014142-002_t5/1A0BcccDFgEcmcnnnq2C1ccEffhfDmnnnnpqqqqR0n',
    stats,
    gear: levelingGear,
    rotation: mutilateRotation,
  },
  {
    id: 'dungeons',
    spec: 'assassination',
    phase: 'leveling',
    activity: 'dungeons',
    name: 'Dungeons',
    grade: 'A',
    rank: 2,
    talents: points(21, 28, 2),
    talentNote: '',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200532310101401-302333010014152-002_t5/0CDffgfEjmnnnnq2C1AccDEhFmnnnnpqqqqRq',
    stats,
    gear: levelingGear,
    rotation: mutilateRotation,
  },
];
