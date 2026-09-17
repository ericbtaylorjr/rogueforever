import type { ReactNode } from 'react';
import { hexA } from '../../lib/color';

type Tone = 'sky' | 'warn' | 'accent';

const tones: Record<Tone, { hex: string; cssVar: string }> = {
  sky: { hex: '#7FC4E8', cssVar: 'var(--sky)' },
  warn: { hex: '#FF8A5B', cssVar: 'var(--warn)' },
  accent: { hex: '#FFF468', cssVar: 'var(--accent)' },
};

/** 2px left-bordered note. Used for Forever claims, warnings and TODOs. */
export function Callout({
  tone = 'sky',
  dashed = false,
  label,
  children,
}: {
  tone?: Tone;
  dashed?: boolean;
  label?: string;
  children: ReactNode;
}) {
  const t = tones[tone];
  return (
    <div
      className="rounded-r-[12px] px-[15px] py-[13px] text-[12.5px] leading-[1.6] text-prose"
      style={
        dashed
          ? {
              border: `1px dashed ${hexA(t.hex, 0.45)}`,
              borderRadius: 12,
              background: hexA(t.hex, 0.05),
            }
          : {
              borderLeft: `2px solid ${t.cssVar}`,
              background: hexA(t.hex, 0.07),
            }
      }
    >
      {label && (
        <span className="t-eyebrow mr-2 align-middle text-[9.5px]" style={{ color: t.cssVar }}>
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
