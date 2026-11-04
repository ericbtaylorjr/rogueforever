import { useEffect, useRef, useState } from 'react';
import { racesCopy } from '../../content/copy';
import { easternDate } from '../../lib/time';
import type { SpecId } from '../../content/types';
import { useSpecColor } from '../../state/useSpecColor';
import { FilterPill } from '../ui/Pill';

const copy = racesCopy.sims;
const WOWSIMS = 'https://www.wowsims.com';

type Sims = typeof import('../../content/raceSims.json');
type Tier = 'best' | 'close' | 'far';

/** Green for the best race and anything within 0.5% of it, yellow up to 2% behind, red past that. */
const tierOf = (pct: number): Tier => (pct >= -0.5 ? 'best' : pct >= -2 ? 'close' : 'far');
const tone: Record<Tier, { color: string }> = {
  best: { color: 'var(--venom)' },
  close: { color: 'var(--caution)' },
  far: { color: 'var(--bad)' },
};

/** Solid fill and border: the colour mixed into the panel, not laid over it, so the striped rows can't tint a cell. */
const solid = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, var(--panel))`;

/** The data is ~130 KB of simulation links, so it loads only once the section nears the screen. */
function useSims() {
  const ref = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Sims | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || data) return;
    const load = () =>
      import('../../content/raceSims.json').then(
        (m) => setData(m.default),
        () => setFailed(true),
      );
    if (!('IntersectionObserver' in window)) {
      void load();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void load();
        }
      },
      { rootMargin: '600px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [data]);

  return { ref, data, failed };
}

/** A build pill, in its spec's colour when selected (assassination_mutilate → Assassination). */
function BuildPill({
  id,
  name,
  selected,
  onSelect,
}: {
  id: string;
  name: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const c = useSpecColor(id.split('_')[0] as SpecId);
  return <FilterPill label={name} selected={selected} color={c} onSelect={onSelect} />;
}

/** Every build × race × encounter length, as the % each race trails the best one. */
export function RaceSims() {
  const { ref, data, failed } = useSims();
  const [specId, setSpecId] = useState<string>('');
  /** Whether this export came with simulation links (the CSV doesn't). */
  const linked = !!data?.specs.some((sp) =>
    Object.values(sp.sims).some((cells) => (cells as { link?: string }[]).some((c) => c.link)),
  );
  const spec = data && (data.specs.find((s) => s.id === specId) ?? data.specs[0]);

  return (
    <div ref={ref} className="panel mt-[16px]">
      <div className="px-[18px] pt-[16px]">
        <h3 className="t-panel-label text-ink">{copy.title}</h3>
        <p className="mt-[8px] max-w-[70ch] text-[13px] leading-[1.6] text-mute">{copy.intro}</p>
      </div>

      {!data ? (
        <p className="px-[18px] py-[18px] text-[13px] text-faint" role="status" style={{ minHeight: 320 }}>
          {failed ? copy.failed : copy.loading}
        </p>
      ) : (
        spec && (
          <>
            <div role="group" aria-label={copy.buildLabel} className="flex flex-wrap gap-[8px] px-[18px] pt-[14px]">
              {data.specs.map((s) => (
                <BuildPill
                  key={s.id}
                  id={s.id}
                  name={s.name}
                  selected={s.id === spec.id}
                  onSelect={() => setSpecId(s.id)}
                />
              ))}
            </div>

            <div className="overflow-x-auto px-[12px] pt-[14px] pb-[4px] sm:px-[18px]">
              <table className="w-full min-w-[320px] border-collapse text-[13px]">
                <caption className="sr-only">{`${spec.name}: ${copy.title}`}</caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="t-eyebrow px-[6px] pb-[4px] text-left text-[10.5px] font-semibold text-faint"
                    >
                      {copy.raceHeader}
                    </th>
                    {data.durations.map((d) => (
                      <th
                        key={d}
                        scope="col"
                        className="t-eyebrow px-[6px] pb-[4px] text-center text-[10.5px] font-semibold text-faint"
                      >
                        {copy.durationLabel(d / 60)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.races.map((race, i) => (
                    <tr key={race} className="race-row">
                      <th
                        scope="row"
                        className="w-[34%] px-[8px] py-[3px] text-left sm:w-[28%] text-[12.5px] leading-[1.25] sm:text-[13px] font-semibold text-ink"
                      >
                        {race}
                      </th>
                      {data.durations.map((d) => {
                        const sim: { pct: number | null; link?: string } =
                          spec.sims[String(d) as keyof typeof spec.sims][i];
                        const cell =
                          'flex min-h-[36px] items-center justify-center rounded-[6px] border px-[2px] text-[12px] font-semibold sm:px-[6px] sm:text-[12.5px]';
                        if (sim.pct === null) {
                          // No sim for this race and build: say so rather than leave a hole.
                          return (
                            <td key={d} className="p-[3px]">
                              <div className={`t-num ${cell} border-line text-faint`}>
                                {'\u2014'}
                                <span className="sr-only">{` ${race}, ${d / 60} minute simulation: ${copy.noSim}`}</span>
                              </div>
                            </td>
                          );
                        }
                        const t = tone[tierOf(sim.pct)];
                        const style = {
                          color: t.color,
                          background: solid(t.color, 16),
                          borderColor: solid(t.color, 45),
                        };
                        const label = sim.pct === 0 ? copy.best : `${sim.pct.toFixed(2)}%`;
                        return (
                          <td key={d} className="p-[3px]">
                            {sim.link ? (
                              <a
                                href={`${WOWSIMS}${sim.link}`}
                                target="_blank"
                                rel="noreferrer"
                                className={`t-num ${cell} transition-[filter] hover:brightness-125 focus-visible:brightness-125`}
                                style={style}
                              >
                                {label}
                                <span className="sr-only">{` ${race}, ${d / 60} minute simulation ${copy.newTab}`}</span>
                              </a>
                            ) : (
                              <div className={`t-num ${cell}`} style={style}>
                                {label}
                                <span className="sr-only">{` ${race}, ${d / 60} minute simulation`}</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="flex flex-wrap gap-x-[18px] gap-y-[6px] px-[18px] pt-[8px] pb-[10px] text-[12px] text-faint">
              {(['best', 'close', 'far'] as const).map((k) => (
                <li key={k} className="flex items-center gap-[7px]">
                  <span
                    aria-hidden="true"
                    className="size-[12px] rounded-[3px] border"
                    style={{ background: solid(tone[k].color, 16), borderColor: solid(tone[k].color, 45) }}
                  />
                  {copy.legend[k]}
                </li>
              ))}
            </ul>
            {linked && <p className="px-[18px] pb-[6px] text-[12px] text-faint">{copy.openHint}</p>}
            <p className="px-[18px] pb-[16px] text-[12px] text-faint">
              {copy.lastUpdated}:{' '}
              <time dateTime={data.updated} className="t-num text-mute">
                {easternDate(new Date(data.updated))}
              </time>
            </p>
          </>
        )
      )}
    </div>
  );
}
