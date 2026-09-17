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
  eyebrow: 'WORLD OF WARCRAFT CLASSIC',
  titleTop: 'Rogue DPS',
  titleBottom: 'Compendium',
  lede: 'Everything a raiding Rogue needs, on one page. Community-built from sims, log analysis, and a lot of arguing in Discord. No ads, no twelve-page SEO detour before the actual answer.',
  support: {
    before: 'Built on Classic Era right now, with a running list of everything Blizzard has actually confirmed for ',
    link: 'Warcraft Forever',
    after: '. Nothing on this page is a leak or a guess dressed up as fact — if it is not confirmed, it says so.',
  },
  ctaPrimary: 'Pick a spec →',
  ctaGhost: 'What Forever changes',
  ladder: {
    title: 'Spec ladder',
    meta: 'CLASSIC ERA',
    footnote:
      'Tiers are Classic Era raid consensus, not a sim. Forever will reshuffle this — see Forever watch.',
  },
} as const;

export const specBar = {
  label: 'ACTIVE SPEC',
  sweatyOn: 'Sweaty tips on',
  sweatyOff: 'Sweaty tips off',
} as const;

/** Section headings. Nav labels are shorter — these are the on-page H2s. */
export const headings: Record<string, string> = {
  specs: 'Spec board',
  forever: 'Forever watch',
  talents: 'Talents & weapons',
  poisons: 'The poison rack',
  rotation: 'Rotation',
  gear: 'Gear',
  consumables: 'Consumables',
  buffs: 'Buffs & debuffs',
  iea: 'Expose Armor duty',
  raid: 'Raids',
  tools: 'Tools & UI',
  leveling: 'Leveling 1–60',
  faq: 'FAQ',
  changelog: 'Changelog',
};

export const specBoard = {
  intro: {
    before:
      'Classic Era raid consensus, scored as an index rather than a DPS figure — because a DPS number without a gear set, a fight length and a buff list attached is decoration. Sim your own character in ',
    link: 'Classic WoWSims',
    after: ' and trust that instead.',
  },
  cols: { rank: 'RANK', index: 'INDEX · vs top' },
  pending: {
    heading: 'No Forever sim data exists yet',
    body: 'Beta opens 17 September and the game launches 4 November. Until logs exist there is nothing honest to rank. What we can do is tell you which direction each spec is pointing, based only on changes Blizzard has actually confirmed.',
  },
  yourSpec: 'YOUR SPEC',
} as const;

export const forever = {
  intro:
    'Everything on this page becomes provisional the moment beta lands. Here is what Blizzard has actually said, separated from what the community pulled out of demo footage, separated again from what nobody knows yet.',
  impactPrefix: 'What it means for you —',
} as const;

export const talents = {
  /** `{spec}` is replaced with the active spec name. */
  intro:
    'Showing {spec}. Classic Era builds — Forever redesigns individual talents and adds a new 16-point milestone, so treat every point below as provisional after 4 November.',
  splitTitle: 'Talent split',
  weaponsTitle: 'Weapons & skill',
  skillCap: '300 SKILL',
  copyTalents: 'Copy talent summary',
  copyWeapons: 'Copy weapon setup',
  copied: 'Copied',
  foreverCallout: {
    before: 'Forever adds ',
    strong: 'One-Handed Axes',
    after:
      ' to the Rogue weapon list — confirmed. Weapon Skill survives as a stat, but Blizzard says individual items will no longer hand out huge amounts of it.',
  },
} as const;

export const poisonsCopy = {
  intro:
    'Applied per weapon, consumed in charges, and the thing that separates a Rogue who prepared from one who turned up. Buy the reagents in bulk and stop apologising for the bank trips.',
  foreverCallout: {
    before: "Forever's unified Hit and Crit explicitly covers ",
    strong: 'poisons and traps',
    after:
      '. In Classic your poison applications sit outside your melee hit table; in Forever the same hit rating on your gear feeds them. Assassination is the spec most likely to feel that.',
  },
} as const;

export const rotation = {
  intro:
    "A priority list, top to bottom. If a line's conditions are met it fires and you start again from the top.",
  /** `{spec}` is replaced with the active spec name. */
  showing: '{spec} shown.',
  openerTitle: 'Opener',
  neverTitle: 'Never do this',
} as const;

export const gear = {
  simsLink: 'Open in Classic WoWSims ↗',
  todoLabel: 'TODO',
  todo: {
    before:
      'Slot rows are wired and styled, item data is placeholder — drop your list in and every row fills, tooltips included. Worth holding off on a full Forever list: Blizzard has reviewed the loot on ',
    strong: 'every',
    after:
      ' dungeon boss and is deliberately "unsolving" Classic BiS, so a Classic Era list will not survive contact with launch.',
  },
  cols: { slot: 'SLOT', item: 'ITEM', source: 'SOURCE', enchant: 'ENCHANT' },
  empty: 'No item set yet',
  tabs: [
    { id: 'bis', label: 'Best in Slot' },
    { id: 'prebis', label: 'Pre-raid BiS' },
  ],
} as const;

export const consumablesCopy = {
  intro: 'The full bag, Classic Era. Hover anything for what it does.',
  sweatyNote: {
    strong: 'Droplets',
    after: ' are the sweaty ones — real gains, real gold, real effort.',
  },
} as const;

export const exposeArmor = {
  p1: {
    before:
      'One Rogue on Expose Armor duty is standard, and it is the single most valuable thing you can do for a physical-heavy raid. It costs ',
    strong: 'your',
    after: ' damage. It gives the raid more than you lose, in almost every case.',
  },
  p2: 'Expose vs Sunder is a settled argument that people keep re-litigating. A fully talented 5-point Expose Armor beats five stacks of Sunder — and it does it without eating five Warrior globals. The catch is that the two do not stack, so the raid picks one.',
  stats: [
    { val: '2,550', label: 'Expose Armor at 5CP, fully talented', tone: 'accent' },
    { val: '2,250', label: 'Sunder Armor at 5 stacks', tone: 'mute' },
    { val: '1,700', label: 'Untalented 5CP Expose — do not bother', tone: 'faint' },
  ],
  stepsTitle: 'Your job, in order',
  steps: [
    'Confirm the assignment before the pull. Expose and Sunder do not stack, so the raid runs one or the other — not both, not "whoever gets there first".',
    'Build to 5 combo points and land Expose Armor early. Do not open with it at 2CP because the pull felt rushed.',
    "Track the debuff timer on your own frames, not the raid's. Refresh it before it drops, not after somebody types in chat.",
    'Never let it fall during a movement phase. The raid feels it immediately, even when nobody says anything.',
  ],
  warn: {
    before: 'Expose Armor must ',
    strong: 'only',
    after:
      ' be cast at 5 combo points. A 3CP Expose is a wasted global and a worse debuff, and the raid has to live with it until it expires.',
  },
} as const;

export const raidsCopy = {
  intro:
    'Rogue-only notes per tier. What to bring, what actually targets you, and where a Rogue quietly wins the fight. Tap a raid to open it.',
  prepLabel: 'Bring',
} as const;

export const toolsCopy = {
  macrosTitle: 'Macros worth stealing',
  copy: 'Copy',
  copied: 'Copied',
} as const;

export const search = {
  trigger: 'Search everything',
  placeholder: 'Search everything',
  empty: "Nothing. Either it doesn't exist or it's not worth knowing.",
} as const;

export const shell = {
  wordmark: 'COMPENDIUM',
  wordmarkSub: 'ROGUE',
  legend: { before: 'Droplet marks a ', strong: 'sweaty', after: ' tip' },
  openNav: 'Open navigation',
  closeNav: 'Close navigation',
  openSearch: 'Open search',
} as const;

export const footer = {
  brand: 'THE COMFY WIZARD',
  adFree: {
    before: 'Ad-free because ads are miserable. ',
    link: 'Send a tip',
    after: ' if this saved you a wipe.',
  },
  socials: ['YT', 'TT', 'MAIL'],
  builtWithLabel: 'BUILT WITH',
  builtWith: {
    before: 'Community sims, log analysis, and a lot of smart folks in the ',
    link: 'Rogue Classic Discord',
    after: ". Corrections welcome — that's the whole point.",
  },
  shortcutsLabel: 'SHORTCUTS',
  shortcuts: [
    { key: '⌘K', what: 'Search everything' },
    { key: '/', what: 'Same, fewer fingers' },
    { key: 'ESC', what: 'Get out' },
  ],
} as const;

export const tooltipFallback = 'No note yet — add one and it shows up here.';
