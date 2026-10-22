import { useRef, useState, type KeyboardEvent } from 'react';
import { talents as copy } from '../../content/copy';
import type { TalentTree as TreePoints } from '../../content/types';
import { talentTrees, type Talent, type TalentTreeData } from '../../lib/talentCalc';
import { useTheme } from '../../state/ThemeProvider';
import { useTooltip } from './Tooltip';

const ICON = (icon: string) => `${import.meta.env.BASE_URL}talents/${icon}.jpg`;
/** Icon size as a share of its grid cell, as in-game (and what the arrows stop short of). */
const ICON_SHARE = 0.64;

/**
 * The build's talent trees as the in-game talent window draws them, from a decoded
 * calculator link (`decodeTalentLink`). Hover or focus a talent for its Wowhead tooltip;
 * click it to open that talent on Wowhead. Wide cards show all three trees; narrow ones show one at a time,
 * picked from the point split above it (the same bars leveling builds show).
 */
export function TalentPreview({ ranks, colors }: { ranks: number[][]; colors: TreePoints[] }) {
  const { tone } = useTheme();
  const spent = ranks.map((r) => r.reduce((a, b) => a + b, 0));
  const total = spent.reduce((a, b) => a + b, 0);
  const [shown, setShown] = useState(() => spent.indexOf(Math.max(...spent)));

  return (
    <div className="@container">
      {/* Narrow cards: the point split picks the tree. */}
      <div role="group" aria-label={copy.treePicker} className="grid grid-cols-3 gap-[8px] @[42rem]:hidden">
        {talentTrees.map((t, i) => {
          const color = colors.find((c) => c.name === t.name)?.color ?? '#FFD100';
          const on = i === shown;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => setShown(i)}
              className="rounded-[10px] border px-[10px] pb-[10px] pt-[9px] text-left transition-colors"
              style={{ borderColor: on ? tone(color) : 'var(--line)', background: on ? 'rgba(var(--fg-rgb),.04)' : 'transparent' }}
            >
              <span className="t-num block text-[22px] leading-none" style={{ color: tone(color) }}>
                {spent[i]}
                <span className="sr-only"> {copy.pointsIn(spent[i])}</span>
              </span>
              <span className={`mt-[5px] block text-[11px] ${on ? 'text-ink' : 'text-faint'}`}>{t.name}</span>
              <span className="mt-[7px] block h-[4px] overflow-hidden rounded-full" style={{ background: 'rgba(var(--fg-rgb),.06)' }}>
                <span
                  className="block h-full rounded-full"
                  style={{ width: total ? `${(spent[i] / total) * 100}%` : '0%', background: tone(color, 3) }}
                />
              </span>
            </button>
          );
        })}
      </div>

      <div className="tt-frame mt-[12px] @[42rem]:mt-0 @[42rem]:grid-cols-3">
        {talentTrees.map((t, i) => (
          <Tree key={t.id} tree={t} ranks={ranks[i]} spent={spent[i]} hidden={i !== shown} />
        ))}
      </div>
    </div>
  );
}

function Tree({ tree, ranks, spent, hidden }: { tree: TalentTreeData; ranks: number[]; spent: number; hidden: boolean }) {
  const { bind } = useTooltip();
  const byId = new Map(tree.talents.map((t, i) => [t.id, i]));
  /** One tab stop per tree; arrow keys move between its talents (roving tabindex). */
  const [cursor, setCursor] = useState(0);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);

  const move = (to: number) => {
    setCursor(to);
    refs.current[to]?.focus();
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    const here = tree.talents[i];
    const step = (dir: 1 | -1) => {
      // Nearest talent in the next row up or down, by column.
      const rows = tree.talents.filter((t) => (dir > 0 ? t.row > here.row : t.row < here.row));
      if (!rows.length) return i;
      const row = dir > 0 ? Math.min(...rows.map((t) => t.row)) : Math.max(...rows.map((t) => t.row));
      const pick = rows
        .filter((t) => t.row === row)
        .sort((a, b) => Math.abs(a.col - here.col) - Math.abs(b.col - here.col))[0];
      return tree.talents.indexOf(pick);
    };
    const to = {
      ArrowRight: Math.min(i + 1, tree.talents.length - 1),
      ArrowLeft: Math.max(i - 1, 0),
      ArrowDown: step(1),
      ArrowUp: step(-1),
      Home: 0,
      End: tree.talents.length - 1,
    }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    move(to);
  };

  return (
    <div
      className={`tt-tree ${hidden ? 'hidden @[42rem]:block' : ''}`}
      style={{ backgroundImage: `url(${ICON(`bg-${tree.id}`)})` }}
    >
      <h4 className="tt-head" aria-label={`${tree.name}, ${copy.treePoints(spent)}`}>
        <span className="tt-spec" aria-hidden="true">
          <img src={ICON(tree.icon)} alt="" width={36} height={36} loading="lazy" />
          <span className="tt-badge t-num">{spent}</span>
        </span>
        <span className="tt-name">{tree.name}</span>
      </h4>

      <div className="tt-body">
        <div className="tt-grid" role="group" aria-label={copy.treeLabel(tree.name)}>
          <svg className="tt-arrows" viewBox="0 0 4 7" preserveAspectRatio="none" aria-hidden="true">
            {tree.talents.flatMap((t) =>
              t.requires.map((req) => {
                const from = byId.get(req.id);
                return from === undefined ? null : (
                  <Arrow key={`${req.id}-${t.id}`} from={tree.talents[from]} to={t} lit={ranks[from] >= req.ranks} />
                );
              }),
            )}
          </svg>

          {tree.talents.map((t, i) => {
            const pts = ranks[i];
            const state = pts === 0 ? 'off' : pts === t.max ? 'max' : 'part';
            const rank = Math.max(pts, 1);
            return (
              <a
                key={t.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                // The page Wowhead's own calculator links each talent to, at this rank.
                href={`https://www.wowhead.com/forever/spell=${t.spells[rank - 1]}?def=${t.def}&rank=${rank}`}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.talentLabel(t.name, pts, t.max)}
                className={`tt-talent tt-${state}`}
                style={{ gridRow: t.row + 1, gridColumn: t.col + 1 }}
                {...bind({
                  name: t.name,
                  wowhead: { kind: 'spell', id: t.spells[rank - 1], talent: { def: t.def, rank, points: pts, max: t.max } },
                  fallback: `${copy.rankLine(pts, t.max)}. ${t.text[rank - 1]}`,
                })}
                tabIndex={i === cursor ? 0 : -1}
                onKeyDown={(e) => onKey(e, i)}
              >
                <img src={ICON(t.icon)} alt="" loading="lazy" />
                {pts > 0 && (
                  <span className="tt-rank" aria-hidden="true">
                    {pts}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Prerequisite arrow, in grid-cell units: straight down a column, or across a row. */
function Arrow({ from, to, lit }: { from: Talent; to: Talent; lit: boolean }) {
  const half = ICON_SHARE / 2;
  const [x1, y1, x2, y2] =
    from.col === to.col
      ? [from.col + 0.5, from.row + 0.5 + half, to.col + 0.5, to.row + 0.5 - half]
      : [from.col + 0.5 + half * Math.sign(to.col - from.col), from.row + 0.5, to.col + 0.5 - half * Math.sign(to.col - from.col), to.row + 0.5];
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 0.11;
  const wing = (a: number) => `${x2 - head * Math.cos(angle + a)},${y2 - head * Math.sin(angle + a)}`;
  return (
    <g className={lit ? 'tt-lit' : undefined}>
      <line x1={x1} y1={y1} x2={x2 - (head / 2) * Math.cos(angle)} y2={y2 - (head / 2) * Math.sin(angle)} />
      <polygon points={`${x2},${y2} ${wing(0.6)} ${wing(-0.6)}`} />
    </g>
  );
}
