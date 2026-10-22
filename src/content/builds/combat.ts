import { levelingShared, levelingSlowWeapons } from '../gear';
import type { Build, StatPriority } from '../types';
import { byLevel, noEndgameGear, noRotation, points } from './shared';

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

export const combat: Build[] = [
  {
    id: 'mutilate',
    spec: 'combat',
    phase: 'endgame',
    name: 'Mutilate',
    grade: 'A',
    rank: 3,
    talents: points(21, 28, 0),
    talentNote:
      'A variation of the Assassination Mutilate build. It drops Venom in favor of leaning further into Combat talents.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200532310101401-302303202015142_t0_r95/0CDffgfEjmnnnnq1AccFDGJmnnnnpqqqqRn',
    stats,
    gear: noEndgameGear,
    rotation: noRotation,
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
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v2005323101012-32030320201515231_t0_r95/1BAFDGJmNpqqqRqqstss0CDffgfEjmnn',
    stats,
    gear: noEndgameGear,
    rotation: noRotation,
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
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v2005322103-32030320201515231-002_t0_r95/2C1ABFDGJmnnnnpqqqqRqnstss0CDffgEjjj',
    stats,
    gear: noEndgameGear,
    rotation: noRotation,
  },
  {
    id: 'questing',
    spec: 'combat',
    phase: 'leveling',
    activity: 'questing',
    name: 'Questing',
    grade: 'X',
    rank: 2,
    talents: [],
    talentNote:
      'Traditional Combat, centered on cleaving with Blade Flurry. Pull two or three mobs, turn on Blade Flurry and take them down together with the familiar Sinister Strike, Slice and Dice and Eviscerate loop. No positioning to worry about.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v2-3200332110141_t0_l30/1EhGjmnnnnp',
    stats,
    gear: levelingGear,
    rotation: noRotation,
  },
  {
    id: 'dungeons',
    spec: 'combat',
    phase: 'leveling',
    activity: 'dungeons',
    name: 'Dungeons',
    grade: 'X',
    rank: 2,
    talents: [],
    talentNote: '',
    keyTalents: [],
    stats,
    gear: levelingGear,
    rotation: noRotation,
  },
];
