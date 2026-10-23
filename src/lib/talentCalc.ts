/**
 * Wowhead Forever talent calculator links → points per talent, for the Talents tree
 * preview. A build only stores its calculator link; the trees themselves come from
 * src/content/talent-trees.json (`npm run talents`).
 *
 * Link format, `…/talent-calc/rogue/v2<trees>_…`: `v2` is the format version, then one
 * digit per talent (its rank) in row-then-column order, the trees in calculator order
 * (Assassination, Combat, Subtlety) separated by `-`, trailing zeros left off. What
 * follows (`_t0_r95`, the learning order) doesn't change the finished tree.
 */
import data from '../content/talent-trees.json';

export interface Talent {
  id: number;
  name: string;
  row: number;
  col: number;
  icon: string;
  max: number;
  /** Spell id per rank. */
  spells: number[];
  /** Wowhead's talent definition id, which its tooltip API takes as `def`. */
  def: number;
  /** Each rank's description, as plain text. */
  text: string[];
  /** Talents (same tree) that need `ranks` points first. */
  requires: { id: number; ranks: number }[];
  tierPoints: number;
}

export interface TalentTreeData {
  id: number;
  name: string;
  icon: string;
  talents: Talent[];
}

export const talentTrees = data.trees as TalentTreeData[];

/**
 * Points in each talent, per tree (same order as `talentTrees` and their talents), or
 * `null` when the link isn't a Rogue calculator link or no longer fits the trees.
 */
export function decodeTalentLink(link: string | undefined): number[][] | null {
  const m = link?.match(/\/talent-calc\/rogue\/v2([0-9-]*)(?:[_/]|$)/);
  if (!m) return null;
  const parts = m[1].split('-');
  if (parts.length > talentTrees.length) return null;
  const ranks = talentTrees.map((t) => t.talents.map(() => 0));
  for (const [i, digits] of parts.entries()) {
    for (const [j, d] of [...digits].entries()) {
      const talent = talentTrees[i].talents[j];
      if (!talent || Number(d) > talent.max) return null;
      ranks[i][j] = Number(d);
    }
  }
  return ranks;
}

/** Talent letters in a learning order (Crockford base32 without the digits). */
const ORDER_LETTERS = 'abcdefghjkmnpqrstvwxyz';

/** One step of a learning order: a run of points put into one talent, level after level. */
export interface TalentStep {
  /** Index into `talentTrees`. */
  tree: number;
  talent: Talent;
  /** Level the run's first and last points go in at. */
  from: number;
  to: number;
  /** The talent's rank once the run is done. */
  rank: number;
}

/** The first talent point comes at level 10, then one per level. */
const FIRST_POINT_LEVEL = 10;

/**
 * The calculator's "Talent Order", the part of the link after the trees' `/`: a digit
 * picks the tree, then each letter is one talent in it (`a` is its first, row then
 * column). Lowercase spends one point there; uppercase fills it to its max rank.
 * Points in the same talent on consecutive levels come back as one step. `null` when
 * the link has no order, or it doesn't fit the trees.
 */
export function decodeTalentOrder(link: string | undefined): TalentStep[] | null {
  const code = link?.match(/\/talent-calc\/rogue\/v2[0-9-]*[^/]*\/([0-9a-zA-Z]+)/)?.[1];
  if (!code) return null;
  const ranks = talentTrees.map((t) => t.talents.map(() => 0));
  const steps: TalentStep[] = [];
  let tree = 0;
  let level = FIRST_POINT_LEVEL;
  for (const ch of code) {
    if (/[0-9]/.test(ch)) {
      tree = Number(ch);
      if (!talentTrees[tree]) return null;
      continue;
    }
    const i = ORDER_LETTERS.indexOf(ch.toLowerCase());
    const talent = talentTrees[tree].talents[i];
    if (!talent) return null;
    const before = ranks[tree][i];
    const rank = ch === ch.toUpperCase() ? talent.max : before + 1;
    if (rank > talent.max || rank <= before) return null;
    ranks[tree][i] = rank;
    const to = level + rank - before - 1;
    const last = steps.at(-1);
    if (last?.talent === talent) Object.assign(last, { to, rank });
    else steps.push({ tree, talent, from: level, to, rank });
    level = to + 1;
  }
  return steps;
}
