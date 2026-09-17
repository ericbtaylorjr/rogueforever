export type SpecId = 'cbsword' | 'cbdagger' | 'assn' | 'subt';

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

export interface WeaponRow {
  slot: string;
  name: string;
  why: string;
  sweaty?: boolean;
}

export interface AplRow {
  name: string;
  cond: string;
  sweaty?: boolean;
}

export interface SpecDetail {
  talents: TalentTree[];
  talentNote: string;
  keyTalents: string[];
  weapons: WeaponRow[];
  apl: AplRow[];
  opener: string[];
  nevers: string[];
}

export type SimSetId = 'st' | 'cleave' | 'forever';

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

export interface ForeverDate {
  label: string;
  val: string;
  note: string;
  color: string;
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
  cta: string;
}

export interface Macro {
  name: string;
  code: string;
}

export interface LevelingPath {
  name: string;
  hue: string;
  body: string;
}

export interface ChangelogEntry {
  date: string;
  text: string;
}

export interface NavGroup {
  label: string;
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

export type GearSetId = 'bis' | 'prebis';

export interface Content {
  specs: Spec[];
  specDetail: Record<SpecId, SpecDetail>;
  specIndex: Record<SimSetId, SimSet>;
  foreverOutlook: ForeverOutlook[];
  foreverDates: ForeverDate[];
  foreverChanges: ForeverChange[];
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
