import { leveling } from '../../content/content';
import { levelingCopy as copy } from '../../content/copy';
import { SectionHeading } from '../ui/SectionHeading';

export function Leveling() {
  return (
    <section id="leveling" aria-label="Leveling 1 to 60">
      <SectionHeading id="leveling" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">{copy.intro}</p>

      <div className="mt-[18px] grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,268px),1fr))]">
        {leveling.map((l) => (
          <article key={l.name} className="panel overflow-hidden">
            <div
              className="relative flex h-[78px] items-end p-[14px]"
              style={{ background: `linear-gradient(140deg, ${l.hue}, var(--hue-end))` }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    'repeating-linear-gradient(115deg, rgba(var(--fg-rgb),.055) 0 2px, transparent 2px 9px)',
                }}
              />
              <h3 className="t-card-title relative" style={{ color: 'var(--on-hue)' }}>
                {l.name}
              </h3>
            </div>
            <p className="p-[14px] text-[12.5px] leading-[1.6] text-mute">{l.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
