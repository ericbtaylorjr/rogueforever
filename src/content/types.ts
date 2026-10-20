export type SpecId = 'assassination' | 'combat' | 'subtlety';

export interface Spec {
  id: SpecId;
  name: string;
  weapon: string;
  color: string;
  color2: string;
  tier: string;
  role: string;
  tag: string;
}

export interface TalentTree {
  name: string;
  pts: number;
  color: string;
}

export interface AplRow {
  name: string;
  cond: string;
  sweaty?: boolean;
}

/** S best to D worst. `X` is a placeholder for a build that hasn't been graded yet. */
export type MetaGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'X';

/** Priority list, opener and mistakes. Empty arrays render as a "coming soon" note. */
export interface Rotation {
  apl: AplRow[];
  opener: string[];
  nevers: string[];
}

/** Level 60 end game, or the road there. Leveling builds swap Gear to milestone items. */
export type BuildPhase = 'endgame' | 'leveling';

interface BuildBase {
  /** Unique within its spec; goes in the URL as `?build=`. */
  id: string;
  spec: SpecId;
  /** Short label. The spec is shown beside it, so no spec prefix: "Backstab", not "Combat Backstab". */
  name: string;
  /** Meta grade, S best to D worst, or the `X` placeholder. */
  grade: MetaGrade;
  /** Position in its Meta breakdown ranking across every spec, 1 = best. */
  rank: number;
  /** Empty until the build is worked out; the Talents card then shows only its note. */
  talents: TalentTree[];
  talentNote: string;
  keyTalents: string[];
  /** Optional talent calculator link. */
  link?: string;
  stats: StatPriority;
  rotation: Rotation;
}

/** A level 60 build: ranked against every spec's level 60 builds, geared from pre-raid BiS to BiS. */
export interface EndgameBuild extends BuildBase {
  phase: 'endgame';
  gear: Record<GearSetId, GearItem[]>;
}

export type LevelingActivity = 'questing' | 'dungeons';

/** A leveling build, geared by milestone items and ranked against every spec's builds for the same activity. */
export interface LevelingBuild extends BuildBase {
  phase: 'leveling';
  activity: LevelingActivity;
  gear: LevelingItem[];
}

/**
 * Everything the spec sections show comes from the active build: Talents, Stats,
 * Gear and Rotation. Builds that agree on something share the same constant.
 */
export type Build = EndgameBuild | LevelingBuild;

export type SimSetId = 'st' | 'cleave' | 'forever';
export type LevelingSetId = 'questing' | 'dungeons' | 'levelingSummary';

export interface SimSet {
  label: string;
  note: string;
  rows?: Record<SpecId, number>;
  pending?: boolean;
}

export interface ForeverOutlook {
  id: SpecId;
  arrow: string;
  arrowColor: string;
  why: string;
}

/** An official Blizzard source (news.blizzard.com, worldofwarcraft.blizzard.com or a blue post). */
export interface ForeverSource {
  label: string;
  url: string;
}

export interface ForeverDate {
  label: string;
  val: string;
  note: string;
  color: string;
  source: ForeverSource;
}

/** Only `Confirmed` may be presented as fact. See README > Editorial rules. */
export type ForeverStatus = 'Confirmed' | 'Demo footage' | 'Not published' | 'Partial';

export interface ForeverChange {
  title: string;
  cat: string;
  status: ForeverStatus;
  hue: string;
  body: string;
  impact: string;
  /** Every entry cites at least one official Blizzard source. */
  sources: ForeverSource[];
}

export interface Poison {
  name: string;
  where: string;
  hue: string;
  hue2: string;
  /** CSS length — height of the liquid inside the vial. */
  fill: string;
  tag: 'Core' | 'Situational' | 'Utility';
  note: string;
}

export interface Consumable {
  /** name */
  n: string;
  /** category */
  k: string;
  note: string;
  /** sweaty-only */
  s?: boolean;
}

export interface BuffGroup {
  label: string;
  note: string;
  items: { n: string; s?: boolean }[];
}

export interface RaidPhase {
  n: string;
  lines: string[];
}

export interface Raid {
  name: string;
  abbr: string;
  hue: string;
  tag: string;
  summary: string;
  prep: string;
  phases: RaidPhase[];
}

export interface Faq {
  q: string;
  a: string;
}

export interface Tool {
  kicker: string;
  name: string;
  color: string;
  body: string;
  /** Link-out label. Omitted for cards with their own actions (Comfy's UI). */
  cta?: string;
  disabled?: boolean;
}

export interface Macro {
  name: string;
  code: string;
}

export interface ChangelogEntry {
  date: string;
  text: string;
}

export interface NavGroup {
  label: string;
  /** `spec`: these sections change with the active spec and take its colour. */
  scope?: 'spec';
  items: { id: string; label: string }[];
}

export interface Theme {
  bg: string;
  panel: string;
  panel2: string;
  line: string;
  tex: string;
  glowA: number;
}

export type IntensityId = 'subtle' | 'shadow' | 'venom';

/**
 * Real gear schema. The design ships 17 styled-but-empty slot rows on purpose:
 * Blizzard has confirmed a full itemization pass for Forever, so a Classic Era
 * BiS list would be wrong at launch. Drop items in here and the table fills.
 */
export type ItemQuality = 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface GearItem {
  slot: string;
  itemId: number;
  name: string;
  quality: ItemQuality;
  source: string;
  enchant?: string;
}

export type GearSetId = 'prebis' | 'bis';

/** One stat in a spec's priority, weighted in EP relative to the priority's `relativeTo` stat (= 1). */
export interface StatWeight {
  stat: string;
  ep: number;
}

/** A stat priority reads left to right; `op` joins a stat to the one before it. */
export interface StatPriority {
  /** The stat every EP is measured against. */
  relativeTo: string;
  stats: (StatWeight & { op?: '>' | '=' })[];
}

export type Faction = 'Both' | 'Alliance' | 'Horde';

/** A leveling milestone: an item worth chasing, and the level to aim for it by. */
export interface LevelingItem extends Omit<GearItem, 'enchant'> {
  level: number;
  faction: Faction;
}

/** One race in the race meta list. */
export interface Race {
  name: string;
  /** Short summary of the race's racial abilities. */
  racials: string;
  /** `null` while a race can't be graded yet. */
  grade: MetaGrade | null;
  /** One line on what the race brings, or why it can't be graded. */
  note: string;
  /** Phrases inside `note` that link out, phrase to URL. */
  noteLinks?: Record<string, string>;
}

export interface Content {
  specs: Spec[];
  specIndex: Record<SimSetId, SimSet>;
  levelingIndex: Record<LevelingSetId, SimSet>;
  foreverOutlook: ForeverOutlook[];
  foreverDates: ForeverDate[];
  foreverChanges: ForeverChange[];
  races: Race[];
  poisons: Poison[];
  consumables: Consumable[];
  buffGroups: BuffGroup[];
  gearSlots: string[];
  raids: Raid[];
  faqs: Faq[];
  tools: Tool[];
  macros: Macro[];
  changelog: ChangelogEntry[];
  nav: NavGroup[];
  themes: Record<IntensityId, Theme>;
}
