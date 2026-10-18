import type { ReactNode } from 'react';
type Tone = 'sky' | 'warn' | 'accent' | 'sweat';

/** Rule, tint and label colours. A `Tone` resolves to one; callers can pass their own. */
export interface CalloutColors {
  rule: string;
  tint: string;
  text: string;
  /** Softer rule for `quiet`; falls back to `rule`. */
  quietRule?: string;
}

const toneColors = (rgb: string, cssVar: string): CalloutColors => ({
  rule: cssVar,
  tint: `rgba(${rgb}, .07)`,
  text: cssVar,
  quietRule: `rgba(${rgb}, .55)`,
});

const tones: Record<Tone, CalloutColors> = {
  sky: toneColors('var(--sky-rgb)', 'var(--sky)'),
  warn: toneColors('var(--warn-rgb)', 'var(--warn)'),
  accent: toneColors('var(--accent-rgb)', 'var(--accent)'),
  sweat: toneColors('var(--sweat-rgb)', 'var(--sweat)'),
};

/**
 * Left-ruled note for Forever claims, warnings and status lines. `quiet` drops the
 * tint for status lines ("still Classic Era data…") so they read as an aside, not
 * a banner. `label` is a short lead-in in the tone colour, written in sentence case.
 * `icon` sits just before the label, e.g. the droplet on a sweaty tip. `colors`
 * overrides `tone`, e.g. for a spec's colour. Tips use <Tip>, which builds on this.
 */
export function Callout({
  tone = 'sky',
  colors,
  quiet = false,
  label,
  icon,
  children,
}: {
  tone?: Tone;
  colors?: CalloutColors;
  quiet?: boolean;
  label?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const c = colors ?? tones[tone];
  return (
    <div
      className="max-w-[88ch] rounded-r-[8px] px-[14px] py-[10px] text-[13px] leading-[1.6] text-prose"
      style={{
        borderLeft: `2px solid ${quiet ? (c.quietRule ?? c.rule) : c.rule}`,
        background: quiet ? 'transparent' : c.tint,
      }}
    >
      {icon && <span className="mr-[6px] inline-flex align-[1px]">{icon}</span>}
      {label && (
        <strong className="mr-[6px] font-semibold" style={{ color: c.text }}>
          {label}
        </strong>
      )}
      {children}
    </div>
  );
}
