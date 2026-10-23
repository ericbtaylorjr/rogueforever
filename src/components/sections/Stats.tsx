import { useEffect, useState } from 'react';
import { specById } from '../../content/content';
import { stats as copy } from '../../content/copy';
import { wowsimsLink } from '../../content/links';
import type { StatWeight } from '../../content/types';
import { useShownBuild } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { LinkedText } from '../ui/LinkedText';
import { SectionHeading } from '../ui/SectionHeading';
import { Tip } from '../ui/Tip';

/** Stamina sims to 0 EP, which reads as worthless; show it as a token 0.01 instead. */
const displayEp = ({ stat, ep }: StatWeight) => (stat === 'Stamina' && ep === 0 ? 0.01 : ep);

function StatPriorityPanel() {
  const build = useShownBuild();
  const { tone } = useTheme();
  const { stats, relativeTo } = build.stats;
  const maxEp = Math.max(...stats.map((st) => st.ep));
  const s = specById[build.spec];
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [build]);

  return (
    <div className="panel p-[18px]">
      <div className="flex flex-wrap items-baseline justify-between gap-[10px]">
        <span className="t-panel-label text-ink">{copy.statsTitle}</span>
        <span className="text-[12px] text-faint">{copy.statsMeta} {relativeTo}</span>
      </div>

      <p className="mt-[14px] flex flex-wrap items-baseline gap-x-[10px] gap-y-[4px] text-[19px] font-bold leading-tight">
        {/* Screen readers get the priority as words; the symbols below are visual only. */}
        <span className="sr-only">
          {stats.map((st) => `${st.op ? `${st.op === '>' ? 'then' : 'equal to'} ` : ''}${st.stat}`).join(' ')}
        </span>
        {stats.map((st) => (
          <span key={st.stat} aria-hidden="true" className="flex items-baseline gap-[10px]">
            {st.op && <span className="t-num text-[15px] text-faint">{st.op}</span>}
            <span className="text-ink">{st.stat}</span>
          </span>
        ))}
      </p>

      <ul className="mt-[16px] flex flex-col gap-[10px] border-t border-line pt-[14px]">
        {stats.map((st) => (
          <li
            key={st.stat}
            className="grid items-center gap-[12px]"
            style={{ gridTemplateColumns: '140px minmax(0,1fr) 48px' }}
          >
            <span className="truncate text-[12.5px] text-prose">{st.stat}</span>
            <span
              className="h-[6px] overflow-hidden rounded-full"
              style={{ background: 'rgba(var(--fg-rgb),.06)' }}
              aria-hidden="true"
            >
              <span
                className="block h-full rounded-full"
                style={{
                  width: grown ? `${(displayEp(st) / maxEp) * 100}%` : '0%',
                  background: `linear-gradient(90deg, ${tone(s.color2, 3)}, ${tone(s.color, 3)})`,
                  transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
                }}
              />
            </span>
            <span className="t-num text-right text-[12.5px] text-ink">
              {displayEp(st).toFixed(2)}
              <span className="sr-only"> {copy.epLabel}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Stats() {
  return (
    <section id="stats" aria-label="Stats">
      <SectionHeading id="stats" scope="spec" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">
        <LinkedText text={copy.intro} links={wowsimsLink} />
      </p>

      <div className="mt-[16px]">
        <StatPriorityPanel />
      </div>

      <div className="mt-[14px]">
        <Tip>{copy.placeholderTip}</Tip>
      </div>
    </section>
  );
}
