import { levelingGearFor } from '../gear';
import type { Build, ProTip, Rotation, StatPriority } from '../types';
import { BLANK_TALENTS, noEndgameGear, noRotation, noStats, points, racialTips, sliceAndDiceStep, tip } from './shared';

/** Subtlety Hemo (slow main hand) weights from its own WoWSims run. */
const hemoStats: StatPriority = {
  relativeTo: 'Attack Power',
  stats: [
    { stat: 'Hit Rating', ep: 2.47 },
    { stat: 'Expertise Rating', ep: 2.18, op: '>' },
    { stat: 'Agility', ep: 2.07, op: '>' },
    { stat: 'Crit Rating', ep: 1.89, op: '>' },
    { stat: 'Haste Rating', ep: 1.27, op: '>' },
    { stat: 'Strength', ep: 1.1, op: '>' },
    { stat: 'Attack Power', ep: 1.0, op: '>' },
    { stat: 'Armor Penetration', ep: 0.26, op: '>' },
    { stat: 'Spell Piercing', ep: 0.13, op: '>' },
    { stat: 'Stamina', ep: 0.01, op: '>' },
  ],
};

const ruptureStep = { press: 'Rupture', note: "With 3 or more combo points, whenever it isn't on the target." };
/** Death Mark replaces Eviscerate in Hemo's talents, and the APL stops refreshing bleeds and Slice and Dice at the end. */
const hemoFightEnd: ProTip = {
  text: 'In the last 6s of the fight, stop refreshing Slice and Dice and Rupture.',
  sweaty: true,
};

/**
 * "Subtlety Hemo" (slow main hand, Start In Stealth on, Death Mark and Boot Knife talented, Ghostly Strike
 * for Garrote): `npm run apl -- subtlety/hemo`. No Eviscerate or Cold Blood in these talents.
 */
const hemoRotation: Rotation = {
  opener: [
    'Premeditation (-1s)',
    'Slice and Dice',
    'Evasion + Major Frenzy Potion + Trinket + Racial + Vanish + Garrote',
    'Preparation',
    'Premeditation + Death Mark',
    'Shank',
    'Rupture',
    'Hemorrhage to 5CP',
    'Death Mark',
  ],
  steps: [
    { press: 'Garrote', note: "Whenever it isn't on the target. Ghostly Strike beforehand means it needs no Stealth." },
    {
      press: 'Shank',
      note: 'On cooldown, at 3 combo points or fewer and 80 energy or less. Boot Knife adds 2 combo points.',
    },
    { press: 'Death Mark', note: 'With 4 or more combo points.' },
    ruptureStep,
    sliceAndDiceStep,
    { press: 'Ghostly Strike', note: 'When Garrote has 4s or less left, so the next Garrote needs no Stealth.' },
    { press: 'Hemorrhage', note: 'Until you have 5 combo points, while Garrote has 8s or more left.' },
  ],
  tips: [
    tip.meleeUptime,
    tip.premeditation,
    tip.trinkets,
    ...racialTips({ adrenalineRush: false, coldBlood: false, bladeFlurry: false }),
    { text: 'Thistle Tea at 25 energy or less, while Death Mark is up and you have under 3 combo points.' },
    hemoFightEnd,
  ],
};

export const subtlety: Build[] = [
  {
    id: 'hemo',
    spec: 'subtlety',
    phase: 'endgame',
    name: 'Hemo',
    grade: 'A',
    rank: 4,
    talents: points(12, 8, 31),
    talentNote:
      'A Subtlety bleed build: Garrote is kept up (Ghostly Strike makes the next one free of Stealth), Hemorrhage builds combo points, and Shank adds 2 more through Boot Knife. Rupture and Death Mark finish, with Slice and Dice up. Open from Stealth with Premeditation, Garrote, Shank and Death Mark.',
    keyTalents: [],
    link: 'https://www.wowhead.com/forever/talent-calc/rogue/v200530301-320003-305230031321001151_t5',
    stats: hemoStats,
    gear: noEndgameGear,
    rotation: hemoRotation,
  },
  {
    id: 'questing',
    spec: 'subtlety',
    phase: 'leveling',
    activity: 'questing',
    name: 'Questing',
    grade: 'X',
    rank: 1,
    stale: true,
    talents: points(0, 0, 0),
    talentNote:
      'A Subtlety hybrid built around a big Ambush opener. Stealth in, Ambush, and finish most mobs before they can fight back, then reset and move on. Fights that last follow the Hemorrhage loop: Slice and Dice, Rupture at 3+ combo points, Ghostly Strike, Hemorrhage to 5, then Eviscerate. Vanish into Ambush when you want another opener.',
    keyTalents: [],
    link: BLANK_TALENTS,
    stats: noStats,
    gear: levelingGearFor('subtlety', 'questing'),
    rotation: noRotation,
  },
  {
    id: 'dungeons',
    spec: 'subtlety',
    phase: 'leveling',
    activity: 'dungeons',
    name: 'Dungeons',
    grade: 'X',
    rank: 1,
    stale: true,
    talents: points(0, 0, 0),
    talentNote:
      "Burst opener into steady Backstab damage. Stealth in, Ambush, then keep Slice and Dice up, Ghostly Strike on cooldown, Backstab from behind to 5 combo points and Eviscerate. Blade Flurry on cooldown, and Vanish into Ambush when you want another opener. Needs a dagger in the main hand. Keep Sinister Strike on your bar for when you can't attack from behind.",
    keyTalents: [],
    link: BLANK_TALENTS,
    stats: noStats,
    gear: levelingGearFor('subtlety', 'dungeons'),
    rotation: noRotation,
  },
];
