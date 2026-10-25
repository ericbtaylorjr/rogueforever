import { guide, guideCatCount, guideCats } from '../../content/content';
import { newToRogue } from '../../content/copy';
import { links } from '../../content/links';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { FilterPill } from '../ui/Pill';
import { WowheadText } from '../ui/WowheadText';
import { SectionHeading } from '../ui/SectionHeading';

/** Phrases in entry text that link out, or (Comfy's UI) scroll to the section that covers them. */
const external: Record<string, string> = {
  WarcraftLogs: links.warcraftlogs,
  WoWSims: links.wowsims,
};
const internal: Record<string, string> = { "Comfy's UI": 'tools' };
const phrasePattern = new RegExp(`(${[...Object.keys(external), ...Object.keys(internal)].join('|')})`);
const linkClass = 'text-accent underline underline-offset-2';

function Linked({ text, wowhead }: { text: string; wowhead?: boolean }) {
  const { jump } = useHandbook();
  return (
    <>
      {text.split(phrasePattern).map((part, i) =>
        external[part] ? (
          <a key={i} href={external[part]} target="_blank" rel="noreferrer" className={linkClass}>
            {part}
          </a>
        ) : internal[part] ? (
          <a
            key={i}
            href={`#${internal[part]}`}
            onClick={(e) => {
              e.preventDefault();
              jump(internal[part]);
            }}
            className={linkClass}
          >
            {part}
          </a>
        ) : wowhead ? (
          <WowheadText key={i} text={part} />
        ) : (
          part
        ),
      )}
    </>
  );
}

export function NewToRogue() {
  const { guideFilter, setGuideFilter } = useHandbook();
  const { tone } = useTheme();
  const shown = guide.filter((c) => guideFilter === 'All' || c.cat === guideFilter);

  return (
    <section id="new-to-rogue" aria-label="New to Rogue?">
      <SectionHeading id="new-to-rogue" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">{newToRogue.intro}</p>

      <div
        role="group"
        aria-label="Filter entries by category"
        className="mt-[20px] flex flex-wrap gap-[8px]"
      >
        {guideCats.map((cat) => (
          <FilterPill
            key={cat}
            label={cat}
            count={guideCatCount(cat)}
            selected={guideFilter === cat}
            onSelect={() => setGuideFilter(cat)}
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
            <h3 className="t-card-sub text-ink">{c.title}</h3>

            <p className="mt-[8px] max-w-[88ch] text-[13px] leading-[1.6] text-prose"><Linked text={c.body} wowhead={c.wowhead} /></p>

            {c.impact && (
              <p className="mt-[8px] max-w-[88ch] text-[12.5px] leading-[1.55] text-mute">
                <span className="font-semibold" style={{ color: tone(c.hue) }}>
                  {newToRogue.impactPrefix}
                </span>{' '}
                <Linked text={c.impact} />
              </p>
            )}

            {/* Links get vertical padding so each is a 24px tap target even when they wrap (WCAG 2.5.8). */}
            {c.sources.length > 0 && (
              <p className="mt-[6px] flex flex-wrap items-baseline gap-x-[12px] text-[11px]">
                <span className="text-faint">{newToRogue.sourcesLabel}</span>
                {c.sources.map((src) => (
                  <a
                    key={src.url}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block py-[4px] text-sky underline underline-offset-2"
                  >
                    {src.label} ↗
                  </a>
                ))}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
