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
  eyebrow: 'WORLD OF WARCRAFT FOREVER',
  titleTop: 'Rogue',
  titleBottom: 'Handbook',
  disclaimer: {
    label: 'PLACEHOLDER',
    text: 'Everything in this Handbook is placeholder until more Forever data is confirmed. Content will update as sim data, logs and official patch notes come in.',
  },
  lede: 'Everything a raiding Rogue needs, on one page. Community-built from sims, log analysis, and a lot of arguing in Discord. No ads, no twelve-page SEO detour before the actual answer.',
  support: {
    before: 'Built on Classic Era right now, with a running list of everything Blizzard has actually confirmed for ',
    link: 'Warcraft Forever',
    after: '. Nothing on this page is a leak or a guess dressed up as fact — if it is not confirmed, it says so.',
  },
  ctaPrimary: 'Pick a spec →',
  ctaGhost: 'What Forever changes',
  ladder: {
    title: 'Spec Meta',
    meta: 'patch X.Y',
    footnote: 'WoW Forever is currently in Beta. This will be updated as we learn more.',
  },
} as const;

export const specBar = {
  label: 'ACTIVE SPEC',
  sweatyOn: 'Sweaty tips on',
  sweatyOff: 'Sweaty tips off',
} as const;

/** Section headings. Nav labels are shorter — these are the on-page H2s. */
export const headings: Record<string, string> = {
  specs: 'Meta Breakdown',
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
    link: 'Forever WoWSims',
    after: ' and trust that instead.',
  },
  cols: { rank: 'RANK', index: 'INDEX · vs top' },
  pending: {
    heading: 'No Forever sim data exists yet',
    body: 'Beta opens 17 September and the game launches 4 November. Until logs exist there is nothing honest to rank. What we can do is tell you which direction each spec is pointing, based only on changes Blizzard has actually confirmed.',
  },
  yourSpec: 'ACTIVE SPEC',
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
  todoLabel: 'PLACEHOLDER',
  todo: {
    before: 'The talent splits and weapon details below are ',
    strong: 'Classic Era placeholders',
    after:
      ', standing in until the Forever talent trees are published. They will be updated as information is gathered.',
  },
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
    strong: 'poisons',
    after:
      '. In Classic your poison applications sit outside your melee hit table; in Forever the same hit rating on your gear feeds them. Assassination is the spec most likely to feel that.',
  },
  apCallout: {
    before: 'Poison damage also scales with ',
    strong: 'Attack Power',
    after:
      ' in Forever — a welcome change from Classic. Every spec applying poisons benefits, but Assassination leans on it the most.',
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
  simsLink: 'Open in Forever WoWSims ↗',
  todoLabel: 'IN PROGRESS',
  todo: {
    before:
      'Slot rows are wired and styled, item data is placeholder. The Pre-raid BiS and Best in Slot lists will be built out over time as ',
    strong: 'information is gathered and WoWSims APLs are solidified',
    after:
      '. They will be published once the research is done and there is enough solid data behind them to trust.',
  },
  cols: { slot: 'SLOT', item: 'ITEM', source: 'SOURCE', enchant: 'ENCHANT' },
  empty: 'No item set yet',
  tabs: [
    { id: 'prebis', label: 'Pre-raid BiS' },
    { id: 'bis', label: 'Best in Slot' },
  ],
} as const;

export const consumablesCopy = {
  intro: 'The full bag, Classic Era. Hover anything for what it does.',
  sweatyNote: {
    strong: 'Droplets',
    after: ' are the sweaty ones — these are probably not worth it for most players.',
  },
  todoLabel: 'PLACEHOLDER',
  todo: {
    before: 'This list is ',
    strong: 'Classic Era data, standing in until Forever consumables are known',
    after:
      '. Blizzard has confirmed reagents and effects are being reviewed, so expect additions, removals and rebalances. It will be replaced once the Forever list is available and validated.',
  },
} as const;

export const buffsCopy = {
  todoLabel: 'PLACEHOLDER',
  todo: {
    before: 'Buff and debuff values shown here are ',
    strong: 'Classic Era baselines',
    after:
      '. Final balancing and stack/overlap rules for Forever are still TBD, so this list will be updated once they are confirmed and sims have been run against them.',
  },
} as const;

export const exposeArmor = {
  p1: {
    before:
      'Expose Armor and Sunder Armor now land on the exact same number, so the debuff is no longer a default Rogue assignment. It comes down to ',
    strong: 'raid comp and who executes it more reliably',
    after: ', not which class happens to own the ability.',
  },
  p2: 'A fully talented 5-point Expose Armor used to beat five stacks of Sunder outright, which is why it defaulted to the Rogue. In Forever the two are tied — the Rogue talent no longer grants extra armor reduction beyond what Sunder already provides. The debuffs still do not stack, so the raid picks whichever player holds it more consistently, or if performance of one outweighs the other.',
  stats: [
    { val: '2,550', label: 'Expose Armor at 5CP, fully talented', tone: 'accent' },
    { val: '2,550', label: 'Sunder Armor at 5 stacks', tone: 'accent' },
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
    "The three raids Blizzard has confirmed for Forever so far. Boss lists and Rogue notes aren't published yet — this tracks exactly what has and hasn't been said. Tap a raid to open it.",
  prepLabel: 'Status',
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
  wordmark: 'ROGUE HANDBOOK',
  wordmarkSub: 'THE COMFY WIZARD',
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
  socials: ['YT', 'TT', 'TWITCH', 'MAIL'],
  socialTips: {
    YT: { name: 'YouTube', note: 'Guides, VODs and clips — @thecomfywizard.' },
    TT: { name: 'TikTok', note: 'Quick tips and highlights — @thecomfywizard.' },
    TWITCH: { name: 'Twitch', note: 'Live streams — thecomfywizard.' },
    MAIL: { name: 'Email', note: 'TheComfyWizard@gmail.com' },
  },
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
