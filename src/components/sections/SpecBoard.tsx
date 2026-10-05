import { useEffect, useMemo, useState } from 'react';
import { config } from '../../config';
import { foreverOutlook, levelingIndex, specById, specIndex } from '../../content/content';
import { specBoard } from '../../content/copy';
import type { LevelingSetId, SimSetId, SpecId } from '../../content/types';
import { useHandbook, type SortKey } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { useSpecColor } from '../../state/useSpecColor';
import { SegmentedTabs, Tag } from '../ui/Pill';
import { SectionHeading } from '../ui/SectionHeading';

interface Row {
  id: SpecId;
  rank: number;
  name: string;
  weapon: string;
  color: string;
  color2: string;
  tag: string;
  idx: number;
  delta: number;
  pct: number;
}

function useRows(simSet: SimSetId): Row[] {
  return useMemo(() => {
    const set = specIndex[simSet];
    if (!set.rows) return [];
    const entries = Object.entries(set.rows) as [SpecId, number][];
    const top = Math.max(...entries.map(([, v]) => v));
    return entries
      .sort((a, b) => b[1] - a[1])
      .map(([id, idx], i) => {
        const s = specById[id];
        return {
          id,
          rank: i + 1,
          name: s.name,
          weapon: s.weapon,
          color: s.color,
          color2: s.color2,
          tag: s.tag,
          idx,
          delta: idx - top,
          pct: (idx / top) * 100,
        };
      });
  }, [simSet]);
}

/** Bar fills grow on mount and whenever the data set changes. */
function useGrown(dep: unknown): boolean {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [dep]);
  return grown;
}

function YourSpecBadge() {
  const c = useSpecColor();
  return (
    <span
      className="t-eyebrow rounded-[4px] px-[6px] py-[2px] text-[10.5px] whitespace-nowrap"
      style={{ background: c.soft, color: c.text, fontWeight: 600 }}
    >
      {specBoard.yourSpec}
    </span>
  );
}

function BarsView({ rows, simSet }: { rows: Row[]; simSet: SimSetId }) {
  const c = useSpecColor();
  const { spec } = useHandbook();
  const { tone } = useTheme();
  const grown = useGrown(simSet);

  return (
    <div className="flex flex-col gap-[10px]">
      {rows.map((r) => {
        const mine = r.id === spec;
        return (
          <div
            key={r.id}
            className="sheet rounded-[12px] px-[14px] py-[12px]"
            style={{
              border: `1px solid ${mine ? c.line : 'var(--line)'}`,
              background: mine ? c.soft : 'var(--panel)',
            }}
          >
            <div className="flex items-center gap-[10px]">
              <span className="t-num w-[20px] shrink-0 text-[12px] text-faint">{r.rank}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-ink">{r.name}</span>
                <span className="block truncate text-[10.5px] text-faint">{r.weapon}</span>
              </span>
              {mine ? <YourSpecBadge /> : <Tag>{r.tag}</Tag>}
              <span className="t-num w-[42px] shrink-0 text-right text-[15px] text-ink">
                {r.idx}
              </span>
            </div>

            <div
              className="relative mt-[10px] h-[8px] overflow-hidden rounded-full"
              style={{ background: 'rgba(var(--fg-rgb),.05)' }}
            >
              <div
                className="relative h-full overflow-hidden rounded-full"
                style={{
                  width: grown ? `${r.pct}%` : '0%',
                  background: `linear-gradient(90deg, ${tone(r.color, 3)}, ${tone(r.color2, 3)})`,
                  transition: 'width .65s cubic-bezier(.2,.8,.2,1)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const COLS: { key: SortKey; label: string }[] = [
  { key: 'rank', label: '#' },
  { key: 'name', label: 'SPEC' },
  { key: 'weapon', label: 'WEAPONS' },
  { key: 'idx', label: 'INDEX' },
  { key: 'delta', label: 'Δ TOP' },
];

const GRID = '46px minmax(0,1.4fr) minmax(0,1.3fr) 84px 84px';

function TableView({ rows }: { rows: Row[] }) {
  const c = useSpecColor();
  const { spec, sort, toggleSort } = useHandbook();
  const { tone } = useTheme();

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, sort]);

  return (
    <div className="table-scroll panel" tabIndex={0} role="region" aria-label={specBoard.tableLabel}>
      <div role="table" aria-label={specBoard.tableLabel} style={{ minWidth: 560 }}>
        <div
          className="grid items-center border-b border-line px-[14px] py-[10px]"
          style={{ gridTemplateColumns: GRID }}
          role="row"
        >
          {COLS.map((c) => {
            const on = sort.key === c.key;
            return (
              <div
                key={c.key}
                role="columnheader"
                aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <button
                  type="button"
                  onClick={() => toggleSort(c.key)}
                  className="t-eyebrow flex items-center gap-[4px] text-[10.5px]"
                  style={{ color: on ? 'var(--accent)' : 'var(--faint)' }}
                >
                  {c.label}
                  {on && <span aria-hidden="true">{sort.dir === 'asc' ? '↑' : '↓'}</span>}
                </button>
              </div>
            );
          })}
        </div>

        {sorted.map((r) => {
          const mine = r.id === spec;
          return (
            <div
              key={r.id}
              role="row"
              className="grid items-center border-b border-line/50 px-[14px] py-[11px] last:border-0"
              style={{
                gridTemplateColumns: GRID,
                background: mine ? c.soft : 'transparent',
              }}
            >
              <span role="cell" className="t-num text-[12px] text-faint">{r.rank}</span>
              <span role="cell" className="flex min-w-0 items-center gap-[8px]">
                <span
                  aria-hidden="true"
                  className="size-[7px] shrink-0 rounded-full"
                  style={{ background: tone(r.color, 3) }}
                />
                <span className="truncate text-[13px] font-semibold text-ink">{r.name}</span>
              </span>
              <span role="cell" className="truncate text-[12px] text-faint">{r.weapon}</span>
              <span role="cell" className="t-num text-[13.5px] text-ink">{r.idx}</span>
              <span role="cell" className="t-num text-[12.5px]" style={{ color: r.delta === 0 ? 'var(--accent)' : 'var(--mute)' }}>
                {r.delta === 0 ? '—' : r.delta}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardsView({ rows }: { rows: Row[] }) {
  const c = useSpecColor();
  const { spec } = useHandbook();
  const { tone } = useTheme();
  return (
    <div className="grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,208px),1fr))]">
      {rows.map((r) => {
        const mine = r.id === spec;
        return (
          <div
            key={r.id}
            className="sheet rounded-[14px] p-[16px]"
            style={{
              border: `1px solid ${mine ? c.line : 'var(--line)'}`,
              background: mine ? c.soft : 'var(--panel)',
            }}
          >
            <div className="flex items-start justify-between gap-[8px]">
              <span className="t-card-sub text-ink">{r.name}</span>
              {mine ? <YourSpecBadge /> : <Tag>{r.tag}</Tag>}
            </div>
            <div className="t-num mt-[12px] text-[32px] leading-none" style={{ color: tone(r.color) }}>
              {r.idx}
            </div>
            <div className="mt-[6px] text-[11px] text-faint">{r.weapon}</div>
            <div className="t-num mt-[10px] text-[11px] text-mute">
              {r.delta === 0 ? 'Top of the index' : `${r.delta} vs top`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ForeverPending() {
  const { isNarrow } = useHandbook();
  const { tone } = useTheme();
  return (
    <div
      className="sheet rounded-[14px] p-[18px]"
      style={{ border: '1px solid rgba(var(--sky-rgb),.24)', background: 'var(--panel)' }}
    >
      <div className="flex items-center gap-[9px]">
        <span className="t-panel-label text-sky">{specBoard.pending.heading}</span>
      </div>
      <p className="mt-[10px] max-w-[70ch] text-[13px] leading-[1.6] text-prose">
        {specBoard.pending.body}
      </p>

      {foreverOutlook.length > 0 && (
        <div className="mt-[16px] flex flex-col gap-[10px]">
          {foreverOutlook.map((o) => {
            const s = specById[o.id];
            return (
              <div
                key={o.id}
                className="grid items-baseline gap-x-[10px] gap-y-[4px] border-t border-line pt-[10px]"
                style={{
                  gridTemplateColumns: isNarrow ? '30px minmax(0,1fr)' : '30px minmax(0,190px) minmax(0,1fr)',
                }}
              >
                <span aria-hidden="true" className="text-[13px]" style={{ color: tone(o.arrowColor) }}>
                  {o.arrow}
                </span>
                <span className="text-[13.5px] font-semibold text-ink">{s.name}</span>
                <span
                  className="text-[12.5px] leading-[1.55] text-mute"
                  style={isNarrow ? { gridColumn: 2 } : undefined}
                >
                  {o.why}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubHeading({ children }: { children: string }) {
  return <h3 className="t-card-title mt-[26px] text-ink">{children}</h3>;
}

/** Leveling meta: placeholder tabs until there is data to rank. */
function LevelingMeta() {
  const [set, setSet] = useState<LevelingSetId>('questing');
  const current = levelingIndex[set];

  const tabs = (Object.keys(levelingIndex) as LevelingSetId[]).map((k) => ({
    id: k,
    label: levelingIndex[k].label,
  }));

  return (
    <>
      <SubHeading>{specBoard.subheadings.leveling}</SubHeading>

      <div className="mt-[14px]">
        <SegmentedTabs
          tabs={tabs}
          value={set}
          onChange={(id) => setSet(id as LevelingSetId)}
          label="Leveling meta view"
        />
      </div>

      <p className="t-eyebrow mt-[12px] text-[10.5px] text-faint">{current.note}</p>

      <div id={`panel-${set}`} role="tabpanel" aria-labelledby={`tab-${set}`} className="mt-[14px]">
        <ForeverPending />
      </div>
    </>
  );
}

export function SpecBoard() {
  const { simSet, setSimSet } = useHandbook();
  const rows = useRows(simSet);
  const set = specIndex[simSet];

  const tabs = (Object.keys(specIndex) as SimSetId[]).map((k) => ({
    id: k,
    label: specIndex[k].label,
  }));

  // Until any view has real data, the section is just the honest explanation: no tabs,
  // no empty states. Filling in specIndex/levelingIndex brings the full UI back.
  const anyData = [...Object.values(specIndex), ...Object.values(levelingIndex)].some((v) => !v.pending);
  if (!anyData) {
    return (
      <section id="specs" aria-label="Meta breakdown" className="pt-[44px]">
        <SectionHeading id="specs" />
        <div className="flex max-w-[70ch] flex-col gap-[10px] text-[14px] leading-[1.6] text-mute">
          <p>{specBoard.intro}</p>
          <p>{specBoard.planned}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="specs" aria-label="Meta breakdown" className="pt-[44px]">
      <SectionHeading id="specs" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">{specBoard.intro}</p>

      <SubHeading>{specBoard.subheadings.endgame}</SubHeading>

      <div className="mt-[14px]">
        <SegmentedTabs
          tabs={tabs}
          value={simSet}
          onChange={(id) => setSimSet(id as SimSetId)}
          label="Damage index view"
        />
      </div>

      <p className="t-eyebrow mt-[12px] text-[10.5px] text-faint">{set.note}</p>

      <div id={`panel-${simSet}`} role="tabpanel" aria-labelledby={`tab-${simSet}`} className="mt-[14px]">
        {set.pending ? (
          <ForeverPending />
        ) : config.simView === 'table' ? (
          <TableView rows={rows} />
        ) : config.simView === 'cards' ? (
          <CardsView rows={rows} />
        ) : (
          <BarsView rows={rows} simSet={simSet} />
        )}
      </div>

      <LevelingMeta />
    </section>
  );
}
