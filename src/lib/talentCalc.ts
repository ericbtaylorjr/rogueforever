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
