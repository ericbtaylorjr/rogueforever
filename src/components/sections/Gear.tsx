import { gearSlots } from '../../content/content';
import { gear as copy } from '../../content/copy';
import {
  factionColor,
  gearSets,
  itemForSlot,
  levelingItems,
  qualityColor,
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

function LevelingPanel() {
  const { spec } = useHandbook();
  const items = levelingItems[spec];
  const c = copy.leveling.cols;

  return (
    <div
      className="mt-[16px] flex flex-col gap-[16px]"
      id="panel-leveling"
      role="tabpanel"
      aria-labelledby="tab-leveling"
    >
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
  const { gearSet: current, setGearSet } = useHandbook();

  return (
    <section id="gear" aria-label="Gear">
      <SectionHeading id="gear" scope="spec" />

      <div className="mb-[16px]">
        <SegmentedTabs
          tabs={copy.tabs as unknown as { id: string; label: string }[]}
          value={current}
          onChange={(id) => setGearSet(id as GearSetId)}
          label="Gear list"
        />
      </div>

      {current === 'leveling' ? (
        <>
          <Callout tone="accent" quiet label={copy.status.label}>
            {copy.status.text}
          </Callout>
          <LevelingPanel />
        </>
      ) : !gearSets[current].length ? (
        <div
          id={`panel-${current}`}
          role="tabpanel"
          aria-labelledby={`tab-${current}`}
          className="panel p-[18px]"
        >
          <span className="t-panel-label text-ink">{copy.comingSoon.title}</span>
          <p className="mt-[10px] max-w-[70ch] text-[13px] leading-[1.6] text-prose">{copy.comingSoon.text}</p>
        </div>
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
