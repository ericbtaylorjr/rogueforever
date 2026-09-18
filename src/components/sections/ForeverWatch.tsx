import { foreverCatCount, foreverCats, foreverChanges, foreverDates } from '../../content/content';
import { forever } from '../../content/copy';
import type { ForeverStatus } from '../../content/types';
import { useCompendium } from '../../state/CompendiumProvider';
import { useTheme } from '../../state/ThemeProvider';
import { FilterPill } from '../ui/Pill';
import { SectionHeading } from '../ui/SectionHeading';

/**
 * The status taxonomy is the point of this section: only `Confirmed` reads as
 * fact. Keep the three treatments visually distinct.
 */
const statusStyle: Record<ForeverStatus, React.CSSProperties> = {
  Confirmed: {
    border: '1px solid rgba(var(--venom-rgb),.4)',
    background: 'rgba(var(--venom-rgb),.15)',
    color: 'var(--venom)',
  },
  'Demo footage': {
    border: '1px solid rgba(var(--amber-rgb),.38)',
    background: 'rgba(var(--amber-rgb),.12)',
    color: 'var(--amber)',
  },
  'Not published': { border: '1px solid var(--line)', color: 'var(--faint)' },
  Partial: { border: '1px solid var(--line)', color: 'var(--faint)' },
};

export function ForeverWatch() {
  const { foreverFilter, setForeverFilter } = useCompendium();
  const { tone } = useTheme();
  const shown = foreverChanges.filter((c) => foreverFilter === 'All' || c.cat === foreverFilter);

  return (
    <section id="forever" aria-label="Forever watch">
      <SectionHeading id="forever" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">{forever.intro}</p>

      <div className="mt-[18px] grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,164px),1fr))]">
        {foreverDates.map((d) => (
          <div key={d.label} className="panel px-[15px] py-[14px]">
            <div className="t-eyebrow text-[9px] text-faint">{d.label}</div>
            <div className="t-num mt-[7px] text-[17px]" style={{ color: tone(d.color) }}>
              {d.val}
            </div>
            <div className="mt-[5px] text-[11px] leading-[1.45] text-faint">{d.note}</div>
          </div>
        ))}
      </div>

      <div
        role="group"
        aria-label="Filter changes by category"
        className="mt-[20px] flex flex-wrap gap-[8px]"
      >
        {foreverCats.map((cat) => (
          <FilterPill
            key={cat}
            label={cat}
            count={foreverCatCount(cat)}
            tone="sky"
            selected={foreverFilter === cat}
            onSelect={() => setForeverFilter(cat)}
          />
        ))}
      </div>

      <div className="mt-[16px] flex flex-col gap-[12px]">
        {shown.map((c) => (
          <article
            key={c.title}
            className="sheet px-[16px] py-[14px]"
            style={{
              borderLeft: `2px solid ${tone(c.hue, 3)}`,
              borderRadius: '0 12px 12px 0',
              background: 'var(--panel)',
            }}
          >
            <div className="flex flex-wrap items-center gap-[10px]">
              <h3
                className="text-ink"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontStretch: '84%',
                  fontSize: 15.5,
                }}
              >
                {c.title}
              </h3>
              <span
                className="t-eyebrow rounded-[4px] px-[7px] py-[2px] text-[9px] tracking-[.12em]"
                style={statusStyle[c.status]}
              >
                {c.status}
              </span>
            </div>

            <p className="mt-[8px] max-w-[88ch] text-[13px] leading-[1.6] text-prose">{c.body}</p>

            <p className="mt-[8px] max-w-[88ch] text-[12.5px] leading-[1.55] text-mute">
              <span className="font-semibold" style={{ color: tone(c.hue) }}>
                {forever.impactPrefix}
              </span>{' '}
              {c.impact}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
