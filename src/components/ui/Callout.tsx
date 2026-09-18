import type { ReactNode } from 'react';
type Tone = 'sky' | 'warn' | 'accent';

const tones: Record<Tone, { rgb: string; cssVar: string }> = {
  sky: { rgb: 'var(--sky-rgb)', cssVar: 'var(--sky)' },
  warn: { rgb: 'var(--warn-rgb)', cssVar: 'var(--warn)' },
  accent: { rgb: 'var(--accent-rgb)', cssVar: 'var(--accent)' },
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
              border: `1px dashed rgba(${t.rgb}, .45)`,
              borderRadius: 12,
              background: `rgba(${t.rgb}, .05)`,
            }
          : {
              borderLeft: `2px solid ${t.cssVar}`,
              background: `rgba(${t.rgb}, .07)`,
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
