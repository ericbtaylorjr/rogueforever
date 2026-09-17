import { poisons } from '../../content/content';
import { poisonsCopy } from '../../content/copy';
import type { Poison } from '../../content/types';
import { Callout } from '../ui/Callout';
import { SectionHeading } from '../ui/SectionHeading';

/** CSS-drawn vial. No image asset — reproducible as-is. */
function Vial({ p }: { p: Poison }) {
  return (
    <div className="relative shrink-0" style={{ width: 30, height: 54 }} aria-hidden="true">
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          border: '1.5px solid rgba(255,255,255,.22)',
          borderRadius: '5px 5px 11px 11px',
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: p.fill,
            background: `linear-gradient(180deg, ${p.hue}, ${p.hue2})`,
            boxShadow: `0 0 18px -2px ${p.hue}`,
          }}
        >
          <span
            className="absolute left-[6px] top-[8px] size-[4px] animate-bob rounded-full"
            style={{ background: 'rgba(255,255,255,.55)' }}
          />
          <span
            className="absolute right-[7px] top-[16px] size-[3px] animate-bob-slow rounded-full"
            style={{ background: 'rgba(255,255,255,.4)' }}
          />
        </div>
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[2px]"
        style={{ top: -4, width: 14, height: 6, background: '#3A3A46' }}
      />
    </div>
  );
}

const tagStyle: Record<Poison['tag'], React.CSSProperties> = {
  Core: { background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 600, border: '1px solid var(--accent)' },
  Situational: { border: '1px solid rgba(255,179,71,.45)', color: '#FFB347' },
  Utility: { border: '1px solid var(--line)', color: 'var(--faint)' },
};

export function Poisons() {
  return (
    <section id="poisons" aria-label="Poisons">
      <SectionHeading id="poisons" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">{poisonsCopy.intro}</p>

      <div className="mt-[16px]">
        <Callout tone="sky">
          {poisonsCopy.foreverCallout.before}
          <strong className="font-semibold text-sky">{poisonsCopy.foreverCallout.strong}</strong>
          {poisonsCopy.foreverCallout.after}
        </Callout>
      </div>

      <div className="mt-[18px] grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,196px),1fr))]">
        {poisons.map((p) => (
          <article key={p.name} className="panel flex flex-col p-[16px]">
            <div className="flex gap-[14px]">
              <Vial p={p} />
              <div className="min-w-0">
                <h3 className="t-card-sub text-ink">{p.name}</h3>
                <div className="t-eyebrow mt-[4px] text-[9px] tracking-[.13em]" style={{ color: p.hue }}>
                  {p.where}
                </div>
              </div>
            </div>

            <p className="mt-[12px] flex-1 text-[12px] leading-[1.55] text-mute">{p.note}</p>

            <div className="mt-[12px]">
              <span
                className="t-eyebrow rounded-[4px] px-[7px] py-[2px] text-[9px] tracking-[.12em]"
                style={tagStyle[p.tag]}
              >
                {p.tag}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
