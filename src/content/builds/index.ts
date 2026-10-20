import type { Build, BuildPhase, EndgameBuild, LevelingActivity, LevelingBuild, SpecId } from '../types';
import { assassination } from './assassination';
import { combat } from './combat';
import { subtlety } from './subtlety';

/**
 * Every build, one file per spec. A build owns everything the spec sections show
 * (talents, stats, gear, rotation), so adding a variant is one more entry there.
 */
const bySpec: Record<SpecId, Build[]> = { assassination, combat, subtlety };

/** Level 60 builds best-ranked first, then leveling builds in the order they're written (Questing, Dungeons). */
const ordered = (list: Build[]) => [
  ...list.filter((b): b is EndgameBuild => b.phase === 'endgame').sort((a, b) => a.rank - b.rank),
  ...list.filter((b) => b.phase === 'leveling'),
];

export const buildsFor = (spec: SpecId): Build[] => ordered(bySpec[spec]);

export const findBuild = (spec: SpecId, id: string | null | undefined): Build | undefined =>
  id ? bySpec[spec].find((b) => b.id === id) : undefined;

/** A spec's best-ranked level 60 build. */
export const defaultBuild = (spec: SpecId): Build => buildsFor(spec)[0];

/** Every level 60 build across all specs, best first. */
export const rankedBuilds: EndgameBuild[] = Object.values(bySpec)
  .flat()
  .filter((b): b is EndgameBuild => b.phase === 'endgame')
  .sort((a, b) => a.rank - b.rank);

/** Every spec's leveling builds for one activity, best first. */
export const rankedLeveling = (activity: LevelingActivity): LevelingBuild[] =>
  Object.values(bySpec)
    .flat()
    .filter((b): b is LevelingBuild => b.phase === 'leveling' && b.activity === activity)
    .sort((a, b) => a.rank - b.rank);

/**
 * The build to land on when switching to `spec`: the build last picked there if it's
 * the same kind, else the same build by id (Combat Backstab to Subtlety Backstab,
 * Questing to Questing), else that spec's first build of the same kind. Leveling
 * players stay on leveling builds.
 */
export function buildForSwitch(spec: SpecId, from: Build, remembered?: string): Build {
  const kept = findBuild(spec, remembered);
  if (kept?.phase === from.phase) return kept;
  const same = findBuild(spec, from.id);
  if (same?.phase === from.phase) return same;
  return buildsFor(spec).find((b) => b.phase === from.phase) ?? defaultBuild(spec);
}

/** The order build pickers list their categories in. */
export const phaseOrder: BuildPhase[] = ['endgame', 'leveling'];
