import { useEffect, useState } from 'react';
import { gearSlots, specById } from '../../content/content';
import { gear as copy } from '../../content/copy';
import {
  factionColor,
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
import { SegmentedTabs, Tag } from '../ui/Pill';
import { SectionHeading } from '../ui/SectionHeading';
import { useTooltip } from '../ui/Tooltip';

const GRID = '104px minmax(0,1.5fr) minmax(0,1fr) 84px';
const LEVELING_GRID = '62px 92px minmax(0,1.5fr) minmax(0,1fr) 88px';

/** Diagonal-hatch stand-in until item icons are sourced. See README > Assets. */
function IconPlaceholder() {
  return (
    <span
      aria-hidden="true"
      className="size-[22px] shrink-0 rounded-[4px] border border-line"
      style={{
        background:
          'repeating-linear-gradient(135deg, rgba(var(--fg-rgb),.07) 0 2px, transparent 2px 6px)',
      }}
    />
  );
}

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
      <IconPlaceholder />
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
      <span role="rowheader" className="t-eyebrow text-[10px] tracking-[.12em] text-faint">
        {slot}
      </span>

      {item ? (
        <div role="cell" className="min-w-0">
          <ItemLink item={item} />
        </div>
      ) : (
        <span role="cell" className="flex min-w-0 items-center gap-[10px]">
          <IconPlaceholder />
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
        <span className="t-eyebrow text-[9px] text-faint">{copy.leveling.statsMeta}</span>
      </div>

      <p
        className="mt-[14px] flex flex-wrap items-baseline gap-x-[10px] gap-y-[4px] text-[19px] font-bold leading-tight"
        aria-label={stats.map((st) => `${st.op ? `${st.op === '>' ? 'then' : 'equal to'} ` : ''}${st.stat}`).join(' ')}
      >
        {stats.map((st, i) => (
          <span key={st.stat} aria-hidden="true" className="flex items-baseline gap-[10px]">
            {st.op && <span className="t-num text-[15px] text-faint">{st.op}</span>}
            <span style={i === 0 ? { color: tone(s.color), textShadow: 'var(--glow)' } : { color: 'var(--ink)' }}>
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
      <span role="cell" className="t-eyebrow truncate text-[10px] tracking-[.12em] text-faint">
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

function LevelingPanel() {
  const { spec } = useHandbook();
  const items = levelingItems[spec];
  const c = copy.leveling.cols;

  return (
    <div id="panel-leveling" role="tabpanel" aria-labelledby="tab-leveling" className="mt-[16px] flex flex-col gap-[16px]">
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
                  className="t-eyebrow text-[9px] tracking-[.14em] text-faint"
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

  return (
    <section id="gear" aria-label="Gear">
      <SectionHeading id="gear" scope="spec" />

      <div className="flex flex-wrap items-center gap-[12px]">
        <SegmentedTabs
          tabs={copy.tabs as unknown as { id: string; label: string }[]}
          value={gearSet}
          onChange={(id) => setGearSet(id as GearSetId)}
          label="Gear list"
        />
        <button
          type="button"
          disabled
          className="ml-auto cursor-not-allowed text-[12.5px] font-semibold text-mute opacity-50"
        >
          {copy.simsLink}
        </button>
      </div>

      <div className="mt-[16px]">
        {gearSet === 'leveling' ? (
          <Callout tone="accent" dashed label={copy.todoLabel}>
            {copy.leveling.todo.before}
            <strong className="font-semibold text-accent">{copy.leveling.todo.strong}</strong>
            {copy.leveling.todo.after}
          </Callout>
        ) : (
          <Callout tone="accent" dashed label={copy.todoLabel}>
            {copy.todo}
          </Callout>
        )}
      </div>

      {gearSet === 'leveling' ? (
        <LevelingPanel />
      ) : (
        <div
          id={`panel-${gearSet}`}
          role="tabpanel"
          aria-labelledby={`tab-${gearSet}`}
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
                <span
                  key={c}
                  role="columnheader"
                  className="t-eyebrow text-[9px] tracking-[.14em] text-faint"
                >
                  {c}
                </span>
              ))}
            </div>
            {gearSlots.map((slot) => (
              <GearRow key={slot} slot={slot} set={gearSet} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
