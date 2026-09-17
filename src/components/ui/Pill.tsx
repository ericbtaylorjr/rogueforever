import type { ReactNode } from 'react';
import { hexA } from '../../lib/color';

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
  const hex = tone === 'sky' ? '#7FC4E8' : '#FFF468';
  const cssVar = tone === 'sky' ? 'var(--sky)' : 'var(--accent)';
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className="pill px-[12px] py-[6px] text-[12px] transition-colors"
      style={
        selected
          ? { borderColor: cssVar, background: hexA(hex, 0.13), color: cssVar, fontWeight: 600 }
          : { color: 'var(--faint)' }
      }
    >
      {label}
      {count !== undefined && (
        <span className="t-num text-[10.5px] opacity-70">{count}</span>
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
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex w-fit gap-1 rounded-[10px] border border-line bg-panel p-1"
    >
      {tabs.map((t) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={on}
            aria-controls={`panel-${t.id}`}
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
