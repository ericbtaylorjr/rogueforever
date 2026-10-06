import avatarAnhak from '../assets/avatars/anhak.webp';
import avatarBackstabi from '../assets/avatars/backstabi.webp';
import avatarRa from '../assets/avatars/ra.webp';
import { links } from './links';
/**
 * Prose copy, extracted verbatim from the design prototype.
 *
 * content.json is the source of truth for every *data* array, but the hero,
 * section intros, callouts and footer are authored in the prototype's markup.
 * They live here so nothing is hardcoded in JSX — same rule, second file.
 *
 * Tone is deliberate and blunt. Don't neutralise it. See README > Editorial rules.
 */

export const hero = {
  eyebrow: 'A Rogue guide for World of Warcraft: Forever',
  titleTop: 'Rogue',
  titleBottom: 'Handbook',
  disclaimer: {
    label: 'Heads up:',
    before:
      "everything here is based on the level 30 beta. I'll update leveling and endgame as the full game opens up. If something's off, tell me in the ",
    link: 'Rogue Classic Discord',
    after: '.',
  },
  lede: 'The Rogue Handbook is a single, curated page with everything you need to play a Rogue well in WoW Forever: talents, gear, rotation, poisons, consumables and raids. No digging through threads, spreadsheets and old forum posts, just what actually matters, kept current as the game changes.',
  support: {
    before: 'Most of it is sourced from the ',
    link: 'Rogue Classic Discord',
    after:
      " and the WoWSims data the community has built, tested and argued over together. If you have questions, comments or feedback about anything here, ping The Comfy Wizard in the Discord. Corrections are always welcome.",
  },
  ctaPrimary: 'Pick your spec',
  ctaGhost: 'What Forever changes',
  note: {
    title: 'A note from Comfy',
    body: [
      "I'm a long time Rogue player, theorycrafter, and peaked during Rank 1 SoD parsing. When learning, I found it best to write it down and that's where this Handbook was born.",
      "My goal is to take all the data out there and provide it to the Rogue community in a clean, easy to understand format to serve both the diehard and more casual players. See y'all in Azeroth!",
    ],
    sign: 'The Comfy Wizard',
  },
} as const;

export const specBar = {
  label: 'Active spec',
  phoneLabel: 'Guidance for',
  sweatyOn: 'Sweaty tips on',
  sweatyOff: 'Sweaty tips off',
} as const;

/** Spec zone vs. all-Rogue zone framing, plus the scope chips on section headings. */
export const scope = {
  specChipPrefix: 'Spec',
  zone: {
    label: 'Your spec guide',
    before: 'Talents, gear and rotation below are for ',
    after: '. Switch spec and they change with it.',
  },
  allZone: 'Everything from here down is the same for every Rogue.',
} as const;

/** Section headings. Nav labels are shorter — these are the on-page H2s. */
export const headings: Record<string, string> = {
  specs: 'Meta breakdown',
  forever: 'Forever watch',
  talents: 'Talents',
  poisons: 'The poison rack',
  rotation: 'Rotation',
  gear: 'Gear',
  consumables: 'Consumables',
  buffs: 'Buffs & debuffs',
  iea: 'Expose Armor',
  raid: 'Raids',
  pvp: 'PvP',
  tools: 'Tools & UI',
  faq: 'FAQ',
  changelog: 'Changelog',
  credits: 'Credits',
};

export const specBoard = {
  intro:
    "There's no meta yet, and I'd rather show nothing than a guess. Ranking specs honestly needs real data from Forever and WoWSims built for it, and neither exists yet.",
  planned:
    'Once they do, this is where the rankings go: single target and cleave at 60, plus questing and dungeons while leveling.',
  cols: { rank: 'RANK', index: 'INDEX · vs top' },
  tableLabel: 'Damage index by spec',
  pending: {
    heading: 'No Forever sim data yet',
    body: 'The beta opened September 17th and the game launches November 4th. Until sims and logs exist there is nothing honest to rank.',
  },
  yourSpec: 'YOUR SPEC',
  subheadings: { endgame: 'Level 60', leveling: 'Leveling' },
} as const;

export const forever = {
  intro:
    "Only what Blizzard has officially said, from news posts, panel recaps and blue posts, each linked to its source. Anything Blizzard hasn't published is marked as such, and community findings stay out until Blizzard confirms them.",
  impactPrefix: 'What it means for you:',
  sourcesLabel: 'Sources:',
  sourceLink: 'Source ↗',
} as const;

export const talents = {
  /** `{spec}` is replaced with the active spec name. */
  intro: 'Builds for {spec}.',
  buildsLabel: 'Talent build',
  endgameTitle: 'Level 60 builds',
  endgamePending:
    "Not yet. The Forever trees aren't final, though Blizzard says they keep the familiar milestones at 11, 16, 21 and 31 points. I'll post level 60 builds once they've been tested.",
  levelingTitle: 'Leveling build',
  levelingTag: 'Level 30 beta',
  levelingNote:
    'Built for the level 30 beta cap. Any of the three specs levels fine, so play the one you enjoy. Full 1 to 60 builds come after launch.',
  levelingCta: 'View talent build',
  readMore: 'Read more',
  readLess: 'Show less',
  levelingComingSoon: 'Coming soon',
  /** Tree names are confirmed to carry over; the split is what is pending. */
  trees: ['Assassination', 'Combat', 'Subtlety'],
  calculator: 'Open in talent calculator ↗',
} as const;

export const poisonsCopy = {
  intro:
    "Poisons go on each weapon and wear off in charges. Buy the reagents in bulk so you aren't running to a vendor halfway through a dungeon.",
  foreverTitle: 'What changes in Forever',
  forever: [
    {
      before: 'Unified Hit and Crit now cover ',
      strong: 'poisons',
      after: ". In Classic your poisons ignored your melee hit; in Forever the hit on your gear feeds them too.",
    },
    {
      before: 'Poison damage scales with ',
      strong: 'Attack Power',
      after: '. Every spec benefits, Assassination most of all.',
    },
  ],
} as const;

export const rotation = {
  intro:
    "A priority list, top to bottom. If a line's conditions are met, press it and start again from the top.",
  /** `{spec}` is replaced with the active spec name. */
  pending:
    "I haven't written the {spec} priority list, opener or common mistakes yet. They go up once Forever has real logs and WoWSims APLs to check them against.",
  openerTitle: 'Opener',
  neverTitle: 'Never do this',
} as const;

export const gear = {
  status: {
    label: 'Placeholder:',
    text: "these are Classic Era picks and weights standing in for now. Forever reworks dungeon loot, so expect this to change as the beta opens up.",
  },
  cols: { slot: 'SLOT', item: 'ITEM', source: 'SOURCE', enchant: 'ENCHANT' },
  tableLabel: 'Gear by slot',
  empty: 'No item set yet',
  leveling: {
    statsTitle: 'Stat priority',
    statsMeta: 'Weights relative to Agility',
    epLabel: 'EP',
    itemsTitle: 'Leveling milestone gear',
    cols: { level: 'LEVEL', slot: 'SLOT', item: 'ITEM', source: 'SOURCE', faction: 'FACTION' },
    tableLabel: 'Leveling items by level',
    empty: 'No leveling items listed for this spec yet',
  },
  tabs: [
    { id: 'leveling', label: 'Leveling' },
    { id: 'prebis', label: 'Pre-raid BiS' },
    { id: 'bis', label: 'Best in Slot' },
  ],
} as const;

export const consumablesCopy = {
  intro: 'The full bag. Hover anything to see what it does.',
  sweatyNote: {
    strong: 'Droplets',
    after: " mark the sweaty ones, which most players can skip.",
  },
  status: {
    label: 'Placeholder:',
    text: "this is the Classic Era list. Blizzard is reviewing reagents and effects for Forever, so expect additions, removals and rebalances. I'll swap it out once the Forever list is known.",
  },
} as const;

export const buffsCopy = {
  status: {
    label: 'Placeholder:',
    text: "these are Classic Era baselines. Forever's balancing and stacking rules aren't settled, so I'll update this once they are and the sims have run.",
  },
} as const;

export const exposeArmor = {
  p1: {
    before:
      'Expose Armor and Sunder Armor now land on the exact same number, so the debuff is no longer a default Rogue assignment. It comes down to ',
    strong: 'raid comp and who executes it more reliably',
    after: ', not which class happens to own the ability.',
  },
  p2: 'A fully talented 5-point Expose Armor used to beat five stacks of Sunder outright, which is why it defaulted to the Rogue. In Forever the two are tied: the Rogue talent no longer grants extra armor reduction beyond what Sunder already provides. The debuffs still do not stack, so the raid picks whichever player holds it more consistently, or if performance of one outweighs the other.',
  stats: [
    { val: '2,550', label: 'Expose Armor, 5 combo points', icon: 'Expose Armor' },
    { val: '2,550', label: 'Sunder Armor, 5 stacks', icon: 'Sunder Armor' },
  ],
  stepsTitle: 'If it lands on you, the job is the same',
  steps: [
    'Confirm the assignment before the pull. Expose and Sunder do not stack, and with both landing at 2,550 the call comes down to comp and consistency, not class.',
    'Build to 5 combo points and land Expose Armor early. Do not open with it at 2CP because the pull felt rushed.',
    "Track the debuff timer on your own frames, not the raid's. Refresh it before it drops, not after somebody types in chat.",
    'Never let it fall during a movement phase. The raid feels it immediately, even when nobody says anything.',
  ],
  warn: {
    before: 'Expose Armor must ',
    strong: 'only',
    after:
      ' be cast at 5 combo points. A 3CP Expose is a wasted global, wasted CP, and a worse debuff.',
  },
} as const;

export const raidsCopy = {
  intro:
    "The three raids Blizzard has confirmed for Forever so far. Boss lists and Rogue notes aren't out yet, so this only tracks what has actually been said.",
  prepLabel: 'Status:',
} as const;

export const pvpCopy = {
  body: [
    "This isn't a full PvP guide. Plenty of Rogues in the community know PvP far better than I do, and they're the ones worth learning it from.",
    "Over time I'll add the basics here and link out to the more detailed resources and people who really know their stuff.",
  ],
} as const;

export const toolsCopy = {
  macrosTitle: 'Macros worth stealing',
  copy: 'Copy',
  copied: 'Copied',
} as const;

export const comfyUi = {
  preview: {
    open: "View Comfy's UI screenshot",
    title: "Comfy's UI in game",
    alt: "Comfy's UI in game: a Rogue fighting a Vicious Gray Bear in Hillsbrad Foothills, with the EllesmereUI unit frames, action bars, threat and damage meters, and a compact chat and minimap.",
  },
  close: 'Close',
  copyCta: 'Copy Import String',
  copying: 'Loading string…',
  copiedMsg: 'Import string copied to your clipboard. Paste it in game with Ctrl+V.',
  failedMsg:
    "Your browser blocked clipboard access. Select the string below and copy it manually (Ctrl+C).",
  stepsTitle: 'How to import',
  profiles: [
    {
      id: 'ellesmere',
      label: 'EllesmereUI Profile',
      title: 'EllesmereUI Profile',
      intro:
        "This is the profile you import into EllesmereUI. It carries every EllesmereUI setting behind Comfy's UI, so your frames, bars and colours match the screenshot.",
      steps: [
        'Install EllesmereUI and log in to your character.',
        'Open the EllesmereUI settings and go to Profiles.',
        'Choose Import and paste the string with Ctrl+V.',
        'Confirm the import, then reload your UI when prompted (or type /reload).',
      ],
    },
    {
      id: 'editmode',
      label: 'Edit Mode Profile',
      title: 'Edit Mode Profile',
      intro:
        "This is the layout you import into WoW's built-in Edit Mode. It places Blizzard's own frames (action bars, chat, minimap, buffs and so on) where they sit in Comfy's UI. Import the EllesmereUI profile first.",
      steps: [
        'Press Esc and choose Edit Mode.',
        'In the Edit Mode window, open the Layout dropdown and choose Import.',
        'Paste the string with Ctrl+V, give the layout a name and click Import.',
        'Make sure the new layout is selected, then click Save and exit Edit Mode.',
      ],
    },
  ],
} as const;

export type ComfyProfileId = (typeof comfyUi.profiles)[number]['id'];

export const search = {
  trigger: 'Search...',
  placeholder: 'Search...',
  empty: "Nothing. Either it doesn't exist or it's not worth knowing.",
} as const;

export const shell = {
  wordmark: 'ROGUE HANDBOOK',
  wordmarkSub: 'THE COMFY WIZARD',
  legend: { before: 'Droplet marks a ', strong: 'sweaty', after: ' tip', on: 'On', off: 'Off' },
  openNav: 'Open navigation',
  closeNav: 'Close navigation',
  openSearch: 'Open search',
  skipToContent: 'Skip to content',
} as const;

export const theme = {
  toLight: 'Switch to light mode',
  toDark: 'Switch to dark mode',
} as const;

export const credits = {
  community: {
    title: 'Rogue Classic Discord',
    body: [
      "Most of what's in this Handbook comes from the Rogue Classic Discord. The people there test, sim, log and argue about every corner of the class, and this guide stands on that work.",
      "It's also what keeps the guide honest. Feedback there catches mistakes and gets advice properly tested before it lands here. Questions, corrections and new findings are all welcome.",
    ],
    cta: 'Join the Discord',
  },
  contributorsTitle: 'Contributors',
  contributorsIntro: 'The people who put the Handbook together.',
  linkPending: 'Link coming soon',
} as const;

/** Each contributor's socials: keys into `socialMeta`. `href: '#'` renders as a pending link. */
export const contributors: {
  name: string;
  role: string;
  bio: string;
  /** Phrases in `bio` to link, opening in a new tab. */
  bioLinks?: Record<string, string>;
  /** Uses the Comfy Wizard logo. */
  logo?: boolean;
  /** Square portrait (src/assets/avatars, 168px WebP). Without one, initials stand in. */
  avatar?: string;
  socials: { kind: 'YT' | 'TT' | 'TWITCH' | 'MAIL'; href: string }[];
}[] = [
  {
    name: 'The Comfy Wizard',
    role: 'Curator',
    bio: 'Rogue theorycrafter, UI Engineer, WoWSims contributor, Former Rank 1 Rogue, and Girls Dad.',
    logo: true,
    socials: [
      { kind: 'YT', href: links.youtube },
      { kind: 'TT', href: links.tiktok },
      { kind: 'TWITCH', href: links.twitch },
      { kind: 'MAIL', href: links.mail },
    ],
  },
  // TODO: placeholder bios and links until each contributor sends theirs.
  {
    name: 'TheBackstabi',
    role: 'Contributor',
    avatar: avatarBackstabi,
    bio: "WoWSims contributor, Rogue enthusiast. It's a frog.",
    socials: [{ kind: 'YT', href: '#' }],
  },
  {
    name: 'Ra',
    role: 'Contributor',
    avatar: avatarRa,
    bio: 'I was #2 DPS on our Sapphiron kill in Vanilla Naxx.',
    bioLinks: { 'Sapphiron kill': 'https://www.youtube.com/watch?v=po7Vl8p9sUw' },
    socials: [{ kind: 'YT', href: '#' }],
  },
  {
    name: 'Anhak',
    role: 'Contributor',
    avatar: avatarAnhak,
    bio: 'Felstriker hater & Cat dad.',
    socials: [{ kind: 'YT', href: '#' }],
  },
];

export const socialMeta = {
  YT: { name: 'YouTube' },
  TT: { name: 'TikTok' },
  TWITCH: { name: 'Twitch' },
  MAIL: { name: 'Email' },
} as const;

export const footer = {
  brand: 'Rogue Handbook',
  closing: {
    before: 'Curated by ',
    curator: 'The Comfy Wizard',
    after:
      ', built on the hard work of the Rogue Classic community. Thank you to everyone who contributes. Here is to the WoW Forever journey together, representing Rogues across Azeroth.',
  },
  tip: {
    before: " If you'd like to help with running costs, feel free to ",
    link: 'send a tip',
    after: '.',
  },
  shortcutsLabel: 'Shortcuts',
  // Most players are on Windows, so show Ctrl. ⌘K works too (see HandbookProvider).
  shortcuts: [
    { key: 'Ctrl K', what: 'Search' },
    { key: 'Esc', what: 'Close a window' },
  ],
} as const;

export const tooltipFallback = 'No note yet.';
