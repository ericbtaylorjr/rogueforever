import gearSims from '../../content/gearSims.json';
import { gearSimsCopy as copy } from '../../content/copy';
import { easternDate } from '../../lib/time';
import type { SpecId } from '../../content/types';
import { useSpecColor } from '../../state/useSpecColor';
import { WowheadText } from '../ui/WowheadText';

type Tier = 'best' | 'close' | 'far';

/** Green for the best build and anything within 0.5% of it, yellow up to 3% behind, red past that. */
const tierOf = (pct: number): Tier => (pct >= -0.5 ? 'best' : pct >= -3 ? 'close' : 'far');
const tone: Record<Tier, { color: string }> = {
  best: { color: 'var(--venom)' },
  close: { color: 'var(--caution)' },
  far: { color: 'var(--bad)' },
};

/** Solid fill and border: the colour mixed into the panel, not laid over it, so the striped rows can't tint a cell. */
const solid = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, var(--panel))`;

/** A build's name with a dot in its spec's colour (assassination_mutilate → Assassination). */
function BuildName({ id, name }: { id: string; name: string }) {
  const c = useSpecColor(id.split('_')[0] as SpecId);
  return (
    <span className="flex min-w-0 items-center gap-[8px]">
      <span aria-hidden="true" className="size-[7px] shrink-0 rounded-full" style={{ background: c.mark }} />
      <span className="min-w-0">{name}</span>
    </span>
  );
}

/** Every end game build's Pre-raid BiS DPS, as the % it trails the best build, per encounter length. */
export function GearSims() {
  const { durations, builds } = gearSims;
  const cell =
    'flex min-h-[36px] items-center justify-center rounded-[6px] border px-[2px] text-[12px] font-semibold sm:px-[6px] sm:text-[12.5px]';

  return (
    <div className="panel mt-[16px]">
      <div className="px-[18px] pt-[16px]">
        <h3 className="t-panel-label text-ink">{copy.title}</h3>
        <p className="mt-[8px] max-w-[70ch] text-[13px] leading-[1.6] text-mute"><WowheadText text={copy.intro} /></p>
      </div>

      <div className="overflow-x-auto px-[12px] pt-[14px] pb-[4px] sm:px-[18px]">
        <table className="w-full min-w-[420px] border-collapse text-[13px]">
          <caption className="sr-only">{copy.title}</caption>
          <thead>
            <tr>
              <th scope="col" className="t-eyebrow px-[6px] pb-[4px] text-left text-[10.5px] font-semibold text-faint">
                {copy.buildHeader}
              </th>
              {durations.map((d) => (
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
            {builds.map((b) => (
              <tr key={b.id} className="race-row">
                <th
                  scope="row"
                  className="w-[34%] px-[8px] py-[3px] text-left text-[12.5px] font-semibold leading-[1.25] text-ink sm:w-[30%] sm:text-[13px]"
                >
                  <BuildName id={b.id} name={b.name} />
                </th>
                {durations.map((d) => {
                  const sim: { pct: number | null } = b.sims[String(d) as keyof typeof b.sims];
                  if (sim.pct === null) {
                    return (
                      <td key={d} className="p-[3px]">
                        <div className={`t-num ${cell} border-line text-faint`}>{'—'}</div>
                      </td>
                    );
                  }
                  const t = tone[tierOf(sim.pct)];
                  const label = sim.pct === 0 ? copy.best : `${sim.pct.toFixed(2)}%`;
                  return (
                    <td key={d} className="p-[3px]">
                      <div
                        className={`t-num ${cell}`}
                        style={{ color: t.color, background: solid(t.color, 16), borderColor: solid(t.color, 45) }}
                      >
                        {label}
                        <span className="sr-only">{` ${b.name}, ${d / 60} minute simulation`}</span>
                      </div>
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
      <p className="px-[18px] pb-[16px] text-[12px] text-faint">
        {copy.lastUpdated}:{' '}
        <time dateTime={gearSims.updated} className="t-num text-mute">
          {easternDate(new Date(gearSims.updated))}
        </time>
      </p>
    </div>
  );
}
