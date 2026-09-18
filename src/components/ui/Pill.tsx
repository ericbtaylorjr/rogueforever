import { useRef, type KeyboardEvent, type ReactNode } from 'react';

/**
 * Category filter pill with a count. Forever watch uses `tone="sky"` to stay
 * visually distinct from the rest of the page.
 */
export function FilterPill({
  label,
  count,
  selected,
  tone = 'accent',
  onSelect,
}: {
  label: string;
  count?: number;
  selected: boolean;
  tone?: 'accent' | 'sky';
  onSelect: () => void;
}) {
  const rgb = tone === 'sky' ? 'var(--sky-rgb)' : 'var(--accent-rgb)';
  const cssVar = tone === 'sky' ? 'var(--sky)' : 'var(--accent)';
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className="pill px-[12px] py-[6px] text-[12px] transition-colors"
      style={
        selected
          ? { borderColor: cssVar, background: `rgba(${rgb}, .13)`, color: cssVar, fontWeight: 600 }
          : { color: 'var(--faint)' }
      }
    >
      {label}
      {count !== undefined && (
        <span className="t-num text-[10.5px]">{count}</span>
      )}
    </button>
  );
}

/** Segmented control — spec board and gear tabs. */
export function SegmentedTabs({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  // WAI-ARIA tabs: one tab stop, arrows/Home/End move between tabs (automatic activation).
  const onKeyDown = (e: KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === value);
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(tabs[next].id);
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="flex w-fit gap-1 rounded-[10px] border border-line bg-panel p-1"
    >
      {tabs.map((t) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            aria-controls={on ? `panel-${t.id}` : undefined}
            id={`tab-${t.id}`}
            type="button"
            onClick={() => onChange(t.id)}
            className="whitespace-nowrap rounded-[7px] px-[14px] py-[8px] text-[12.5px] font-semibold transition-colors"
            style={on ? { background: 'var(--accent)', color: 'var(--accent-ink)' } : { color: 'var(--mute)' }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/** Small bordered tag. */
export function Tag({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <span
      className="t-eyebrow rounded-[4px] border border-line px-[6px] py-[2px] text-[8.5px] tracking-[.13em] whitespace-nowrap"
      style={{ color: tone ?? 'var(--faint)' }}
    >
      {children}
    </span>
  );
}
