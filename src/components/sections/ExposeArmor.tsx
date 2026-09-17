import { exposeArmor as copy } from '../../content/copy';
import { Callout } from '../ui/Callout';
import { SectionHeading } from '../ui/SectionHeading';

const toneVar: Record<string, string> = {
  accent: 'var(--accent)',
  mute: 'var(--mute)',
  faint: 'var(--faint)',
};

export function ExposeArmor() {
  return (
    <section id="iea" aria-label="Expose Armor duty">
      <SectionHeading id="iea" tone="var(--warn)" />

      <div className="grid gap-[14px] stack:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
        <div>
          <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">
            {copy.p1.before}
            <em className="not-italic font-semibold text-ink">{copy.p1.strong}</em>
            {copy.p1.after}
          </p>
          <p className="mt-[12px] max-w-[70ch] text-[13.5px] leading-[1.6] text-mute">{copy.p2}</p>

          <div className="mt-[18px] grid gap-[10px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,128px),1fr))]">
            {copy.stats.map((s) => (
              <div key={s.val} className="panel rounded-[11px] px-[15px] py-[14px]">
                <div className="t-num text-[22px] leading-none" style={{ color: toneVar[s.tone] }}>
                  {s.val}
                </div>
                <div className="mt-[7px] text-[11px] leading-[1.45] text-faint">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-[18px]">
          <span className="t-panel-label text-ink">{copy.stepsTitle}</span>

          <ol className="mt-[14px] flex flex-col gap-[12px]">
            {copy.steps.map((text, i) => (
              <li key={i} className="flex items-baseline gap-[11px]">
                <span
                  aria-hidden="true"
                  className="t-num grid size-[22px] shrink-0 place-items-center rounded-[7px] text-[11px]"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                >
                  {i + 1}
                </span>
                <span className="text-[12.5px] leading-[1.6] text-prose">{text}</span>
              </li>
            ))}
          </ol>

          <div className="mt-[16px]">
            <Callout tone="warn">
              {copy.warn.before}
              <strong className="font-semibold text-warn">{copy.warn.strong}</strong>
              {copy.warn.after}
            </Callout>
          </div>
        </div>
      </div>
    </section>
  );
}
