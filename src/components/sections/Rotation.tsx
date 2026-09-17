import { specById, specDetail } from '../../content/content';
import { rotation as copy } from '../../content/copy';
import { useCompendium } from '../../state/CompendiumProvider';
import { Droplet } from '../ui/Droplet';
import { SectionHeading } from '../ui/SectionHeading';

export function Rotation() {
  const { spec, sweaty } = useCompendium();
  const d = specDetail[spec];

  return (
    <section id="rotation" aria-label="Rotation">
      <SectionHeading id="rotation" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">
        {copy.intro}{' '}
        <span className="text-faint" aria-live="polite">
          {copy.showing.replace('{spec}', specById[spec].name)}
        </span>
      </p>

      <div className="mt-[18px] grid gap-[14px] stack:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <ol className="panel px-[18px] py-[8px]">
          {d.apl.map((a, i) => (
            <li
              key={a.name}
              className="flex items-baseline gap-[12px] py-[12px]"
              style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,.05)' }}
            >
              <span className="t-num shrink-0 text-[12px] text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-[8px]">
                  <span className="text-[14.5px] font-semibold text-ink">{a.name}</span>
                  {a.sweaty && sweaty && <Droplet />}
                </span>
                <span className="mt-[3px] block text-[12.5px] leading-[1.55] text-mute">
                  {a.cond}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-[14px]">
          <div className="panel p-[18px]">
            <span className="t-panel-label text-ink">{copy.openerTitle}</span>
            <ol className="mt-[14px] flex flex-wrap gap-[8px]">
              {d.opener.map((o, i) => (
                <li
                  key={o}
                  className="flex items-center gap-[8px] rounded-[8px] border border-line px-[10px] py-[7px] text-[12.5px] text-prose"
                >
                  <span className="t-num text-[10.5px] text-accent">{i + 1}</span>
                  {o}
                </li>
              ))}
            </ol>
          </div>

          <div
            className="rounded-[14px] p-[18px]"
            style={{ border: '1px solid rgba(255,138,91,.22)', background: 'var(--panel)' }}
          >
            <span className="t-panel-label text-warn">{copy.neverTitle}</span>
            <ul className="mt-[12px] flex flex-col gap-[9px]">
              {d.nevers.map((n) => (
                <li
                  key={n}
                  className="flex items-baseline gap-[9px] text-[12.5px] leading-[1.55] text-prose"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[6px] size-[4px] shrink-0 rounded-full"
                    style={{ background: 'var(--warn)' }}
                  />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
