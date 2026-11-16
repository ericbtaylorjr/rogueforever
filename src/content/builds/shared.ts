import type { GearAlternative, GearItem, GearSetId, ProTip, Rotation, RotationStep, StatPriority, TalentTree } from '../types';

/** Talent point split, Assassination / Combat / Subtlety, in each tree's colour. */
export const points = (assassination: number, combat: number, subtlety: number): TalentTree[] => [
  { name: 'Assassination', pts: assassination, color: '#7BE06B' },
  { name: 'Combat', pts: combat, color: '#FF6B5E' },
  { name: 'Subtlety', pts: subtlety, color: '#B98BFF' },
];

/**
 * The calculator with nothing spent: every build starts here until its talents are worked out
 * (after the Nov 2 rework). Paste the build's own link over it; `npm run talents -- --fix` then
 * fills `points(a, c, s)`.
 */
export const BLANK_TALENTS = 'https://www.wowhead.com/forever/talent-calc/rogue';

/** Stat weights that haven't been worked out yet: the Stats card says so. */
export const noStats: StatPriority = { relativeTo: 'Attack Power', stats: [] };

/** A rotation that hasn't been written yet. */
export const noRotation: Rotation = { opener: [], steps: [], tips: [] };

/**
 * Rotation lines every build shares, worded once so a row of the WoWSims APL reads the
 * same in every build that can fire it. Regenerate a build's rows with `npm run apl -- <spec>/<id>`.
 */
/** Shank, on cooldown whenever energy is 80 or less (Boot Knife builds also need 3 combo points or fewer). */
export const shankStep: RotationStep = {
  press: 'Shank',
  note: "On cooldown, whenever you're at 80 energy or less.",
};

export const sliceAndDiceStep: RotationStep = {
  press: 'Slice and Dice',
  note: "Only once it has fallen off, with however many combo points you have. Don't refresh it early.",
};

export const tip = {
  meleeUptime: {
    text: 'Melee uptime is very important. Start attacking the moment the tank engages, and stay in melee range as much as possible.',
  },
  adrenalineRush: { text: 'Adrenaline Rush on cooldown, as long as Slice and Dice is up.' },
  /** Pre-rework APL wording: only the leveling builds still use it, until they are redone. */
  bladeFlurry: { text: 'Blade Flurry on cooldown, unless Slice and Dice has 2s or less left.' },
  premeditation: { text: 'Premeditation on cooldown, while you have 3 combo points or fewer.' },
  trinkets: { text: 'Trinkets on cooldown, once Slice and Dice is up. Trolls use Berserking on cooldown too.' },
  thistleTea: { text: 'Thistle Tea at 15 energy or less, while you have under 3 combo points.' },
  /** Pre-rework APL wording: only the leveling builds still use it, until they are redone. */
  pool: (builder: string): ProTip => ({
    text: `Pool energy in the last 2s of Slice and Dice. Only ${builder} at 0 combo points or 75+ energy, so you can reapply it the moment it falls off.`,
  }),
  vanishGarrote: {
    text: 'Consider fitting in a Vanish into Garrote right after the opener. It lets you be aggressive with your damage and resets your threat. Garrote needs you behind the target.',
    sweaty: true,
  },
  /** The shorter Vanish tip: Assassination Mutilate and Combat Backstab. */
  vanishGarroteWhenReady: {
    text: 'Cast Vanish into Garrote whenever Vanish comes back off cooldown and you have enough energy for the Garrote.',
    sweaty: true,
  },
  earlyEviscerate: {
    text: 'At 4 combo points with 6s or less of Slice and Dice left, Eviscerate early.',
    sweaty: true,
  },
  fightEnd: (letGo = 'Slice and Dice'): ProTip => ({
    text: `In the last 6s of the fight, Eviscerate at 3+ combo points and let ${letGo} go.`,
    sweaty: true,
  }),
} satisfies Record<string, ProTip | ((...args: never[]) => ProTip)>;

/**
 * One tip per race with a DPS racial. The APL times them around Adrenaline Rush, so builds
 * without it just use them on cooldown. Night Elves hold Cold Blood while Elune's Light is up.
 */
export const racialTips = ({
  adrenalineRush,
  coldBlood = true,
  bladeFlurry = true,
}: {
  adrenalineRush: boolean;
  coldBlood?: boolean;
  /** The build has Blade Flurry: the APL pairs Blood Fury with it. */
  bladeFlurry?: boolean;
}): ProTip[] => {
  const orcs: ProTip = {
    text: bladeFlurry
      ? 'Orcs: Blood Fury while Blade Flurry is up, and Blood Fury then Blade Flurry whenever Blade Flurry is ready.'
      : 'Orcs: Blood Fury on cooldown.',
  };
  return adrenalineRush
    ? [
        orcs,
        {
          text: "Night Elves: Elune's Light, then Adrenaline Rush, holding Adrenaline Rush until both are ready. Use Elune's Light on its own when Adrenaline Rush is 1.9 min or more away, and save Cold Blood until Elune's Light ends.",
        },
        {
          text: "Gnomes: pool to 90 energy, then Eureka! during Adrenaline Rush or whenever Adrenaline Rush is further away than Eureka!'s cooldown. During Eureka!, Thistle Tea at 25 energy or less.",
        },
      ]
    : [
        orcs,
        {
          text: coldBlood
            ? "Night Elves: Elune's Light on cooldown, and save Cold Blood until Elune's Light ends."
            : "Night Elves: Elune's Light on cooldown.",
        },
        {
          text: 'Gnomes: pool to 90 energy, then Eureka! on cooldown. During Eureka!, Thistle Tea at 25 energy or less.',
        },
      ];
};

/**
 * Adds the Riposte tip to a build that takes the Riposte talent (Combat tree, row 3): macro it with
 * the build's builder so it fires whenever it's available after a parry. It sits before the pooling tip.
 * The APL doesn't cast Riposte, so this is a talent tip, not a rotation row.
 */
export const withRiposte = (rotation: Rotation, builder: string): Rotation => {
  const riposte: ProTip = { text: `Macro Riposte with ${builder} so it fires whenever it's available after a parry.` };
  const at = rotation.tips.findIndex((t) => t.text.startsWith('Pool energy'));
  const index = at < 0 ? rotation.tips.length : at;
  return { ...rotation, tips: [...rotation.tips.slice(0, index), riposte, ...rotation.tips.slice(index)] };
};

/**
 * A leveling build's version of an endgame-style rotation: no opener at all, no
 * racial or Thistle Tea tips, the offensive Vanish tip swapped for a defensive one, and the trinket and
 * cooldown tips folded into one line about pairing them (and your racial) on a powerful mob or big pull.
 * `cooldowns` names the cooldown tips it replaces, in the order the rotation lists them (e.g. Adrenaline
 * Rush, Blade Flurry).
 */
export const forLeveling = (rotation: Rotation, cooldowns: string[]): Rotation => {
  const folded = new Set<ProTip>([tip.adrenalineRush, tip.bladeFlurry, tip.trinkets]);
  const isVanish = (t: ProTip) => /Vanish into (Garrote|Ambush)/.test(t.text);
  const defensive: ProTip = { text: 'Use Vanish and Evasion as defensive abilities if threat becomes an issue.' };
  const isRacial = (t: ProTip) => /^(Orcs|Night Elves|Gnomes):/.test(t.text);
  const firstFolded = rotation.tips.findIndex((t) => folded.has(t));
  const list = cooldowns.length > 1 ? `${cooldowns.slice(0, -1).join(', ')} and ${cooldowns.at(-1)}` : cooldowns[0];
  const paired: ProTip = { text: `Pair your trinkets and racial with ${list} on a powerful mob or big pull.` };
  return {
    ...rotation,
    opener: [],
    tips: rotation.tips.flatMap((t, i) =>
      i === firstFolded
        ? [paired]
        : isVanish(t)
          ? [defensive]
          : folded.has(t) || isRacial(t) || t === tip.thistleTea
            ? []
            : [t],
    ),
  };
};

/**
 * Level 60 gear that hasn't been listed yet. Blizzard has confirmed a full
 * itemization pass for Forever, so Classic Era BiS lists would be wrong at launch.
 */
export const noEndgameGear: Record<GearSetId, GearItem[]> = { prebis: [], bis: [] };

type Piece = Omit<GearItem, 'slot'>;

/**
 * Pre-raid BiS: the slots every end game build shares, plus what differs per build (trinkets, leg
 * enchant, weapons). One WoWSims gear export per build; see the update-endgame-gear skill.
 * Precisely Calibrated Boomstick, Teebu's Blazing Longsword and Flurry Axe have no source in the Forever database; they're BoE drops.
 */
/** Ranged alternative for every build. Zevrim Thornhoof is in Dire Maul, which isn't in at launch yet. */
const satyrsBow: GearAlternative = {
  itemId: 18323,
  name: "Satyr's Bow",
  quality: 'rare',
  source: 'Zevrim Thornhoof (Dire Maul)',
};

const preRaidShared: Record<string, GearItem> = {
  head: { slot: 'Head', itemId: 226829, name: 'Darkmantle Cap', quality: 'epic', source: 'Vendor (Ironforge / Orgrimmar)', enchant: '+8 Agility', enchantSpellId: 15401 },
  neck: { slot: 'Neck', itemId: 15411, name: 'Mark of Fordring', quality: 'rare', source: 'Quest: In Dreams', sourceLinks: [{ text: 'In Dreams', href: 'https://www.wowhead.com/forever/quest=5944' }], enchant: '+5 Agility', enchantSpellId: 13365 },
  shoulders: { slot: 'Shoulders', itemId: 15058, name: 'Stormshroud Shoulders', quality: 'rare', source: 'Elemental Leatherworking (BoE)' },
  back: { slot: 'Back', itemId: 272414, name: "Howler's Furs", quality: 'rare', source: 'Tarnished Undermine Reals', sourceLinks: [{ text: 'Tarnished Undermine Reals', href: 'https://www.wowhead.com/forever/currency=3469/tarnished-undermine-real', wowhead: { kind: 'currency', id: 3469 } }], enchant: '+5 Agility', enchantSpellId: 1219587 },
  chest: { slot: 'Chest', itemId: 226825, name: 'Darkmantle Tunic', quality: 'epic', source: 'Vendor (Ironforge / Orgrimmar)', enchant: 'Greater Stats', enchantSpellId: 19988 },
  wrists: { slot: 'Wrists', itemId: 226830, name: 'Darkmantle Bracers', quality: 'rare', source: 'Vendor (Ironforge / Orgrimmar)', enchant: '+9 Agility', enchantSpellId: 1248599 },
  hands: { slot: 'Hands', itemId: 21278, name: 'Stormshroud Gloves', quality: 'rare', source: 'Elemental Leatherworking (BoE)', enchant: '+10 Agility', enchantSpellId: 20012 },
  waist: { slot: 'Waist', itemId: 272395, name: "Assassin's Waistguard", quality: 'epic', source: 'Tarnished Undermine Reals', sourceLinks: [{ text: 'Tarnished Undermine Reals', href: 'https://www.wowhead.com/forever/currency=3469/tarnished-undermine-real', wowhead: { kind: 'currency', id: 3469 } }] },
  feet: { slot: 'Feet', itemId: 226831, name: 'Darkmantle Footpads', quality: 'epic', source: 'Vendor (Ironforge / Orgrimmar)', enchant: 'Minor Speed', enchantSpellId: 13889 },
  ring1: { slot: 'Ring 1', itemId: 19325, name: "Don Julio's Band", quality: 'epic', source: 'Alterac Valley exalted reputation' },
  ring2: { slot: 'Ring 2', itemId: 272408, name: "Cutthroat's Signet", quality: 'rare', source: 'Tarnished Undermine Reals', sourceLinks: [{ text: 'Tarnished Undermine Reals', href: 'https://www.wowhead.com/forever/currency=3469/tarnished-undermine-real', wowhead: { kind: 'currency', id: 3469 } }] },
  ranged: { slot: 'Ranged', itemId: 2100, name: 'Precisely Calibrated Boomstick', quality: 'epic', source: 'BoE Drop', alternatives: [satyrsBow] },
};

const stormshroudPants: Piece = { itemId: 15057, name: 'Stormshroud Pants', quality: 'rare', source: 'Elemental Leatherworking (BoE)' };
/** The leg enchants the builds use (none is also an option). */
const legEnchant = {
  none: {},
  agility: { enchant: '+8 Agility', enchantSpellId: 15401 },
  rapidity: { enchant: 'Rapidity', enchantSpellId: 22841 },
} as const;

export const trinkets = {
  handOfJustice: { itemId: 11815, name: 'Hand of Justice', quality: 'rare', source: 'Emperor Dagran Thaurissan (Blackrock Depths)' },
  heartOfWyrmthalak: { itemId: 22321, name: 'Heart of Wyrmthalak', quality: 'rare', source: 'Overlord Wyrmthalak (Blackrock Spire)' },
  blackhandsBreadth: { itemId: 13965, name: "Blackhand's Breadth", quality: 'rare', source: "Quest: General Drakkisath's Demise / For The Horde!", sourceLinks: [{ text: "General Drakkisath's Demise", href: 'https://www.wowhead.com/forever/quest=5102' }, { text: 'For The Horde!', href: 'https://www.wowhead.com/forever/quest=4974' }] },
} as const satisfies Record<string, Piece>;

/** The Trinket 2 alternative every end game build lists: no Blackhand's Breadth or Hand of Justice to chase. */
const highborneResearchTablet: GearAlternative = {
  itemId: 260205,
  name: 'Highborne Research Tablet',
  quality: 'uncommon',
  source: 'Quest: Your Final Reward',
  sourceLinks: [{ text: 'Your Final Reward', href: 'https://www.wowhead.com/forever/quest=89053/your-final-reward' }],
  faction: 'Alliance',
  note: 'Equivalent, or even slightly better.',
};

const crusader = { enchant: 'Crusader', enchantSpellId: 20007 };
const agilityWeapon = { enchant: '+15 Agility', enchantSpellId: 23794 };

export const weapons = {
  felstriker: { itemId: 12590, name: 'Felstriker', quality: 'epic', source: 'Warchief Rend Blackhand (Blackrock Spire)' },
  distractingDagger: { itemId: 18392, name: 'Distracting Dagger', quality: 'rare', source: 'Prince Tortheldrin (Dire Maul)' },
  teebus: { itemId: 1728, name: "Teebu's Blazing Longsword", quality: 'epic', source: 'BoE Drop' },
  flurryAxe: { itemId: 871, name: 'Flurry Axe', quality: 'epic', source: 'BoE Drop' },
} as const satisfies Record<string, Piece>;

/** A main hand or off hand with its enchant: Crusader or the +15 Agility weapon enchant. */
const weaponWith = (slot: 'Main hand' | 'Off hand', item: Piece, enchant: 'crusader' | 'agility'): GearItem => ({
  slot,
  ...item,
  ...(enchant === 'crusader' ? crusader : agilityWeapon),
});

interface PreRaid {
  /** Trinket 2. Trinket 1 is always Heart of Wyrmthalak. */
  trinket: Piece;
  legs: keyof typeof legEnchant;
  mainHand: [Piece, 'crusader' | 'agility'];
  offHand: [Piece, 'crusader' | 'agility'];
}

/** Pre-raid BiS for one build (Best in Slot isn't listed yet). */
export const preRaidGear = (b: PreRaid): Record<GearSetId, GearItem[]> => {
  const p = preRaidShared;
  return {
    prebis: [
      p.head, p.neck, p.shoulders, p.back, p.chest, p.wrists, p.hands, p.waist,
      { slot: 'Legs', ...stormshroudPants, ...legEnchant[b.legs] },
      p.feet, p.ring1, p.ring2,
      { slot: 'Trinket 1', ...trinkets.heartOfWyrmthalak },
      { slot: 'Trinket 2', ...b.trinket, alternatives: [highborneResearchTablet] },
      weaponWith('Main hand', ...b.mainHand),
      weaponWith('Off hand', ...b.offHand),
      p.ranged,
    ],
    bis: [],
  };
};
