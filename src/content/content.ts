import raw from './content.json';
import type { Content, SpecId } from './types';

/**
 * Single source of truth for every piece of data on the page, straight from the
 * design handoff. Edit content.json, never the markup.
 */
export const content = raw as unknown as Content;

export const {
  specs,
  specIndex,
  levelingIndex,
  foreverOutlook,
  guide,
  races,
  poisons,
  buffGroups,
  professions,
  gearSlots,
  raids,
  tools,
  macros,
  changelog,
  nav,
  themes,
} = content;

/** Alphabetical, so a new entry can go anywhere in content.json. Category pills keep the order they first appear in the file. */
const consumablesByCategory = raw.consumables as unknown as Content['consumables'];
export const consumables = [...consumablesByCategory].sort((a, b) => a.n.localeCompare(b.n, 'en', { sensitivity: 'base' }));

export const specById = Object.fromEntries(specs.map((s) => [s.id, s])) as Record<
  SpecId,
  (typeof specs)[number]
>;

export const sectionIds = nav.flatMap((g) => g.items.map((i) => i.id));

/** Sections whose content follows the active spec. */
export const specSectionIds = new Set(
  nav.filter((g) => g.scope === 'spec').flatMap((g) => g.items.map((i) => i.id)),
);

export const sectionLabels = Object.fromEntries(
  nav.flatMap((g) => g.items.map((i) => [i.id, i.label] as const)),
) as Record<string, string>;

/** Category filters, derived rather than hardcoded so new data shows up. */
export const consumableCats = ['All', ...new Set(consumablesByCategory.map((c) => c.k))];

export const guideCats = ['All', ...new Set(guide.map((c) => c.cat))];

export const guideCatCount = (cat: string) =>
  cat === 'All' ? guide.length : guide.filter((c) => c.cat === cat).length;

export const consumableCatCount = (cat: string, sweaty: boolean) =>
  consumables.filter((c) => (cat === 'All' || c.k === cat) && (sweaty || !c.s)).length;
