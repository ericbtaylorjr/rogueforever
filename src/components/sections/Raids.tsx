import { useState } from 'react';
import { raids } from '../../content/content';
import { raidsCopy as copy } from '../../content/copy';
import { qualityColor, wowheadUrl } from '../../content/gear';
import type { Encounter, EncounterItem, Raid } from '../../content/types';
import { track } from '../../lib/analytics';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { GameIcon } from '../ui/GameIcon';
import { SectionHeading } from '../ui/SectionHeading';
import { Tip } from '../ui/Tip';
import { useTooltip } from '../ui/Tooltip';

/** A chevron in a ring, centred on the row; it turns over when the panel opens. */
function Caret({ open, size = 26 }: { open: boolean; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full border transition-[transform,color,border-color] duration-[220ms]"
      style={{
        width: size,
        height: size,
        transform: open ? 'rotate(180deg)' : 'none',
        borderColor: open ? 'rgba(var(--accent-rgb),.5)' : 'var(--line)',
        color: open ? 'var(--accent)' : 'var(--faint)',
      }}
    >
      <svg width={size * 0.46} height={size * 0.46} viewBox="0 0 12 12" fill="none">
        <path
          d="M2.5 4.5 6 8l3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ItemRow({ item }: { item: EncounterItem }) {
  const { bind } = useTooltip();
  const { tone } = useTheme();
  return (
    <li>
      <a
        href={wowheadUrl(item.itemId)}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 items-center gap-[10px] text-[13px] font-semibold"
        style={{ color: tone(qualityColor[item.quality]) }}
        {...bind({
          name: item.name,
          kind: 'Item',
          note: item.note,
          wowhead: { kind: 'item', id: item.itemId },
        })}
      >
        <GameIcon name={`item:${item.itemId}`} size={24} />
        <span className="truncate">{item.name}</span>
      </a>
      {item.note && (
        <p className="mt-[3px] pl-[34px] text-[12px] leading-[1.5] text-faint">{item.note}</p>
      )}
    </li>
  );
}

function EncounterCard({
  title,
  hue,
  empty,
  children,
}: {
  title: string;
  hue: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="panel-inner p-[15px]" aria-label={title}>
      <h6 className="flex items-center gap-[8px] text-[12.5px] font-semibold text-ink">
        <span
          aria-hidden="true"
          className="size-[6px] shrink-0 rounded-full"
          style={{ background: hue }}
        />
        {title}
      </h6>
      <div className="mt-[10px]">
        {empty ? (
          <p className="text-[12.5px] italic leading-[1.55] text-faint">{copy.soon}</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function EncounterPanel({ e, hue }: { e: Encounter; hue: string }) {
  const bullets = (lines: string[]) => (
    <ul className="flex flex-col gap-[8px]">
      {lines.map((l) => (
        <li
          key={l}
          className="flex items-baseline gap-[9px] text-[12.5px] leading-[1.55] text-prose"
        >
          <span
            aria-hidden="true"
            className="mt-[6px] size-[4px] shrink-0 rounded-full"
            style={{ background: hue }}
          />
          {l}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
        <EncounterCard title={copy.strategy} hue={hue} empty={e.strategy.length === 0}>
          <div className="flex flex-col gap-[8px]">
            {e.strategy.map((p) => (
              <p key={p} className="text-[12.5px] leading-[1.6] text-prose">
                {p}
              </p>
            ))}
          </div>
        </EncounterCard>
        <EncounterCard title={copy.tips} hue={hue} empty={e.tips.length === 0}>
          {bullets(e.tips)}
        </EncounterCard>
        <EncounterCard title={copy.drops} hue={hue} empty={e.drops.length === 0}>
          <ul className="flex flex-col gap-[10px]">
            {e.drops.map((i) => (
              <ItemRow key={i.itemId} item={i} />
            ))}
          </ul>
        </EncounterCard>
      </div>
      <EncounterCard title={copy.gear} hue={hue} empty={e.gear.length === 0}>
        <ul className="flex flex-col gap-[10px]">
          {e.gear.map((i) => (
            <ItemRow key={i.itemId} item={i} />
          ))}
        </ul>
      </EncounterCard>
    </div>
  );
}

/** Each encounter opens on its own; the raid's open state lives in the handbook, this one only while the raid is open. */
function Encounters({ raid, id }: { raid: Raid; id: string }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const toggle = (name: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (!n.delete(name)) {
        n.add(name);
        track('encounter_open', { raid: raid.name, encounter: name });
      }
      return n;
    });

  return (
    <div>
      <h4 className="t-panel-label text-ink">
        {copy.encounters} <span className="text-faint">({raid.encounters.length})</span>
      </h4>
      <div className="mt-[10px] flex flex-col gap-[8px]">
        {raid.encounters.map((e, i) => {
          const isOpen = open.has(e.name);
          const panelId = `${id}-enc-${i}`;
          return (
            <div
              key={e.name}
              className="overflow-hidden rounded-[12px]"
              style={{
                border: `1px solid ${isOpen ? 'rgba(var(--accent-rgb),.34)' : 'var(--line)'}`,
                background: 'var(--panel)',
              }}
            >
              <h5>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(e.name)}
                  className="flex w-full items-center gap-[12px] px-[14px] py-[12px] text-left"
                >
                  <span className="t-num w-[22px] shrink-0 text-[11px] text-faint">{i + 1}</span>
                  <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-ink">
                    {e.name}
                  </span>
                  <Caret open={isOpen} />
                </button>
              </h5>
              {isOpen && (
                <div id={panelId} className="animate-rise border-t border-line p-[14px]">
                  <EncounterPanel e={e} hue={raid.hue} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Raids() {
  const { openRaid, toggleRaid } = useHandbook();

  return (
    <section id="raid" aria-label="Raids">
      <SectionHeading id="raid" scope="all" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">{copy.intro}</p>

      <div className="mt-[16px]">
        <Tip>{copy.tip}</Tip>
      </div>

      <div className="mt-[18px] flex flex-col gap-[12px]">
        {raids.map((r, i) => {
          const open = openRaid === i;
          const panelId = `raid-panel-${i}`;
          return (
            <article
              key={r.name}
              className="sheet overflow-hidden rounded-[14px]"
              style={{
                border: `1px solid ${open ? 'rgba(var(--accent-rgb),.34)' : 'var(--line)'}`,
                background: 'var(--panel)',
              }}
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => {
                    if (!open) track('raid_open', { raid: r.name });
                    toggleRaid(i);
                  }}
                  className="flex w-full items-center gap-[14px] p-[16px] text-left"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-[42px] shrink-0 place-items-center rounded-[10px]"
                    style={{
                      background: `linear-gradient(140deg, ${r.hue}, var(--hue-end))`,
                      fontFamily: 'var(--font-brand)',
                      fontWeight: 900,
                      fontStretch: '80%',
                      fontSize: 13,
                      color: 'var(--on-hue)',
                    }}
                  >
                    {r.abbr}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-[10px]">
                      <span className="t-card-title text-ink">{r.name}</span>
                      <span className="text-[12px] text-faint">{r.tag}</span>
                    </span>
                    <span className="mt-[4px] block text-[12px] leading-[1.5] text-faint">
                      {r.summary}
                    </span>
                  </span>

                  <Caret open={open} size={30} />
                </button>
              </h3>

              {open && (
                <div id={panelId} className="animate-rise border-t border-line p-[16px]">
                  {r.phases.length > 0 && (
                    <div className="mb-[18px] grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,268px),1fr))]">
                      {r.phases.map((p) => (
                        <div key={p.n} className="panel-inner p-[15px]">
                          <h4 className="text-[13px] font-semibold text-ink">{p.n}</h4>
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
                  )}

                  <Encounters raid={r} id={panelId} />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
