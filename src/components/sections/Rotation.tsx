import { specById } from '../../content/content';
import type { Rotation as RotationData } from '../../content/types';
import { rotation as copy } from '../../content/copy';
import { wowsimsLink } from '../../content/links';
import { useHandbook, useShownBuild } from '../../state/HandbookProvider';
import { Droplet } from '../ui/Droplet';
import { GameIcon } from '../ui/GameIcon';
import { LinkedText } from '../ui/LinkedText';
import { SectionHeading } from '../ui/SectionHeading';
import { WowheadText, firstWowheadName } from '../ui/WowheadText';

/** The icon of the spell or item an opener step presses, if it names one. */
function OpenerIcon({ text }: { text: string }) {
  const name = firstWowheadName(text);
  return name ? <GameIcon name={name} size={16} /> : null;
}

/** Opener, the repeating rotation and pro tips, once a build has any of them. */
function RotationDetail({ d, sweaty }: { d: RotationData; sweaty: boolean }) {
  const tips = d.tips.filter((t) => sweaty || !t.sweaty);
  return (
    <>
      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">
        <LinkedText text={copy.intro} links={wowsimsLink} />
      </p>

      <div className="mt-[18px] grid gap-[14px] stack:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-[14px]">
          <div className="panel p-[18px]">
            <span className="t-panel-label text-ink">{copy.openerTitle}</span>
            {d.opener.length > 0 && (
              <ol className="mt-[14px] flex flex-wrap gap-[8px]">
                {d.opener.map((o, i) => (
                  <li
                    key={o}
                    className="flex items-center gap-[8px] rounded-[8px] border border-line px-[10px] py-[7px] text-[12.5px] text-prose"
                  >
                    <span className="t-num text-[10.5px] text-accent">{i + 1}</span>
                    <OpenerIcon text={o} />
                    <span>
                      <WowheadText text={o} />
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {d.steps.length > 0 && (
            <div className="panel px-[18px] pt-[18px] pb-[14px]">
              <span className="t-panel-label text-ink">{copy.stepsTitle}</span>
              <ol className="mt-[6px]">
                {d.steps.map((s, i) => (
                  <li
                    key={s.press}
                    className="flex items-center gap-[12px] py-[11px]"
                    style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(var(--fg-rgb),.05)' }}
                  >
                    <span className="t-num shrink-0 text-[12px] text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <GameIcon name={s.press} size={22} />
                    <span className="min-w-0">
                      <span className="text-[14.5px] font-semibold text-ink">
                        <WowheadText text={s.press} />
                      </span>
                      {s.note && (
                        <span className="mt-[3px] block text-[12.5px] leading-[1.55] text-mute">
                          <WowheadText text={s.note} />
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-[4px] text-[12.5px] italic text-faint">{copy.repeat}</p>
            </div>
          )}
        </div>

        <div
          className="sheet self-start rounded-[14px] p-[18px]"
          style={{ border: '1px solid rgba(var(--accent-rgb),.22)', background: 'var(--panel)' }}
        >
          <span className="t-panel-label text-accent">{copy.tipsTitle}</span>
          {tips.length > 0 && (
            <ul className="mt-[12px] flex flex-col gap-[10px]">
              {tips.map((t) => (
                <li key={t.text} className="flex items-baseline gap-[9px] text-[12.5px] leading-[1.55] text-prose">
                  {t.sweaty ? (
                    <Droplet size={7} className="translate-y-[1px]" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="mt-[6px] size-[4px] shrink-0 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                  <span>
                    <WowheadText text={t.text} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export function Rotation() {
  const { sweaty } = useHandbook();
  const build = useShownBuild();
  const { spec } = build;
  const d = build.rotation;
  const hasData = d.opener.length > 0 || d.steps.length > 0 || d.tips.length > 0;

  return (
    <section id="rotation" aria-label="Rotation">
      <SectionHeading id="rotation" scope="spec" />

      {!hasData ? (
        <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute" aria-live="polite">
          <LinkedText text={copy.pending.replace('{spec}', `${specById[spec].name} ${build.name}`)} links={wowsimsLink} />
        </p>
      ) : (
        <RotationDetail d={d} sweaty={sweaty} />
      )}
    </section>
  );
}
