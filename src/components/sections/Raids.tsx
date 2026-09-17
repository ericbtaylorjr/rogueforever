import { raids } from '../../content/content';
import { raidsCopy as copy } from '../../content/copy';
import { useCompendium } from '../../state/CompendiumProvider';
import { Callout } from '../ui/Callout';
import { Tag } from '../ui/Pill';
import { SectionHeading } from '../ui/SectionHeading';

export function Raids() {
  const { openRaid, toggleRaid } = useCompendium();

  return (
    <section id="raid" aria-label="Raids">
      <SectionHeading id="raid" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">{copy.intro}</p>

      <div className="mt-[18px] flex flex-col gap-[12px]">
        {raids.map((r, i) => {
          const open = openRaid === i;
          const panelId = `raid-panel-${i}`;
          return (
            <article
              key={r.name}
              className="overflow-hidden rounded-[14px]"
              style={{
                border: `1px solid ${open ? 'rgba(255,244,104,.34)' : 'var(--line)'}`,
                background: 'var(--panel)',
              }}
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggleRaid(i)}
                  className="flex w-full items-center gap-[14px] p-[16px] text-left"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-[42px] shrink-0 place-items-center rounded-[10px]"
                    style={{
                      background: `linear-gradient(140deg, ${r.hue}, #0A0A0C)`,
                      fontFamily: 'var(--font-display)',
                      fontWeight: 900,
                      fontStretch: '80%',
                      fontSize: 13,
                      color: 'var(--ink)',
                    }}
                  >
                    {r.abbr}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-[10px]">
                      <span
                        className="text-ink"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 900,
                          fontStretch: '76%',
                          fontSize: 22,
                          lineHeight: 1.05,
                          textTransform: 'uppercase',
                        }}
                      >
                        {r.name}
                      </span>
                      <Tag>{r.tag}</Tag>
                    </span>
                    <span className="mt-[4px] block text-[12px] leading-[1.5] text-faint">
                      {r.summary}
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className="shrink-0 text-[15px] text-faint transition-transform duration-[220ms]"
                    style={{ transform: open ? 'rotate(180deg)' : 'none' }}
                  >
                    ⌄
                  </span>
                </button>
              </h3>

              {open && (
                <div id={panelId} className="animate-rise border-t border-line p-[16px]">
                  <Callout tone="warn" label={copy.prepLabel}>
                    {r.prep}
                  </Callout>

                  <div className="mt-[14px] grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,268px),1fr))]">
                    {r.phases.map((p) => (
                      <div key={p.n} className="panel-inner p-[15px]">
                        <span className="t-eyebrow text-[9.5px] tracking-[.14em] text-accent">
                          {p.n}
                        </span>
                        <ul className="mt-[10px] flex flex-col gap-[8px]">
                          {p.lines.map((l) => (
                            <li
                              key={l}
                              className="flex items-baseline gap-[9px] text-[12.5px] leading-[1.55] text-prose"
                            >
                              <span
                                aria-hidden="true"
                                className="mt-[6px] size-[4px] shrink-0 rounded-full"
                                style={{ background: r.hue }}
                              />
                              {l}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
