import { useEffect, useState } from 'react';
import { gearSlots, specById } from '../../content/content';
import { gear as copy } from '../../content/copy';
import {
  factionColor,
  gearSets,
  itemForSlot,
  levelingItems,
  qualityColor,
  statPriority,
  wowheadUrl,
} from '../../content/gear';
import type { Faction, GearItem, GearSetId, LevelingItem } from '../../content/types';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { Callout } from '../ui/Callout';
import { GameIcon } from '../ui/GameIcon';
import { SegmentedTabs, Tag } from '../ui/Pill';
import { SectionHeading } from '../ui/SectionHeading';
import { useTooltip } from '../ui/Tooltip';

const GRID = '104px minmax(0,1.5fr) minmax(0,1fr) 84px';
const LEVELING_GRID = '62px 92px minmax(0,1.5fr) minmax(0,1fr) 88px';

function ItemLink({ item }: { item: Omit<GearItem, 'enchant'> }) {
  const { bind } = useTooltip();
  const { tone } = useTheme();
  return (
    <a
      href={wowheadUrl(item.itemId)}
      target="_blank"
      rel="noreferrer"
      className="flex min-w-0 items-center gap-[10px] text-[13px] font-semibold"
      style={{ color: tone(qualityColor[item.quality]) }}
      {...bind({ name: item.name, kind: item.slot, note: item.source })}
    >
      <GameIcon name={`item:${item.itemId}`} size={24} />
      <span className="truncate">{item.name}</span>
    </a>
  );
}

function GearRow({ slot, set }: { slot: string; set: 'bis' | 'prebis' }) {
  const item = itemForSlot(set, slot);

  return (
    <div
      role="row"
      className="grid items-center border-t border-line px-[14px] py-[11px]"
      style={{ gridTemplateColumns: GRID }}
    >
      <span role="rowheader" className="text-[12.5px] text-faint">
        {slot}
      </span>

      {item ? (
        <div role="cell" className="min-w-0">
          <ItemLink item={item} />
        </div>
      ) : (
        <span role="cell" className="flex min-w-0 items-center gap-[10px]">
          <span className="truncate text-[12.5px] italic text-dim">{copy.empty}</span>
        </span>
      )}

      <span role="cell" className="truncate text-[12px] text-faint">
        {item?.source ?? '—'}
      </span>
      <span role="cell" className="truncate text-[12px] text-faint">
        {item?.enchant ?? '—'}
      </span>
    </div>
  );
}

function StatPriorityPanel() {
  const { spec } = useHandbook();
  const { tone } = useTheme();
  const { stats } = statPriority[spec];
  const s = specById[spec];
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [spec]);

  return (
    <div className="panel p-[18px]">
      <div className="flex flex-wrap items-baseline justify-between gap-[10px]">
        <span className="t-panel-label text-ink">{copy.leveling.statsTitle}</span>
        <span className="text-[12px] text-faint">{copy.leveling.statsMeta}</span>
      </div>

      <p className="mt-[14px] flex flex-wrap items-baseline gap-x-[10px] gap-y-[4px] text-[19px] font-bold leading-tight">
        {/* Screen readers get the priority as words; the symbols below are visual only. */}
        <span className="sr-only">
          {stats.map((st) => `${st.op ? `${st.op === '>' ? 'then' : 'equal to'} ` : ''}${st.stat}`).join(' ')}
        </span>
        {stats.map((st, i) => (
          <span key={st.stat} aria-hidden="true" className="flex items-baseline gap-[10px]">
            {st.op && <span className="t-num text-[15px] text-faint">{st.op}</span>}
            <span style={{ color: i === 0 ? tone(s.color) : 'var(--ink)' }}>
              {st.stat}
            </span>
          </span>
        ))}
      </p>

      <ul className="mt-[16px] flex flex-col gap-[10px] border-t border-line pt-[14px]">
        {stats.map((st) => (
          <li
            key={st.stat}
            className="grid items-center gap-[12px]"
            style={{ gridTemplateColumns: '104px minmax(0,1fr) 48px' }}
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
                  width: grown ? `${st.ep * 100}%` : '0%',
                  background: `linear-gradient(90deg, ${tone(s.color2, 3)}, ${tone(s.color, 3)})`,
                  transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
                }}
              />
            </span>
            <span className="t-num text-right text-[12.5px] text-ink">
              {st.ep.toFixed(2)}
              <span className="sr-only"> {copy.leveling.epLabel}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FactionTag({ faction }: { faction: Faction }) {
  const { tone } = useTheme();
  return <Tag tone={faction === 'Both' ? undefined : tone(factionColor[faction])}>{faction}</Tag>;
}

function LevelingRow({ item }: { item: LevelingItem }) {
  return (
    <div
      role="row"
      className="grid items-center border-t border-line px-[14px] py-[11px]"
      style={{ gridTemplateColumns: LEVELING_GRID }}
    >
      <span role="rowheader" className="t-num text-[15px] text-accent">
        {item.level}
      </span>
      <span role="cell" className="truncate text-[12.5px] text-faint">
        {item.slot}
      </span>
      <div role="cell" className="min-w-0">
        <ItemLink item={item} />
      </div>
      <span role="cell" className="truncate text-[12px] text-faint">
        {item.source}
      </span>
      <span role="cell">
        <FactionTag faction={item.faction} />
      </span>
    </div>
  );
}

/** `tabbed` only when the tab bar is shown, so the tabpanel role always has a tab to point at. */
function LevelingPanel({ tabbed }: { tabbed: boolean }) {
  const { spec } = useHandbook();
  const items = levelingItems[spec];
  const c = copy.leveling.cols;

  return (
    <div
      className="mt-[16px] flex flex-col gap-[16px]"
      {...(tabbed ? { id: 'panel-leveling', role: 'tabpanel', 'aria-labelledby': 'tab-leveling' } : {})}
    >
      <StatPriorityPanel />

      <div className="panel">
        <div className="px-[18px] pt-[16px] pb-[6px]">
          <span className="t-panel-label text-ink">{copy.leveling.itemsTitle}</span>
        </div>
        <div tabIndex={0} className="table-scroll">
          <div role="table" aria-label={copy.leveling.tableLabel} style={{ minWidth: 640 }}>
            <div
              role="row"
              className="grid items-center px-[14px] py-[10px]"
              style={{ gridTemplateColumns: LEVELING_GRID }}
            >
              {[c.level, c.slot, c.item, c.source, c.faction].map((h) => (
                <span
                  key={h}
                  role="columnheader"
                  className="t-eyebrow text-[10.5px] text-faint"
                >
                  {h}
                </span>
              ))}
            </div>
            {items.length ? (
              items.map((item) => <LevelingRow key={`${item.level}-${item.itemId}`} item={item} />)
            ) : (
              <div role="row" className="border-t border-line px-[14px] py-[14px]">
                <span role="cell" className="text-[12.5px] italic text-dim">
                  {copy.leveling.empty}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Gear() {
  const { gearSet, setGearSet } = useHandbook();
  // Only lists that have items get a tab; with just Leveling there is no tab bar at all.
  const tabs = copy.tabs.filter((t) => t.id === 'leveling' || gearSets[t.id as 'bis' | 'prebis'].length);
  const current = tabs.some((t) => t.id === gearSet) ? gearSet : 'leveling';

  return (
    <section id="gear" aria-label="Gear">
      <SectionHeading id="gear" scope="spec" />

      {tabs.length > 1 && (
        <div className="mb-[16px]">
          <SegmentedTabs
            tabs={tabs as unknown as { id: string; label: string }[]}
            value={current}
            onChange={(id) => setGearSet(id as GearSetId)}
            label="Gear list"
          />
        </div>
      )}

      <Callout tone="accent" quiet label={copy.status.label}>
        {copy.status.text}
      </Callout>

      {current === 'leveling' ? (
        <LevelingPanel tabbed={tabs.length > 1} />
      ) : (
        <div
          id={`panel-${current}`}
          role="tabpanel"
          aria-labelledby={`tab-${current}`}
          tabIndex={0}
          className="table-scroll panel mt-[16px]"
        >
          <div role="table" aria-label={copy.tableLabel} style={{ minWidth: 600 }}>
            <div
              role="row"
              className="grid items-center px-[14px] py-[10px]"
              style={{ gridTemplateColumns: GRID }}
            >
              {[copy.cols.slot, copy.cols.item, copy.cols.source, copy.cols.enchant].map((c) => (
                <span key={c} role="columnheader" className="t-eyebrow text-[10.5px] text-faint">
                  {c}
                </span>
              ))}
            </div>
            {gearSlots.map((slot) => (
              <GearRow key={slot} slot={slot} set={current} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
