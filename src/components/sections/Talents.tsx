import { memo, useEffect, useState } from 'react';
import { buildsFor } from '../../content/builds';
import { points as treePoints } from '../../content/builds/shared';
import { specById } from '../../content/content';
import { talents as copy } from '../../content/copy';
import type { Build } from '../../content/types';
import { decodeTalentLink, decodeTalentOrder } from '../../lib/talentCalc';
import { useHandbook, useShownBuild } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { BUILD_CARD_ID, BuildList } from '../ui/BuildList';
import { SectionHeading } from '../ui/SectionHeading';
import { TalentOrder, TalentPreview } from '../ui/TalentTree';
import { Tip } from '../ui/Tip';

const TOTAL_POINTS = 51;

/**
 * Point split, key talents and a calculator link for one build. The talent trees come
 * from the calculator link; leveling builds also list its talent order. Without a link,
 * the build's own point split shows as bars. A build with no talents or note yet says so instead.
 */
const BuildCard = memo(function BuildCard({ build }: { build: Build }) {
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
  const ranks = decodeTalentLink(build.link);
  const order = build.phase === 'leveling' ? decodeTalentOrder(build.link) : null;
  // Leveling builds don't list a point split; the trees still want their colours.
  const colors = trees.length ? trees : treePoints(0, 0, 0);

  return (
    <div className="panel flex flex-col p-[18px]">
      <div className="flex items-baseline justify-between gap-[10px]">
        <h3 className="t-panel-label text-ink">
          {specById[build.spec].name} {build.name}
        </h3>
      </div>

      {build.talentNote && (
        <p className="mt-[10px] max-w-[70ch] text-[12.5px] leading-[1.6] text-mute">{build.talentNote}</p>
      )}

      {pending && (
        <p className="mt-[10px] max-w-[70ch] text-[13px] leading-[1.6] text-mute">{copy.buildPending}</p>
      )}

      {ranks && (
        <div className="mt-[16px]">
          {/* Keyed so a new build starts on its own main tree. */}
          <TalentPreview key={`${build.spec}-${build.id}`} ranks={ranks} colors={colors} />
        </div>
      )}

      {order && <TalentOrder key={`${build.spec}-${build.id}`} steps={order} colors={colors} />}

      {!ranks && trees.length > 0 && (
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
});

export function Talents() {
  const { spec } = useHandbook();
  // The lists show a pick straight away; the card below follows a frame later (useShownBuild).
  const build = useShownBuild();
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
              <BuildList builds={endgame} label={copy.buildsLabel} />
            </div>
          </div>
        )}
        {leveling.length > 0 && (
          <div>
            <h3 className="t-card-sub text-ink">{copy.levelingTitle}</h3>
            <div className="mt-[12px]">
              <BuildList builds={leveling} label={copy.levelingLabel} />
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
