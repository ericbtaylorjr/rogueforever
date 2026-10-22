import { levelingDaggers, levelingShared } from '../gear';
import type { Build, StatPriority } from '../types';
import { byLevel, noEndgameGear, noRotation, points } from './shared';

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
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200532310151501031-302303202014_t0_r95/0CDffgfEjmnnnnqnkkkskksst1AccFDGJmnnnn',
    stats,
    gear: noEndgameGear,
    rotation: noRotation,
  },
  {
    id: 'questing',
    spec: 'assassination',
    phase: 'leveling',
    activity: 'questing',
    name: 'Questing',
    grade: 'X',
    rank: 1,
    talents: [],
    talentNote:
      'Built entirely around Mutilate and your poisons. Every fight runs on Mutilate for fast combo points while poisons tick on everything you hit. Straightforward, hard-hitting, and at its best when you keep your poisons topped up.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v202532210001401_t0_l30/0BcccDgccffEmnnnnq',
    stats,
    gear: levelingGear,
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
    talents: [],
    talentNote: '',
    keyTalents: [],
    stats,
    gear: levelingGear,
    rotation: noRotation,
  },
];
