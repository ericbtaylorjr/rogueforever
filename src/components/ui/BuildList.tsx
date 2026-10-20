import { specById } from '../../content/content';
import type { Build } from '../../content/types';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { useSpecColor } from '../../state/useSpecColor';
import { GradeBadge } from './GradeBadge';

/** The Talents build card, which every build list controls. */
export const BUILD_CARD_ID = 'build-card';

/**
 * Builds as a pickable list, each led by its meta grade. Picking one makes it the
 * active build, switching spec if needed. `showSpec` labels each row with its spec,
 * for lists that mix specs. `bySpec` names each row by its spec alone, for lists
 * where every build shares a name (one per spec, like the Questing ranking).
 */
export function BuildList({
  builds,
  label,
  showSpec = false,
  bySpec = false,
}: {
  builds: Build[];
  label: string;
  showSpec?: boolean;
  bySpec?: boolean;
}) {
  const { spec, build: active, pickBuild } = useHandbook();
  const { tone } = useTheme();
  const c = useSpecColor();

  return (
    <ol aria-label={label} className="flex flex-col gap-[6px]">
      {builds.map((b) => {
        const on = b.spec === spec && b.id === active.id;
        const s = specById[b.spec];
        return (
          <li key={`${b.spec}-${b.id}`}>
            <button
              type="button"
              aria-pressed={on}
              aria-controls={BUILD_CARD_ID}
              onClick={() => pickBuild(b.spec, b.id)}
              className="grid w-full items-center gap-[12px] rounded-[10px] border px-[12px] py-[9px] text-left transition-colors hover:border-accent"
              style={{
                gridTemplateColumns: '30px minmax(0,1fr) auto',
                borderColor: on ? c.line : 'var(--line)',
                background: on ? c.soft : 'transparent',
              }}
            >
              <GradeBadge grade={b.grade} />
              <span className="min-w-0">
                {bySpec ? (
                  <span className="flex items-center gap-[7px] text-[13.5px] font-semibold text-ink">
                    <span
                      aria-hidden="true"
                      className="size-[7px] shrink-0 rounded-full"
                      style={{ background: tone(s.color, 3) }}
                    />
                    <span className="truncate">{s.name}</span>
                    <span className="sr-only"> {b.name}</span>
                  </span>
                ) : (
                  <span className="block truncate text-[13.5px] font-semibold text-ink">{b.name}</span>
                )}
                {showSpec && !bySpec && (
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
                {b.talents.map((t) => t.pts).join(' / ')}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
