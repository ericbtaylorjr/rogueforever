import raw from './content.json';
import type { Content, SpecId } from './types';

/**
 * Single source of truth for every piece of data on the page, straight from the
 * design handoff. Edit content.json, never the markup.
 */
export const content = raw as unknown as Content;

export const {
  specs,
  specDetail,
  specIndex,
  levelingIndex,
  foreverOutlook,
  foreverDates,
  foreverChanges,
  races,
  poisons,
  consumables,
  buffGroups,
  gearSlots,
  raids,
  faqs,
  tools,
  macros,
  leveling,
  changelog,
  nav,
  themes,
} = content;

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

/** Every level 60 build across all specs, best first. */
export const rankedBuilds = (Object.keys(specDetail) as SpecId[])
  .flatMap((spec) => specDetail[spec].talentVariants.map((variant) => ({ spec, variant })))
  .sort((a, b) => a.variant.rank - b.variant.rank);

/** Category filters, derived rather than hardcoded so new data shows up. */
export const consumableCats = ['All', ...new Set(consumables.map((c) => c.k))];

export const foreverCats = ['All', ...new Set(foreverChanges.map((c) => c.cat))];

export const foreverCatCount = (cat: string) =>
  cat === 'All' ? foreverChanges.length : foreverChanges.filter((c) => c.cat === cat).length;

export const consumableCatCount = (cat: string, sweaty: boolean) =>
  consumables.filter((c) => (cat === 'All' || c.k === cat) && (sweaty || !c.s)).length;
