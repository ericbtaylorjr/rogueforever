import { useEffect, useState } from 'react';
import { rankedBuilds, specDetail } from '../../content/content';
import { talents as copy } from '../../content/copy';
import type { TalentVariant } from '../../content/types';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { BUILD_CARD_ID, BuildList, useActiveBuild } from '../ui/BuildList';
import { Callout } from '../ui/Callout';
import { Droplet } from '../ui/Droplet';
import { SectionHeading } from '../ui/SectionHeading';

const TOTAL_POINTS = 51;

/**
 * Point split, key talents and a calculator link for one build. Used for both
 * the level 60 and the leveling card. `total` is the points available at the
 * build's level; bars default to the build's own total.
 */
function BuildCard({
  title,
  variant,
  total,
}: {
  title: string;
  variant: TalentVariant;
  total?: number;
}) {
  const { tone } = useTheme();
  const points = total ?? variant.talents.reduce((n, t) => n + t.pts, 0);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [variant]);

  const trees = variant.talents;

  return (
    <div className="panel flex flex-col p-[18px]">
      <div className="flex items-baseline justify-between gap-[10px]">
        <span className="t-panel-label text-ink">{title}</span>
      </div>

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

      <>
          <p className="mt-[16px] border-t border-line pt-[14px] text-[12.5px] leading-[1.6] text-mute">
            {variant.talentNote}
          </p>
          <ul className="mt-[12px] flex flex-1 flex-col gap-[8px]">
            {variant.keyTalents.map((k) => (
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
          {variant.link && (
            <a
              href={variant.link}
              target="_blank"
              rel="noreferrer"
              className="mt-[14px] text-[12.5px] font-semibold text-accent underline underline-offset-2"
            >
              {copy.calculator}
            </a>
          )}
      </>
    </div>
  );
}

export function Talents() {
  const { spec, sweaty } = useHandbook();
  const { talentVariants } = specDetail[spec];
  const active = useActiveBuild(spec);

  return (
    <section id="talents" aria-label="Talents">
      <SectionHeading id="talents" scope="spec" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">{copy.intro}</p>

      <h3 className="t-card-sub mt-[20px] text-ink">{copy.endgameTitle}</h3>
      {talentVariants.length > 0 && (
        <div className="mt-[12px]">
          <BuildList
            builds={rankedBuilds.filter((b) => b.spec === spec)}
            label={copy.buildsLabel}
          />
        </div>
      )}
      {active && sweaty && (
        <div className="mt-[12px]">
          <Callout tone="accent" label={copy.murderTip.label} icon={<Droplet size={8} title="" />}>
            {copy.murderTip.text}
          </Callout>
        </div>
      )}
      {active ? (
        <div className="mt-[12px]" id={BUILD_CARD_ID}>
          <BuildCard title={active.name} variant={active} total={TOTAL_POINTS} />
        </div>
      ) : (
        <p className="mt-[6px] max-w-[70ch] text-[13.5px] leading-[1.6] text-mute">{copy.endgamePending}</p>
      )}
    </section>
  );
}
