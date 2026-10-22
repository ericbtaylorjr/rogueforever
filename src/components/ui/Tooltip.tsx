import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { tooltipFallback } from '../../content/copy';
import { qualityColor } from '../../content/gear';
import { track } from '../../lib/analytics';
import { loadWowheadTip, wowheadKey, type WowheadRef, type WowheadTip } from '../../lib/wowhead';
import { useTheme } from '../../state/ThemeProvider';

export interface TipContent {
  name: string;
  kind?: string;
  note?: string;
  /** Show Wowhead's live tooltip for this item or spell, with `kind` and `note` beneath it. */
  wowhead?: WowheadRef;
}

interface TipState extends TipContent {
  rect: DOMRect;
}

interface TooltipApi {
  /** Spread onto any element that should explain itself. */
  bind: (tip: TipContent) => {
    onPointerEnter: (e: React.PointerEvent) => void;
    onPointerLeave: () => void;
    onFocus: (e: React.FocusEvent) => void;
    onBlur: () => void;
    onClick: (e: React.MouseEvent) => void;
    tabIndex: number;
    /** Only present while this element's tooltip is showing, so it never describes the wrong thing. */
    'aria-describedby': string | undefined;
  };
}

const Ctx = createContext<TooltipApi | null>(null);

const INSET = 14;
const GAP = 9;
const TIP_ID = 'rc-tooltip';
/** How long a tooltip must stay up to count as read (`tooltip_view`). */
const TIP_READ_MS = 700;

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tip, setTip] = useState<TipState | null>(null);
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const boxRef = useRef<HTMLDivElement>(null);
  const { tone } = useTheme();
  /** Wowhead's tooltip for the showing tip, once it arrives. Keyed so a late reply never lands on the wrong tip. */
  const [wh, setWh] = useState<{ key: string; tip: WowheadTip } | null>(null);
  const whKey = tip?.wowhead ? wowheadKey(tip.wowhead) : null;
  const whTip = wh && wh.key === whKey ? wh.tip : null;

  useEffect(() => {
    if (!tip?.wowhead || !whKey) return;
    let live = true;
    loadWowheadTip(tip.wowhead).then((t) => {
      if (live && t) setWh({ key: whKey, tip: t });
    });
    return () => {
      live = false;
    };
  }, [whKey]);

  // Position after the content is measurable: below the anchor, flipped above
  // if it would fall off the bottom, clamped to a 14px viewport inset.
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!tip || !box) return;
    const { width, height } = box.getBoundingClientRect();
    const r = tip.rect;

    let x = r.left + r.width / 2 - width / 2;
    x = Math.min(Math.max(x, INSET), Math.max(INSET, window.innerWidth - width - INSET));

    let y = r.bottom + GAP;
    if (y + height > window.innerHeight - 12) y = Math.max(12, r.top - height - GAP);

    setPos({ x, y });
  }, [tip, whTip]);

  const show = useCallback((el: Element, t: TipContent) => {
    setTip({ ...t, rect: el.getBoundingClientRect() });
  }, []);
  const hide = useCallback(() => setTip(null), []);

  // Dismissible without moving the pointer or focus (WCAG 1.4.13).
  useEffect(() => {
    if (!tip) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [tip, hide]);

  /* Count a tooltip as read once it has stayed up a moment; a pointer sweeping across icons isn't.
     Keyed on the name, so re-positioning the same tooltip isn't a new read. */
  useEffect(() => {
    if (!tip) return;
    const { name, kind } = tip;
    const t = window.setTimeout(() => track('tooltip_view', { name, kind: kind ?? '' }), TIP_READ_MS);
    return () => window.clearTimeout(t);
  }, [tip?.name]);

  const api = useMemo<TooltipApi>(
    () => ({
      bind: (t) => ({
        onPointerEnter: (e) => {
          if (e.pointerType === 'touch') return; // tap handles it
          show(e.currentTarget, t);
        },
        // Gone the moment the pointer leaves, so the next item down can show its own.
        onPointerLeave: hide,
        onFocus: (e) => show(e.currentTarget, t),
        onBlur: hide,
        onClick: (e) => {
          // Touch + keyboard path: toggle rather than hover.
          setTip((cur) => (cur && cur.name === t.name ? null : { ...t, rect: e.currentTarget.getBoundingClientRect() }));
        },
        tabIndex: 0,
        'aria-describedby': tip?.name === t.name ? TIP_ID : undefined,
      }),
    }),
    [hide, show, tip?.name],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        id={TIP_ID}
        ref={boxRef}
        role="tooltip"
        // Display only: the pointer passes straight through to whatever is underneath.
        className="pointer-events-none fixed left-0 top-0 z-[90] w-max max-w-[min(320px,calc(100vw-28px))] rounded-[11px] border border-line bg-panel2 px-[13px] py-[11px] transition-[opacity,visibility] duration-[120ms]"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          opacity: tip ? 1 : 0,
          visibility: tip ? 'visible' : 'hidden',
          boxShadow: 'var(--tip-shadow)',
        }}
      >
        {whTip ? (
          <>
            {/* Sanitized in lib/wowhead before it gets here. */}
            <div className="wh-tip" style={wowheadColors(tone)} dangerouslySetInnerHTML={{ __html: whTip.html }} />
            {(tip?.kind || tip?.note) && (
              <div className="mt-[9px] border-t border-line pt-[8px]">
                {tip.kind && <div className="t-eyebrow text-[10.5px] text-accent">{tip.kind}</div>}
                {tip.note && <div className="mt-[4px] text-[12px] leading-[1.55] text-mute">{tip.note}</div>}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="t-card-sub text-ink">{tip?.name}</div>
            {tip?.kind && <div className="t-eyebrow mt-[3px] text-[10.5px] text-accent">{tip.kind}</div>}
            <div className="mt-[6px] text-[12px] leading-[1.55] text-mute">
              {tip?.note || tooltipFallback}
            </div>
          </>
        )}
      </div>
    </Ctx.Provider>
  );
}

/** Wowhead's colour classes (q0–q5 quality, q for its gold text, c4 for Rogue), made legible in the current theme. */
function wowheadColors(tone: (hex: string) => string): React.CSSProperties {
  return {
    '--wh-q0': tone(qualityColor.poor),
    '--wh-q2': tone(qualityColor.uncommon),
    '--wh-q3': tone(qualityColor.rare),
    '--wh-q4': tone(qualityColor.epic),
    '--wh-q5': tone(qualityColor.legendary),
    '--wh-gold': tone('#FFD100'),
    '--wh-rogue': tone('#FFF468'),
  } as React.CSSProperties;
}

export function useTooltip(): TooltipApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTooltip must be used inside <TooltipProvider>');
  return ctx;
}
