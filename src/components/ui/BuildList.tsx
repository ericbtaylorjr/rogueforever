import { rankedBuilds, specById } from '../../content/content';
import type { SpecId, TalentVariant } from '../../content/types';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { useSpecColor } from '../../state/useSpecColor';
import { GradeBadge } from './GradeBadge';

/** The Talents build card, which every build list controls. */
export const BUILD_CARD_ID = 'build-card';

/** The build a spec is showing: the one picked for it, else its best-ranked. */
export function useActiveBuild(spec: SpecId): TalentVariant | undefined {
  const { builds } = useHandbook();
  const ranked = rankedBuilds.filter((b) => b.spec === spec).map((b) => b.variant);
  return ranked.find((v) => v.id === builds[spec]) ?? ranked[0];
}

/**
 * Ranked level 60 builds with their meta grade. Picking one switches to its spec
 * and shows it in the Talents build card. `showSpec` labels each row with its spec,
 * for lists that mix specs.
 */
export function BuildList({
  builds,
  label,
  showSpec = false,
}: {
  builds: { spec: SpecId; variant: TalentVariant }[];
  label: string;
  showSpec?: boolean;
}) {
  const { spec, pickBuild } = useHandbook();
  const { tone } = useTheme();
  const c = useSpecColor();
  const active = useActiveBuild(spec);

  return (
    <ol aria-label={label} className="flex flex-col gap-[6px]">
      {builds.map(({ spec: id, variant: v }) => {
        const on = id === spec && v.id === active?.id;
        const s = specById[id];
        return (
          <li key={`${id}-${v.id}`}>
            <button
              type="button"
              aria-pressed={on}
              aria-controls={BUILD_CARD_ID}
              onClick={() => pickBuild(id, v.id)}
              className="grid w-full items-center gap-[12px] rounded-[10px] border px-[12px] py-[9px] text-left transition-colors hover:border-accent"
              style={{
                gridTemplateColumns: '30px minmax(0,1fr) auto',
                borderColor: on ? c.line : 'var(--line)',
                background: on ? c.soft : 'transparent',
              }}
            >
              <GradeBadge grade={v.grade} />
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-semibold text-ink">{v.name}</span>
                {showSpec && (
                  <span className="flex items-center gap-[6px] text-[11px] text-faint">
                    <span
                      aria-hidden="true"
                      className="size-[6px] shrink-0 rounded-full"
                      style={{ background: tone(s.color, 3) }}
                    />
                    {s.name}
                  </span>
                )}
              </span>
              <span className="t-num text-[12px] text-faint">
                {v.talents.map((t) => t.pts).join(' / ')}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
