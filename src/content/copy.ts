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
  /** Pulsing notice above the eyebrow. Take it out (or edit it) when the Handbook is caught up. */
  banner: {
    label: 'Rogue rebalance notice',
    before: 'There was a ',
    link: 'large Rogue rebalance',
    after:
      ' announced on 11/3. We are actively working to get WoWSims updated, which will then allow me to update the Handbook. I appreciate the patience as we scramble to get things implemented before launch.',
    sign: '~ Comfy',
  },
  eyebrow: 'A Rogue guide for World of Warcraft: Forever',
  titleTop: 'Rogue',
  titleBottom: 'Handbook',
  disclaimer: {
    label: 'Heads up:',
    before:
      "everything here is based on the level 30 beta. I'll update leveling and endgame as the full game opens up. If something's off, let us know in the ",
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
  ctaGhost: 'New to Rogue?',
  note: {
    title: 'A note from Comfy',
    body: [
      "I'm a long time Rogue player, theorycrafter, and peaked during Rank 1 SoD parsing. When learning, I found it best to write it down and that's where this Handbook was born.",
      "My goal is to take all the data out there and provide it to the Rogue community in a clean, easy to understand format to serve both the diehard and more casual players. See y'all in Azeroth!",
    ],
    sign: 'The Comfy Wizard',
    youtubeCta: 'Subscribe on YouTube',
    xCta: 'Follow on X',
  },
} as const;

export const specBar = {
  label: 'Active spec',
  buildLabel: 'Build',
  phoneLabel: 'Guidance for',
  sweatyOn: 'Sweaty tips on',
  sweatyOff: 'Sweaty tips off',
} as const;

/** Spec zone vs. all-Rogue zone framing, plus the scope chips on section headings. */
export const scope = {
  specChipPrefix: 'Spec',
  zone: {
    label: 'Your spec guide',
    before: 'Talents, stats, gear and rotation below are for ',
    after: '. If you change the Active Spec or Build, then all the contextual information will change as well.',
  },
  allZone: 'Everything from here down is the same for all Rogue specs and no longer relative to your Active Spec.',
} as const;

/** Section headings. Nav labels are shorter — these are the on-page H2s. */
export const headings: Record<string, string> = {
  specs: 'Meta breakdown',
  'new-to-rogue': 'New to Rogue?',
  talents: 'Talents',
  stats: 'Stats',
  races: 'Races',
  poisons: 'The poison rack',
  rotation: 'Rotation',
  gear: 'Gear',
  consumables: 'Consumables',
  buffs: 'Buffs & debuffs',
  professions: 'Professions',
  iea: 'Expose Armor',
  raid: 'Raids',
  pvp: 'PvP',
  tools: 'Tools & UI',
  macros: 'Macros',
  changelog: 'Changelog',
  credits: 'Credits',
};

export const specBoard = {
  intro:
    "The builds below are the current projected meta, based on WoWSims research and the current beta game data. Expect this list to change through launch as more data comes in.",
  rankingTitle: 'Spec Meta',
  rankingMeta: 'Level 60 · end game',
  rankingLabel: 'Level 60 end game builds, ranked',
  cols: { rank: 'RANK', index: 'INDEX · vs top' },
  tableLabel: 'Damage index by spec',
  pending: {
    heading: 'No Forever sim data yet',
    body: 'The beta opened September 17th and the game launches November 4th. Until sims and logs exist there is nothing honest to rank.',
  },
  yourSpec: 'YOUR SPEC',
  phaseLabel: 'Meta breakdown view',
  phaseTabs: { endgame: 'End Game', leveling: 'Leveling' },
  leveling: {
    meta: 'Leveling',
    questing: { title: 'Questing', label: 'Leveling builds for questing, ranked' },
    dungeons: { title: 'Dungeons', label: 'Leveling builds for dungeons, ranked' },
    /** Shown as a tip without the "Tip:" label. */
    tip: "This meta projection is extremely early. We need more launch data to really understand which builds pull ahead and which fall behind, so expect it to be updated throughout the launch period.",
  },
} as const;

/** Build categories, as the build pickers and Talents lists group them. */
export const buildPhases = {
  endgame: 'Level 60',
  leveling: 'Leveling',
} as const;

/** Shared by the build lists in Meta breakdown and Talents. */
export const buildList = {
  gradeLabel: 'Grade',
  ungraded: 'Not graded',
} as const;

export const newToRogue = {
  intro:
    'A library of tips and systems explanations for the Rogue in WoW Forever. It is here to help a Beginner or Intermediate Rogue player better understand the class and how to perform well. Where a change comes from Blizzard, the entry links its source.',
  impactPrefix: 'What it means for you:',
  sourcesLabel: 'Sources:',
} as const;

/** Lead-ins for <Tip>. */
export const tips = {
  label: 'Tip:',
  sweatyLabel: 'Sweaty tip:',
} as const;

/** Shown on a build flagged `stale` until its data is redone for the Nov 2 Rogue rework. */
export const staleBuild = {
  label: 'Pre-rework data.',
  text: "This build hasn't been redone for the Rogue rework yet, so its talents, weights and rotation may be out of date.",
};

export const talents = {
  intro: 'Level 60 and leveling builds for your active spec. Pick one here or from the Build menu above. Meta breakdown has how every level 60 build ranks across all three specs.',
  endgameTitle: 'Level 60 builds',
  levelingTitle: 'Leveling builds',
  buildsLabel: 'Level 60 builds for this spec',
  levelingLabel: 'Leveling builds for this spec',
  /** A build with no talents or note yet. */
  buildPending: "This build hasn't been written up yet. It goes up once it's been tested.",
  /** A sweaty tip: shown only with sweaty tips on. */
  murderTip:
    "Most of these builds take 2/2 Murder. For encounters without Humanoids or Giants it does nothing, so swap those points into a couple of other offensive talents. Most players can set and forget, but if you're squeezing out every bit of damage, it's worth the respec.",
  /** Tree names are confirmed to carry over; the split is what is pending. */
  trees: ['Assassination', 'Combat', 'Subtlety'],
  calculator: 'Open in talent calculator ↗',
  /** Tree preview: narrow cards show one tree, picked with the point split. */
  treePicker: 'Talent tree to show',
  treeLabel: (tree: string) => `${tree} talents. Arrow keys move between talents.`,
  treePoints: (points: number) => `${points} ${points === 1 ? 'point' : 'points'}`,
  /** Read after the number on the narrow-screen tree tabs: "31 points in Assassination". */
  pointsIn: (points: number) => (points === 1 ? 'point in' : 'points in'),
  talentLabel: (name: string, points: number, max: number) => `${name}, ${points} of ${max}`,
  rankLine: (points: number, max: number) => `Rank ${points}/${max}`,
  /** Leveling builds: the calculator's learning order, below the trees. */
  orderTitle: 'Talent order',
  /** `link` is the Talented perk, linked to Wowhead with its tooltip. */
  orderIntro: {
    text: 'One point per level from 10. Each line shows the level(s) and the rank the talent reaches.',
    before: 'If you have unlocked the ',
    link: 'Talented',
    after: ' Legacy perk, you start gaining talent points at level 5 instead of 10 (same max of 51).',
    href: 'https://www.wowhead.com/forever/spell=1225474/talented',
    spellId: 1225474,
    fallback: 'Legacy perk: start gaining talent points at level 5 instead of 10.',
  },
  orderLabel: 'Talent order by level. Arrow keys move between talents.',
  /** Starts with the row's visible text ("14–16 Lightning Reflexes 3/5"), so voice control and WCAG 2.5.3 match it. */
  stepLabel: (from: number, to: number, name: string, rank: number, max: number, tree: string) =>
    `${from === to ? from : `${from}–${to}`} ${name} ${rank}/${max}, ${tree}`,
} as const;

export const racesCopy = {
  intro:
    'A general picture of the race meta, observed from WoWSims data. Some races pull ahead on shorter encounters and others on longer ones. A few races deal increased damage to certain mob types, so they generally perform better in encounters against those types. And as your gear improves, stat caps can come into play and change how much a race brings.',
  learnMore: 'Learn more about racials on Wowhead ↗',
  tip: "Every race is within about 1% of the others, and some will be better in certain raids. Don't stress about choosing wrong. If you enjoy the vibes of one, play it.",
  listTitle: 'Racial meta',
  listLabel: 'Races ranked by meta grade',
  sims: {
    title: 'Race performance by build',
    intro:
      "How far each race falls behind the best one, per build and encounter length. These are early WoWSims results from the data available today and will change over time. They exclude mob-type bonuses (Beasts, Elementals), which the racial meta above covers. Click any cell to open its simulation in a new tab.",
    buildLabel: 'Build',
    raceHeader: 'Race',
    durationLabel: (m: number) => `${m} min`,
    best: 'BEST',
    legend: { best: 'Best, or within 0.5%', close: '0.5–2% behind', far: 'More than 2% behind' },
    lastUpdated: 'Last updated',
    loading: 'Loading race simulations…',
    failed: "The race simulations couldn't load. Try reloading the page.",
    newTab: '(opens WoWSims in a new tab)',
  },
} as const;

export const poisonsCopy = {
  intro:
    "Poisons go on each weapon and wear off in charges. Buy the reagents in bulk so you aren't running to a vendor halfway through a dungeon.",
  foreverTitle: 'Updated in Forever',
  /** Each line is plain text, `{ strong }` for bold, or `{ spec }` for a spec name in its colour. */
  forever: [
    [
      'Unified Hit and Crit now cover ',
      { strong: 'Poisons' },
      '. In Classic your poisons ignored your ',
      { strong: 'Melee Hit' },
      '; in Forever the ',
      { strong: 'Hit' },
      ' on your gear feeds them too.',
    ],
    [
      'Poison damage scales slightly with ',
      { strong: 'Attack Power' },
      ', but not with ',
      { strong: 'Spell Power' },
      '. Every spec benefits from this, ',
      { spec: 'assassination' },
      ' most of all.',
    ],
  ],
} as const;

export const rotation = {
  intro:
    'Start with the opener, then repeat the rotation for the rest of the fight. The pro tips cover your cooldowns, items and the finer points. This entire rotation is derived directly from its WoWSims APL rotation used in the sims.',
  /** `{spec}` is replaced with the active spec and build, e.g. "Combat Backstab". */
  pending:
    "I haven't written the {spec} rotation, opener or pro tips yet. They go up once Forever has real logs and WoWSims APLs to check them against.",
  openerTitle: 'Opener',
  stepsTitle: 'Rotation',
  /** Closes the rotation list. */
  repeat: 'Then back to step 1.',
  tipsTitle: 'Pro tips',
} as const;

export const stats = {
  intro:
    'These weights are relative to current BiS gear, so expect them to shift slightly as your gear changes. For more accurate values, run the EP calculator in WoWSims with your current gear setup.',
  /** Follows the "Tip:" label, with the active spec and build's name between `before` and `after`. */
  tip: {
    before: 'These stat weights are relative to ',
    after: ' and are just a general guide. Weapon damage is MUCH more important than stats.',
  },
  /** Questing builds only, after the general tip. */
  questingTip:
    'Since while questing you are attacking from the front, Expertise gains double the value since you benefit from both the Parry and Dodge reduction.',
  statsTitle: 'Stat priority',
  statsMeta: 'Weights relative to',
  epLabel: 'EP',
} as const;

export const gear = {
  /** Rendered with <Tip>, which adds the "Tip:" label. */
  status: {
    text: "This is an early list. It leaves out some items we know exist but are still encrypted. Those will be added during launch, and this list will be updated as they appear.",
  },
  cols: { slot: 'SLOT', item: 'ITEM', source: 'SOURCE', enchant: 'ENCHANT' },
  tableLabel: 'Gear by slot',
  empty: 'No item set yet',
  /** Shown on a list tab until it has items. */
  comingSoon: {
    title: 'Coming soon',
    text: "This gear hasn't been discovered yet. Forever reworks loot across the game, so this list gets filled in during the opening weeks of launch as we learn more.",
  },
  leveling: {
    itemsTitle: 'Leveling milestone gear',
    cols: { level: 'LEVEL', slot: 'SLOT', item: 'ITEM', source: 'SOURCE', faction: 'FACTION' },
    tableLabel: 'Leveling items by level',
    /** Precedes a bracket's level range, as in "Levels 21–40". */
    bracket: 'Levels',
    bracketEmpty: 'Nothing worth chasing in this range yet',
    empty: 'No leveling items listed for this build yet',
  },
  /** Level 60 builds only; leveling builds show their milestone list instead. */
  tabs: [
    { id: 'prebis', label: 'Pre-raid BiS' },
    { id: 'bis', label: 'Best in Slot' },
  ],
} as const;

export const professionsCopy = {
  tip: "This is still being determined. Forever adds hundreds of new profession recipes, so expect a much clearer picture some time into launch, once recipes have been discovered and simulations have been run.",
  listTitle: 'Profession meta',
  listLabel: 'Professions ranked by meta grade',
} as const;

export const consumablesCopy = {
  intro: 'The full bag. Hover anything to see what it does.',
  /** The droplet icon stands in for the word "Droplet" (and is read as it). */
  sweatyNote: {
    lead: 'The ',
    icon: 'Droplet',
    before: ' represents the ',
    strong: 'sweaty',
    after: ' consumables, which most players can skip, as they may be too expensive or difficult to acquire to justify the effort for.',
  },
  /** Rendered with <Tip>, which adds the "Tip:" label. */
  status: {
    text: "Checked against the Wowhead Forever item database on October 25th. This list is tentative: it may include entries that exist in the Wowhead database but won't actually be available in Forever.",
  },
} as const;

export const buffsCopy = {
  /** Rendered with <Tip>, which adds the "Tip:" label. */
  status: {
    text: "These are early baselines. Forever's balancing and stacking rules aren't settled, so I'll update this once they are and the sims have run.",
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
    "The three raids that unlock December 9th, 2026. Blizzard has published their sizes, locations, boss counts and the Onyxia attunement. Boss names and Rogue notes aren't out yet, so this section only tracks what Blizzard has said.",
  prepLabel: 'Status:',
} as const;

export const pvpCopy = {
  body: [
    "This isn't a full PvP guide. Plenty of Rogues in the community know PvP far better than I do, and they're the ones worth learning it from.",
    "Over time I'll add the basics here and link out to the more detailed resources and people who really know their stuff.",
  ],
} as const;

export const macrosCopy = {
  intro: 'Here are some helpful Rogue macros which should help improve your performance or quality of life.',
  copy: 'Copy',
  copied: 'Copied',
} as const;

export const addons = {
  label: 'Recommended Addons',
  title: 'Recommended Addons',
  intro: 'The addons Comfy runs. Each links to its CurseForge page.',
  open: 'CurseForge',
  list: [
    { name: "Account Wide Interface Settings", url: "https://www.curseforge.com/wow/addons/account-wide-interface-settings", summary: "Shares your interface and layout options across every character on the account." },
    { name: "Auctionator", url: "https://www.curseforge.com/wow/addons/auctionator", summary: "A faster, friendlier auction house with shopping lists, price history and one-click posting." },
    { name: "BugGrabber", url: "https://www.curseforge.com/wow/addons/bug-grabber", summary: "Library that catches Lua errors quietly so BugSack can show them, instead of popping up error windows." },
    { name: "BugSack", url: "https://www.curseforge.com/wow/addons/bugsack", summary: "Lists the Lua errors BugGrabber caught, so you can read or report them when something breaks." },
    { name: "Deadly Boss Mods (DBM-Core)", url: "https://www.curseforge.com/wow/addons/deadly-boss-mods", summary: "Boss timers, warnings and alerts for raids and dungeons. The base addon the other DBM modules need." },
    { name: "DBM - Dungeons, Delves, Challenges & Events", url: "https://www.curseforge.com/wow/search?search=DBM%20Dungeons", summary: "Adds DBM boss timers and warnings for dungeons. Requires DBM-Core." },
    { name: "DBM - PvP Mods", url: "https://www.curseforge.com/wow/search?search=DBM%20PvP", summary: "Adds DBM timers and alerts for battlegrounds. Requires DBM-Core." },
    { name: "DungeonJournal", url: "https://www.curseforge.com/wow/search?search=Forever%20DungeonJournal", summary: "An in-game dungeon journal listing bosses, abilities, loot and quests for Forever's dungeons and raids." },
    { name: "EllesmereUI", url: "https://www.curseforge.com/wow/addons/ellesmereui", summary: "The UI suite behind Comfy's setup: unit frames, action bars, nameplates and more. Import the profile above to match it." },
    { name: "Enhance QoL", url: "https://www.curseforge.com/wow/addons/eqol", summary: "A grab bag of small quality-of-life tweaks for the UI, bags, minimap, castbars and more." },
    { name: "ForeverAuras", url: "https://www.curseforge.com/wow/search?search=ForeverAuras", summary: "A WeakAuras fork for Forever. Tracks buffs, debuffs and cooldowns with custom on-screen displays." },
    { name: "GatherLite", url: "https://www.curseforge.com/wow/addons/gatherlite", summary: "Shows herbs, ore and other gathering nodes you've found on the map and minimap." },
    { name: "HandyNotes", url: "https://www.curseforge.com/wow/addons/handynotes", summary: "Adds custom notes and pins to your world map. The base addon the HandyNotes plugins need." },
    { name: "HandyNotes: Class Trainers", url: "https://www.curseforge.com/wow/search?search=HandyNotes%20ClassTrainers", summary: "Marks class trainer locations on the map. Requires HandyNotes." },
    { name: "HandyNotes: Dungeon & Raid Locations (Forever)", url: "https://www.curseforge.com/wow/search?search=HandyNotes%20Dungeon%20Raid%20Locations%20Forever", summary: "Pins dungeon and raid entrances on the map. Requires HandyNotes." },
    { name: "Leatrix Plus", url: "https://www.curseforge.com/wow/addons/leatrix-plus", summary: "Many small convenience options: auto-sell junk, faster looting, interface tweaks and more." },
    { name: "LibSharedMedia-3.0", url: "https://www.curseforge.com/wow/addons/libsharedmedia-3-0", summary: "Library that lets addons share fonts, sounds and textures. Other addons need it." },
    { name: "Method Raid Tools", url: "https://www.curseforge.com/wow/addons/method-raid-tools", summary: "Raid planning and note-sharing tools such as assignments and cooldown planning." },
    { name: "RareScanner", url: "https://www.curseforge.com/wow/addons/rarescanner", summary: "Alerts you to rare mobs and treasures nearby and marks them on the map." },
    { name: "Spoken", url: "https://www.curseforge.com/wow/addons/spoken", summary: "Reads quest text, gossip and books aloud with voice acting." },
    { name: "TomTom", url: "https://www.curseforge.com/wow/addons/tomtom", summary: "Waypoint arrow and map pins that point you to coordinates and quest objectives." },
    { name: "What's Training?", url: "https://www.curseforge.com/wow/addons/whats-training", summary: "Shows which spells your class trainer can teach you and what they cost, right in the spellbook." },
    { name: "Wowhead Quick Link", url: "https://www.curseforge.com/wow/search?search=Wowhead%20Quick%20Link", summary: "Gives you a quick link to the Wowhead page for quests, items and more, so you can look them up fast." },
  ],
} as const;

export const gathering = {
  title: "Comfy's Gathering Reference Tool",
  intro:
    'Pick up to two gathering professions and a zone. You get the skill you need to gather there and how high the zone can take each one, so you reach the next zone ready for it.',
  professionsLabel: 'Your gathering professions',
  professionsHint: 'Choose up to two. Picking a third replaces the first.',
  professions: { herbalism: 'Herbalism', mining: 'Mining', skinning: 'Skinning' },
  zoneLabel: 'Zone',
  zoneHint: 'Sorted by the highest skill the zone asks for.',
  zonePlaceholder: 'Choose a zone',
  zoneLocked: 'Choose a profession first',
  none: (profession: string) => `no ${profession}`,
  empty: 'Choose a profession and a zone to see what you need.',
  minimum: 'Minimum skill',
  maximum: 'Maximum skill',
  minimumHint: 'To gather anything here',
  maximumHint: 'For the best node here',
  commonHint: (common: number) => `Most nodes need up to ${common}`,
  levelsTo: (profession: string, skill: number, cap: number) =>
    skill >= cap
      ? `Gathering here reliably takes your ${profession} all the way to the cap (${cap}).`
      : `Gathering here reliably takes your ${profession} up to ${skill}. After that, move on to a higher zone.`,
  lastSkillUp: (skill: number, cap: number) =>
    skill >= cap ? `Skill-ups stay possible all the way to ${cap}.` : `Skill-ups stay possible, but rarer, up to ${skill}.`,
  noNodes: (profession: string) => `This zone has no ${profession} to gather.`,
  skinningNote: "Skinning follows the creatures' levels: it uses the skinnable creatures in the zone's level range.",
  estimateNote: "Wowhead lists what each node needs, not its skill-up limits. Those are estimates: reliable until your skill is 50 above the node's requirement, and a last chance at 100 above.",
  barLabel: (profession: string, from: number, reliable: number, last: number) =>
    `${profession} skill-ups here run from ${from}: reliably to ${reliable}, and still possible to ${last}`,
  loading: 'Loading the gathering data…',
  failed: "The gathering data couldn't load. Try reloading the page.",
  close: 'Close',
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
  lastUpdated: 'Last updated',
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

export const consent = {
  regionLabel: 'Cookie consent',
  title: 'Cookies, only if you say so',
  body:
    "I'd like to use Google Analytics to see which specs, builds and sections get used, so I know what to improve next. It sets cookies, and it doesn't load unless you allow it. No ad tracking either way.",
  learnMore: 'How Google uses this data',
  privacy: 'Privacy policy',
  accept: 'Allow analytics',
  decline: 'No thanks',
  close: 'Close',
  current: { granted: 'Right now: analytics allowed.', denied: 'Right now: analytics off.' },
};

/**
 * Privacy policy, opened from the footer and the cookie banner (and by #privacy).
 * Keep it true to the code: src/lib/analytics.ts, the localStorage keys, src/sw.js and vite.config.ts.
 * Bump `updated` whenever the substance changes.
 */
export const privacy = {
  title: 'Privacy policy',
  close: 'Close privacy policy',
  updated: 'Last updated October 23, 2026',
  intro:
    "Short version: the Handbook doesn't have accounts, forms or ads. It remembers a few preferences in your browser, counts visits without cookies, and only uses Google Analytics if you allow it on the cookie banner.",
  sections: [
    {
      heading: 'Who runs this',
      body: [
        'The Rogue Handbook (wowrogue.gg) is a fan project curated by The Comfy Wizard. For anything privacy related, email TheComfyWizard@gmail.com.',
      ],
    },
    {
      heading: 'What stays in your browser',
      body: [
        "Three small settings are saved in your browser's local storage: your spec, build and sweaty preference (rc:prefs), light or dark theme (rc:theme), and your cookie choice with the date you made it (rc:consent). They never leave your device, and clearing your site data removes them.",
        "So repeat visits load faster, your browser also keeps a copy of the Handbook's own files (its page, scripts, styles, fonts and images) in its cache storage. They're the same files every visitor downloads, they hold nothing about you, and clearing your site data removes them too.",
        "Search runs in your browser. Unless you've allowed analytics (below), nothing you type into it leaves your device.",
      ],
    },
    {
      heading: 'Visit counts, without cookies',
      body: [
        'To know roughly how many people use the Handbook, every visit is counted with Cloudflare Web Analytics. It sets no cookies, stores nothing on your device and doesn\'t track you across visits or sites. It records the page, the site that sent you here, your country, and your browser, device type and operating system, plus how fast the page loaded. Cloudflare only uses this to produce the totals the Handbook sees. See Cloudflare\'s privacy policy.',
      ],
    },
    {
      heading: 'Analytics, only with your consent',
      body: [
        "If you pick \"Allow analytics\", the Handbook loads Google Analytics 4 to see how the guide gets used: which sections you look at and for how long, which specs and builds you pick, the tabs, filters, raids, FAQs and tooltips you open, what you search for, and which macros you copy. Each of these is tagged with your current spec, build and sweaty setting. Google also records things like your browser, device, screen size, the site that sent you here, and a rough location (country and city) worked out from your IP address. Google Analytics 4 doesn't store the IP address itself.",
        'It sets two cookies, _ga and _ga_2X22ZZJLFJ, which last up to 2 years so a returning visit can be told apart from a new one. Advertising features and ad personalisation are switched off.',
        'Google processes this data on the Handbook\'s behalf and may handle it outside your country, including in the United States. See how Google uses this data and the Google Privacy Policy.',
        "If you don't allow it, or your browser sends a Global Privacy Control signal, Google Analytics never loads and no cookies are set. The legal basis for analytics is your consent, which you can withdraw at any time.",
      ],
    },
    {
      heading: 'Hosting',
      body: [
        "The site is hosted on GitHub Pages. Like most hosts, GitHub may log basic request data such as IP addresses for security and reliability. See GitHub's privacy statement. Fonts and game icons are served from the site itself. Apart from Cloudflare's visit counter, Wowhead tooltips (below), and Google Analytics if you allow it, no other services load when you visit.",
      ],
    },
    {
      heading: 'Wowhead tooltips',
      body: [
        "When you hover or tap an item or spell, the Handbook asks Wowhead for that tooltip's details so they stay current. That request goes from your browser to Wowhead, so Wowhead sees your IP address and browser, as with any site you visit. It sets no cookies and loads no Wowhead scripts. See Wowhead's privacy policy.",
      ],
    },
    {
      heading: 'Links to other sites',
      body: [
        'The Handbook links out to places like the Rogue Classic Discord, WoWSims, Wowhead, YouTube, Twitch and the tip page. Those sites have their own privacy policies, which apply once you leave.',
      ],
    },
    {
      heading: 'Your choices and rights',
      body: [
        'You can change your cookie choice any time with Cookie settings in the footer. Switching analytics off stops it and deletes the Google Analytics cookies.',
        'Depending on where you live (for example under the GDPR in the EU and UK, or in California), you may have the right to access, correct or delete your data, and to object to its use. Analytics data is pseudonymous, so it usually can\'t be traced back to you, but email TheComfyWizard@gmail.com and it will be handled. You can also complain to your local data protection authority.',
      ],
    },
    {
      heading: 'Children',
      body: ["The Handbook isn't aimed at children under 13 and doesn't knowingly collect their data."],
    },
    {
      heading: 'Changes',
      body: ['If this policy changes, the date at the top changes with it.'],
    },
  ],
} as const;

export const footer = {
  brand: 'Rogue Handbook',
  cookieSettings: 'Cookie settings',
  privacyPolicy: 'Privacy policy',
  /** Bottom bar: the Handbook is a fan project. Keep both lines. */
  disclaimer:
    'The Rogue Handbook has zero affiliation with Blizzard Entertainment. It is a 100% community driven fan project.',
  trademark:
    'World of Warcraft and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries.',
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
