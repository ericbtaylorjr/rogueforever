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

export type MetaGrade = 'S' | 'A' | 'B' | 'C' | 'D';

/**
 * One talent build for a spec. A spec can carry several; the Talents section's
 * build ranking lists every spec's builds and switches between them.
 */
export interface TalentVariant {
  /** Unique within its spec. */
  id: string;
  /** Short tab label, e.g. "Raid". */
  name: string;
  /** Meta grade, S best to D worst. */
  grade: MetaGrade;
  /** Position in the level 60 build ranking across every spec, 1 = best. */
  rank: number;
  talents: TalentTree[];
  talentNote: string;
  keyTalents: string[];
  /** Optional talent calculator link. */
  link?: string;
}

/** Empty arrays render as "coming soon" placeholders until Forever data exists. */
export interface SpecDetail {
  talentVariants: TalentVariant[];
  apl: AplRow[];
  opener: string[];
  nevers: string[];
}

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

/** A spec's leveling build, shown in the Talents section's Leveling builds card. */
export interface LevelingPath {
  name: string;
  /** Colours come from this spec, so the card matches the spec bar. */
  spec: SpecId;
  /** Short tree label shown above the name, e.g. "Deep Assassination". */
  tree: string;
  body: string;
  /** Talent build link. Omitted until the build exists; the button shows as coming soon. */
  href?: string;
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

export type GearSetId = 'leveling' | 'prebis' | 'bis';

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
  specDetail: Record<SpecId, SpecDetail>;
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
  leveling: LevelingPath[];
  changelog: ChangelogEntry[];
  nav: NavGroup[];
  themes: Record<IntensityId, Theme>;
}
