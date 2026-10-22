import { useEffect, useState } from 'react';
import { buildsFor } from '../../content/builds';
import { talents as copy } from '../../content/copy';
import type { Build } from '../../content/types';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { BUILD_CARD_ID, BuildList } from '../ui/BuildList';
import { SectionHeading } from '../ui/SectionHeading';
import { Tip } from '../ui/Tip';

const TOTAL_POINTS = 51;

/**
 * Point split, key talents and a calculator link for one build. Level 60 bars are
 * out of the 51 points available at 60; leveling bars use the build's own total.
 * A build with no talents or note yet says so instead.
 */
function BuildCard({ build }: { build: Build }) {
  const { tone } = useTheme();
  const total = build.phase === 'endgame' ? TOTAL_POINTS : undefined;
  const points = total ?? build.talents.reduce((n, t) => n + t.pts, 0);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [build]);

  const trees = build.talents;
  const pending = !trees.length && !build.talentNote;

  return (
    <div className="panel flex flex-col p-[18px]">
      <div className="flex items-baseline justify-between gap-[10px]">
        <span className="t-panel-label text-ink">{build.name}</span>
      </div>

      {pending && (
        <p className="mt-[10px] max-w-[70ch] text-[13px] leading-[1.6] text-mute">{copy.buildPending}</p>
      )}

      {trees.length > 0 && (
        <div className="mt-[16px] grid grid-cols-3 gap-[12px]">
          {trees.map((t) => (
            <div key={t.name}>
              <div
                className="t-num text-[26px] leading-none"
                style={{ color: tone(t.color) }}
              >
                {t.pts}
              </div>
              <div className="mt-[6px] text-[11px] text-faint">{t.name}</div>
              <div
                className="mt-[8px] h-[4px] overflow-hidden rounded-full"
                style={{ background: 'rgba(var(--fg-rgb),.06)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: grown && points ? `${(t.pts / points) * 100}%` : '0%',
                    background: tone(t.color, 3),
                    transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {build.talentNote && (
        <p
          className={`text-[12.5px] leading-[1.6] text-mute ${
            trees.length ? 'mt-[16px] border-t border-line pt-[14px]' : 'mt-[10px]'
          }`}
        >
          {build.talentNote}
        </p>
      )}
      <ul className="mt-[12px] flex flex-1 flex-col gap-[8px] empty:hidden">
        {build.keyTalents.map((k) => (
          <li key={k} className="flex items-baseline gap-[9px] text-[12.5px] leading-[1.5] text-prose">
            <span
              aria-hidden="true"
              className="mt-[6px] size-[4px] shrink-0 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
            {k}
          </li>
        ))}
      </ul>
      {build.link && (
        <a
          href={build.link}
          target="_blank"
          rel="noreferrer"
          className="mt-[14px] text-[12.5px] font-semibold text-accent underline underline-offset-2"
        >
          {copy.calculator}
        </a>
      )}
    </div>
  );
}

export function Talents() {
  const { spec, build } = useHandbook();
  const list = buildsFor(spec);
  const endgame = list.filter((b) => b.phase === 'endgame');
  const leveling = list.filter((b) => b.phase === 'leveling');

  return (
    <section id="talents" aria-label="Talents">
      <SectionHeading id="talents" scope="spec" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">{copy.intro}</p>

      {/* Side by side once there's room; stacked on narrow screens. */}
      <div className="mt-[20px] grid gap-x-[18px] gap-y-[20px] stack:grid-cols-2">
        {endgame.length > 0 && (
          <div>
            <h3 className="t-card-sub text-ink">{copy.endgameTitle}</h3>
            <div className="mt-[12px]">
              <BuildList builds={endgame} label={copy.buildsLabel} stay />
            </div>
          </div>
        )}
        {leveling.length > 0 && (
          <div>
            <h3 className="t-card-sub text-ink">{copy.levelingTitle}</h3>
            <div className="mt-[12px]">
              <BuildList builds={leveling} label={copy.levelingLabel} stay />
            </div>
          </div>
        )}
      </div>
      <div className="mt-[16px]" id={BUILD_CARD_ID}>
        <BuildCard build={build} />
      </div>
      {/* Below the card, so switching to a leveling build (no tip) doesn't move the card. */}
      {build.phase === 'endgame' && (
        <div className="mt-[16px] empty:hidden">
          <Tip sweaty>
            {copy.murderTip}
          </Tip>
        </div>
      )}
    </section>
  );
}
