import { config } from '../../config';
import { specs } from '../../content/content';
import { hero } from '../../content/copy';
import { useCompendium } from '../../state/CompendiumProvider';
import { useTheme } from '../../state/ThemeProvider';
import { Callout } from '../ui/Callout';

function PoisonDrip() {
  return (
    <div className="relative mt-[22px] h-[18px] w-full max-w-[520px]" aria-hidden="true">
      <div
        className="absolute left-0 top-0 h-px w-full"
        style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }}
      />
      {[
        { left: '18%', cls: 'animate-drip' },
        { left: '56%', cls: 'animate-drip-slow' },
      ].map((d) => (
        <span
          key={d.left}
          className={`absolute top-0 ${d.cls}`}
          style={{
            left: d.left,
            width: 7,
            height: 8,
            background: 'var(--venom)',
            clipPath: 'polygon(50% 0%, 100% 62%, 78% 100%, 22% 100%, 0% 62%)',
          }}
        />
      ))}
    </div>
  );
}

function SpecLadder() {
  const { spec, setSpec } = useCompendium();
  const { tone } = useTheme();

  return (
    <div className="panel px-[18px] pb-[8px] pt-[18px]">
      <div className="mb-[14px] flex items-baseline justify-between">
        <span className="t-panel-label text-ink">{hero.ladder.title}</span>
        <span className="t-eyebrow text-[9px] text-faint">{hero.ladder.meta}</span>
      </div>

      <div className="flex flex-col">
        {specs.map((s) => {
          const on = s.id === spec;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={() => setSpec(s.id)}
              className="mb-[6px] flex items-center gap-[12px] rounded-[10px] px-[10px] py-[9px] transition-colors"
              style={{
                border: on ? '1px solid rgba(var(--accent-rgb),.34)' : '1px solid transparent',
                background: on ? 'rgba(var(--accent-rgb),.07)' : 'transparent',
              }}
            >
              <span
                aria-hidden="true"
                className="shrink-0 rounded-full"
                style={{ width: 3, height: 26, background: tone(s.color, 3) }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-ink">
                  {s.name}
                </span>
                <span className="block truncate text-[10.5px] text-faint">{s.weapon}</span>
              </span>
              <span className="shrink-0 text-right">
                <span
                  className="block"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: 16,
                    lineHeight: 1,
                    color: tone(s.color),
                  }}
                >
                  {s.tier}
                </span>
                <span className="t-eyebrow block text-[9px] text-faint">{s.role}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="border-t border-line py-[12px] text-[11.5px] leading-[1.5] text-faint">
        {hero.ladder.footnote}
      </p>
    </div>
  );
}

export function Overview() {
  const { jump } = useCompendium();

  return (
    <section
      id="overview"
      aria-label="Overview"
      className="relative"
      style={{ padding: 'clamp(24px, 5.5vw, 58px) 0 10px' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 size-[300px]"
        style={{
          background: 'radial-gradient(circle at 70% 30%, var(--accent-dim), transparent 62%)',
          filter: 'blur(12px)',
        }}
      />

      <div className="relative flex flex-wrap items-center gap-[10px]">
        <span className="t-eyebrow text-[10px] tracking-[.22em] text-faint">{hero.eyebrow}</span>
        <span aria-hidden="true" className="size-[4px] rounded-full" style={{ background: 'var(--dim)' }} />
        <span className="t-eyebrow rounded-[20px] border border-accent px-[10px] py-[3px] text-[10px] text-accent">
          {config.phaseLabel}
        </span>
      </div>

      <h1 className="relative mt-[18px]">
        <span className="t-h1 block text-ink">{hero.titleTop}</span>
        <span className="t-h1 block text-accent" style={{ textShadow: 'var(--glow)' }}>
          {hero.titleBottom}
        </span>
      </h1>

      <div className="relative mt-[16px] max-w-[62ch]">
        <Callout tone="accent" dashed label={hero.disclaimer.label}>
          {hero.disclaimer.text}
        </Callout>
      </div>

      <PoisonDrip />

      <div className="mt-[26px] grid gap-[26px] hero:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div>
          <p className="t-lede text-lede">{hero.lede}</p>
          <p className="mt-[14px] max-w-[62ch] text-[14.5px] leading-[1.6] text-mute">
            {hero.support.before}
            <span className="font-semibold text-sky">{hero.support.link}</span>
            {hero.support.after}
          </p>

          <div className="mt-[22px] flex flex-wrap gap-[10px]">
            <button
              type="button"
              onClick={() => jump('specs')}
              className="rounded-[8px] px-[16px] py-[11px] text-[13px] font-semibold"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                boxShadow: 'var(--glow)',
              }}
            >
              {hero.ctaPrimary}
            </button>
            <button
              type="button"
              onClick={() => jump('forever')}
              className="rounded-[8px] border border-line px-[16px] py-[11px] text-[13px] font-semibold text-mute transition-colors hover:border-sky hover:text-sky"
            >
              {hero.ctaGhost}
            </button>
          </div>
        </div>

        <SpecLadder />
      </div>
    </section>
  );
}
