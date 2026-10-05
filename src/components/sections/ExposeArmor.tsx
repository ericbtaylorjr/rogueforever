import { Fragment } from 'react';
import { exposeArmor as copy } from '../../content/copy';
import { Callout } from '../ui/Callout';
import { GameIcon } from '../ui/GameIcon';
import { SectionHeading } from '../ui/SectionHeading';

export function ExposeArmor() {
  return (
    <section id="iea" aria-label="Expose Armor">
      <SectionHeading id="iea" scope="all" />

      <div className="grid gap-[14px] stack:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
        <div>
          <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">
            {copy.p1.before}
            <em className="not-italic font-semibold text-ink">{copy.p1.strong}</em>
            {copy.p1.after}
          </p>
          <p className="mt-[12px] max-w-[70ch] text-[13.5px] leading-[1.6] text-mute">{copy.p2}</p>

          {/* Both debuffs land on the same number, so show them as an equation, not two tiles. */}
          <div className="panel-inner mt-[18px] flex flex-wrap items-center gap-x-[16px] gap-y-[10px] px-[16px] py-[13px]">
            {copy.stats.map((st, i) => (
              <Fragment key={st.label}>
                {i > 0 && (
                  <span aria-hidden="true" className="t-num text-[18px] text-faint">
                    =
                  </span>
                )}
                <span className="flex items-center gap-[10px]">
                  <GameIcon name={st.icon} size={30} />
                  <span>
                    <span className="t-num block text-[19px] leading-none text-ink">{st.val}</span>
                    <span className="mt-[4px] block text-[11.5px] text-faint">{st.label}</span>
                  </span>
                </span>
              </Fragment>
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
