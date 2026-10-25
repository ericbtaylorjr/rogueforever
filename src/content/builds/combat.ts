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
  opener: [
    'Blade Flurry + Evasion + Major Frenzy Potion + Trinket + Racial (-1s)',
    'Sinister Strike',
    'Slice and Dice',
    'Adrenaline Rush',
    'Sinister Strike to 5CP',
    'Cold Blood + Eviscerate',
  ],
  steps: [
    {
      press: 'Slice and Dice',
      note: "Only once it has fallen off, with however many combo points you have. Don't refresh it early.",
    },
    { press: 'Sinister Strike', note: 'Until you have 5 combo points.' },
    { press: 'Cold Blood', note: "If it's off cooldown." },
    { press: 'Eviscerate', note: 'With all 5 combo points.' },
  ],
  tips: [
    {
      text: 'Melee uptime is very important. Start attacking the moment the tank engages, and stay in melee range as much as possible.',
    },
    { text: 'Adrenaline Rush on cooldown, as long as Slice and Dice is up.' },
    { text: 'Blade Flurry on cooldown, unless Slice and Dice has 2s or less left.' },
    { text: 'Trinkets on cooldown. Trolls use Berserking on cooldown too.' },
    { text: 'Orcs: Blood Fury right after Adrenaline Rush, or on its own when Adrenaline Rush is 1.9 min or more away.' },
    {
      text: "Night Elves: Elune's Light, then Adrenaline Rush, holding Adrenaline Rush until both are ready. Use Elune's Light on its own when Adrenaline Rush is 1.9 min or more away, and save Cold Blood until Elune's Light ends.",
    },
    {
      text: "Gnomes: pool to 90 energy, then Eureka! during Adrenaline Rush or whenever Adrenaline Rush is further away than Eureka!'s cooldown. During Eureka!, Thistle Tea at 25 energy or less.",
    },
    { text: 'Thistle Tea at 15 energy or less, while you have under 3 combo points.' },
    {
      text: 'Pool energy in the last 2s of Slice and Dice. Only Sinister Strike at 0 combo points or 75+ energy, so you can reapply it the moment it falls off.',
    },
    {
      text: 'Consider fitting in a Vanish into Garrote right after the opener. It lets you be aggressive with your damage and resets your threat. Garrote needs you behind the target.',
      sweaty: true,
    },
    { text: 'At 4 combo points with 2 to 6s of Slice and Dice left, Eviscerate early.', sweaty: true },
    { text: 'In the last 6s of the fight, Eviscerate at 3+ combo points and let Slice and Dice go.', sweaty: true },
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
