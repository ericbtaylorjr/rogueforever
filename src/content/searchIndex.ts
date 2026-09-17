import {
  buffGroups,
  consumables,
  faqs,
  foreverChanges,
  macros,
  nav,
  poisons,
  raids,
  specs,
} from './content';

export interface SearchEntry {
  kind: string;
  label: string;
  /** Section id to jump to. */
  id: string;
  /** Contextual label shown on the right of a result row. */
  section: string;
}

/**
 * ~126 entries: every nav section, consumable, buff/debuff, poison, raid,
 * Forever change, FAQ, macro and spec. Built once at module load.
 */
export const searchIndex: SearchEntry[] = [
  ...nav.flatMap((g) =>
    g.items.map((i) => ({ kind: 'Section', label: i.label, id: i.id, section: g.label })),
  ),
  ...consumables.map((c) => ({
    kind: c.k,
    label: c.n,
    id: 'consumables',
    section: 'Consumables',
  })),
  ...buffGroups.flatMap((g) =>
    g.items.map((i) => ({ kind: 'Buff', label: i.n, id: 'buffs', section: g.label })),
  ),
  ...poisons.map((p) => ({ kind: 'Poison', label: p.name, id: 'poisons', section: 'Poisons' })),
  ...raids.map((r) => ({ kind: 'Raid', label: r.name, id: 'raid', section: r.tag })),
  ...foreverChanges.map((c) => ({
    kind: 'Forever',
    label: c.title,
    id: 'forever',
    section: c.status,
  })),
  ...faqs.map((f) => ({ kind: 'FAQ', label: f.q, id: 'faq', section: 'FAQ' })),
  ...macros.map((m) => ({ kind: 'Macro', label: m.name, id: 'tools', section: 'Tools' })),
  ...specs.map((s) => ({ kind: 'Spec', label: s.name, id: 'specs', section: 'Spec board' })),
];

const EMPTY_QUERY_RESULTS = 9;
const MAX_RESULTS = 40;

/** Case-insensitive substring match on label or kind. */
export function searchEntries(query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  const hits = q
    ? searchIndex.filter(
        (r) => r.label.toLowerCase().includes(q) || r.kind.toLowerCase().includes(q),
      )
    : searchIndex.slice(0, EMPTY_QUERY_RESULTS);
  return hits.slice(0, MAX_RESULTS);
}
