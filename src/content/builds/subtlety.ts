import { levelingDaggers, levelingShared, levelingSlowWeapons } from '../gear';
import type { Build, StatPriority } from '../types';
import { byLevel, noEndgameGear, noRotation, points } from './shared';

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
    rotation: noRotation,
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
    rotation: noRotation,
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
    rotation: noRotation,
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
    rotation: noRotation,
  },
];
