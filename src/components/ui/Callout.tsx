import type { ReactNode } from 'react';
type Tone = 'sky' | 'warn' | 'accent';

const tones: Record<Tone, { rgb: string; cssVar: string }> = {
  sky: { rgb: 'var(--sky-rgb)', cssVar: 'var(--sky)' },
  warn: { rgb: 'var(--warn-rgb)', cssVar: 'var(--warn)' },
  accent: { rgb: 'var(--accent-rgb)', cssVar: 'var(--accent)' },
};

/**
 * Left-ruled note for Forever claims, warnings and status lines. `quiet` drops the
 * tint for status lines ("still Classic Era data…") so they read as an aside, not
 * a banner. `label` is a short lead-in in the tone colour, written in sentence case.
 */
export function Callout({
  tone = 'sky',
  quiet = false,
  label,
  children,
}: {
  tone?: Tone;
  quiet?: boolean;
  label?: string;
  children: ReactNode;
}) {
  const t = tones[tone];
  return (
    <div
      className="max-w-[88ch] rounded-r-[8px] px-[14px] py-[10px] text-[13px] leading-[1.6] text-prose"
      style={{
        borderLeft: `2px solid ${quiet ? `rgba(${t.rgb}, .55)` : t.cssVar}`,
        background: quiet ? 'transparent' : `rgba(${t.rgb}, .07)`,
      }}
    >
      {label && (
        <strong className="mr-[6px] font-semibold" style={{ color: t.cssVar }}>
          {label}
        </strong>
      )}
      {children}
    </div>
  );
}
