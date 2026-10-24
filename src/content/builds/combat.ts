import { levelingShared, levelingSlowWeapons } from '../gear';
import type { Build, Rotation, StatPriority } from '../types';
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

/**
 * The WoWSims Rogue APL as the "Combat SS" preset runs it (Use Backstab off, sword main
 * hand). Regenerate the source rows with `npm run apl -- combat/sinister-strike`.
 */
const sinisterStrikeRotation: Rotation = {
  apl: [
    {
      name: 'Garrote',
      cond: 'While stealthed (the pull and right after Vanish) with under 5 combo points and Garrote not already ticking. You need to be behind the target.',
    },
    {
      name: 'Vanish',
      cond: 'Garrote has worn off, you have the energy for a new one, you are under 5 combo points and Slice and Dice has more than 2s left. Garrote straight after.',
      sweaty: true,
    },
    {
      name: 'Trinkets',
      cond: 'On cooldown. Trolls use Berserking on cooldown too.',
    },
    {
      name: 'Adrenaline Rush',
      cond: "On cooldown once Slice and Dice is up. Night Elves hold it until Elune's Light is also ready.",
    },
    {
      name: 'Racial cooldown',
      cond: "Orc: Blood Fury right after Adrenaline Rush, or on cooldown while Adrenaline Rush is 1.9 min or more away. Night Elf: Elune's Light right before Adrenaline Rush, or on cooldown while it is 1.9 min or more away. Gnome: pool to 90 energy, then Eureka! during Adrenaline Rush or whenever Adrenaline Rush is further away than Eureka!'s cooldown.",
    },
    {
      name: 'Potion',
      cond: 'While Blade Flurry is up, which means right at the pull.',
    },
    {
      name: 'Thistle Tea',
      cond: 'At 15 energy or less with under 3 combo points. Gnomes during Eureka!: at 25 energy or less, at any combo points.',
    },
    {
      name: 'Blade Flurry',
      cond: 'On cooldown, unless Slice and Dice has 2s or less left.',
    },
    {
      name: 'Slice and Dice',
      cond: 'Only once it has fallen off, at any number of combo points. Skip it in the last 6s of the fight.',
    },
    {
      name: 'Cold Blood',
      cond: "At 5 combo points with Slice and Dice above 2s, right before Eviscerate. Night Elves skip it during Elune's Light.",
    },
    {
      name: 'Eviscerate',
      cond: 'At 5 combo points. Also at 4 when Slice and Dice has 2 to 6s left, and at 3 or more in the last 6s of the fight.',
    },
    {
      name: 'Sinister Strike',
      cond: 'Under 5 combo points. In the last 2s of Slice and Dice, only at 0 combo points or 75+ energy, so you have the energy to reapply it. Gnomes hold it while pooling for Eureka!.',
    },
  ],
  opener: [
    'Sprint (-3s)',
    'Blade Flurry (-2s)',
    'Stealth (-1s)',
    'Garrote',
    'Potion',
    'Slice and Dice',
    'Adrenaline Rush',
    'Sinister Strike to 5',
    'Cold Blood',
    'Eviscerate',
  ],
  nevers: [
    'Refreshing Slice and Dice early. Let it fall off, then reapply it straight away.',
    'Building in the last 2s of Slice and Dice under 75 energy. Pool for the refresh instead.',
    'Using Adrenaline Rush without Slice and Dice up.',
    'Eviscerating under 5 combo points outside the Slice and Dice and end of fight windows.',
    'Using Rupture. This build never casts it.',
    'Drinking Thistle Tea above 15 energy or at 3+ combo points.',
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
    rotation: noRotation,
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
    rotation: noRotation,
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
    rotation: noRotation,
  },
];
