import { gearSlots } from '../../content/content';
import { gear as copy } from '../../content/copy';
import { factionColor, levelingBrackets, qualityColor, wowheadUrl } from '../../content/gear';
import type { Faction, GearItem, GearSetId, LevelingItem } from '../../content/types';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { GameIcon } from '../ui/GameIcon';
import { SegmentedTabs, Tag } from '../ui/Pill';
import { SectionHeading } from '../ui/SectionHeading';
import { Tip } from '../ui/Tip';
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
      {...bind({ name: item.name, kind: item.slot, note: item.source, wowhead: { kind: 'item', id: item.itemId } })}
    >
      <GameIcon name={`item:${item.itemId}`} size={24} />
      <span className="truncate">{item.name}</span>
    </a>
  );
}

function GearRow({ slot, items }: { slot: string; items: GearItem[] }) {
  const item = items.find((i) => i.slot === slot);

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

function LevelingHeader() {
  const c = copy.leveling.cols;
  return (
    <div role="row" className="grid items-center px-[14px] py-[10px]" style={{ gridTemplateColumns: LEVELING_GRID }}>
      {[c.level, c.slot, c.item, c.source, c.faction].map((h) => (
        <span key={h} role="columnheader" className="t-eyebrow text-[10.5px] text-faint">
          {h}
        </span>
      ))}
    </div>
  );
}

/** One level range of milestones, e.g. 21–40. Items are already sorted by level. */
function LevelingBracket({ from, to, items }: { from: number; to: number; items: LevelingItem[] }) {
  const range = `${from}–${to}`;

  return (
    <div className="panel">
      <div className="px-[18px] pt-[16px] pb-[6px]">
        <h4 className="t-panel-label text-ink">
          {copy.leveling.bracket} <span className="t-num text-accent">{range}</span>
        </h4>
      </div>
      <div tabIndex={0} className="table-scroll">
        <div role="table" aria-label={`${copy.leveling.tableLabel}, ${copy.leveling.bracket.toLowerCase()} ${range}`} style={{ minWidth: 640 }}>
          <LevelingHeader />
          {items.length ? (
            items.map((item) => <LevelingRow key={`${item.level}-${item.itemId}-${item.slot}`} item={item} />)
          ) : (
            <div role="row" className="border-t border-line px-[14px] py-[14px]">
              <span role="cell" className="text-[12.5px] italic text-dim">
                {copy.leveling.bracketEmpty}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LevelingPanel({ items }: { items: LevelingItem[] }) {
  return (
    <div className="mt-[16px] flex flex-col gap-[16px]">
      {/* Headings, so screen reader users can jump between brackets. */}
      <h3 className="t-panel-label text-ink">{copy.leveling.itemsTitle}</h3>
      {items.length ? (
        levelingBrackets.map(({ from, to }) => (
          <LevelingBracket
            key={from}
            from={from}
            to={to}
            items={items.filter((i) => i.level >= from && i.level <= to)}
          />
        ))
      ) : (
        <div className="panel px-[18px] py-[16px]">
          <span className="text-[12.5px] italic text-dim">{copy.leveling.empty}</span>
        </div>
      )}
    </div>
  );
}

/** Pre-raid BiS and BiS tabs for a level 60 build. A list with no items says it's coming. */
function EndgameGear({ gear }: { gear: Record<GearSetId, GearItem[]> }) {
  const { gearSet: current, setGearSet } = useHandbook();
  const items = gear[current];

  return (
    <>
      <div className="mb-[16px]">
        <SegmentedTabs
          tabs={copy.tabs as unknown as { id: string; label: string }[]}
          value={current}
          onChange={(id) => setGearSet(id as GearSetId)}
          label="Gear list"
        />
      </div>

      {!items.length ? (
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
              <GearRow key={slot} slot={slot} items={items} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/** Follows the active build: milestone items while leveling, pre-raid BiS and BiS at 60. */
export function Gear() {
  const { build } = useHandbook();

  return (
    <section id="gear" aria-label="Gear">
      <SectionHeading id="gear" scope="spec" />

      {build.phase === 'leveling' ? (
        <>
          <Tip>{copy.status.text}</Tip>
          <LevelingPanel items={build.gear} />
        </>
      ) : (
        <EndgameGear gear={build.gear} />
      )}
    </section>
  );
}
