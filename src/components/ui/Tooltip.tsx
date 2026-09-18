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

export interface TipContent {
  name: string;
  kind?: string;
  note?: string;
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
/** Grace period so the pointer can cross the gap onto the tooltip itself (WCAG 1.4.13 "hoverable"). */
const HIDE_DELAY_MS = 160;

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tip, setTip] = useState<TipState | null>(null);
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const boxRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | undefined>(undefined);

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
  }, [tip]);

  const show = useCallback((el: Element, t: TipContent) => {
    window.clearTimeout(hideTimer.current);
    setTip({ ...t, rect: el.getBoundingClientRect() });
  }, []);

  const cancelHide = useCallback(() => window.clearTimeout(hideTimer.current), []);
  const hide = useCallback(() => {
    cancelHide();
    setTip(null);
  }, [cancelHide]);
  const hideSoon = useCallback(() => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => setTip(null), HIDE_DELAY_MS);
  }, [cancelHide]);

  // Dismissible without moving the pointer or focus (WCAG 1.4.13).
  useEffect(() => {
    if (!tip) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [tip, hide]);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  const api = useMemo<TooltipApi>(
    () => ({
      bind: (t) => ({
        onPointerEnter: (e) => {
          if (e.pointerType === 'touch') return; // tap handles it
          show(e.currentTarget, t);
        },
        onPointerLeave: hideSoon,
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
    [hide, hideSoon, show, tip?.name],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        id={TIP_ID}
        ref={boxRef}
        role="tooltip"
        onPointerEnter={cancelHide}
        onPointerLeave={hideSoon}
        className="fixed left-0 top-0 z-[90] w-max max-w-[300px] rounded-[11px] border border-line bg-panel2 px-[13px] py-[11px] transition-[opacity,visibility] duration-[120ms]"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          opacity: tip ? 1 : 0,
          visibility: tip ? 'visible' : 'hidden',
          boxShadow: 'var(--shadow-tip)',
        }}
      >
        <div className="t-card-sub text-ink">{tip?.name}</div>
        {tip?.kind && <div className="t-eyebrow mt-[3px] text-[9px] text-accent">{tip.kind}</div>}
        <div className="mt-[6px] text-[12px] leading-[1.55] text-mute">
          {tip?.note || tooltipFallback}
        </div>
      </div>
    </Ctx.Provider>
  );
}

export function useTooltip(): TooltipApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTooltip must be used inside <TooltipProvider>');
  return ctx;
}
