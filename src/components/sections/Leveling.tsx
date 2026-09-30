import { leveling, specById } from '../../content/content';
import { levelingCopy as copy } from '../../content/copy';
import type { LevelingPath } from '../../content/types';
import { hexA } from '../../lib/color';
import { SectionHeading } from '../ui/SectionHeading';

const SHARD = 'polygon(42% 0, 100% 0, 100% 100%, 0 100%)';

/**
 * Card banner. Always a dark surface with light text in both themes, so spec
 * colours are used raw: a hard-cut colour shard on the right, a lit edge along
 * the bottom, and a faint scanline texture.
 */
function Banner({ path }: { path: LevelingPath }) {
  const { color, color2 } = specById[path.spec];

  return (
    <div className="relative h-[96px] overflow-hidden" style={{ background: 'var(--hue-end)' }}>
      {/* Glow bleeding in from the shard. */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: `radial-gradient(90% 130% at 100% 0%, ${hexA(color, 0.4)}, transparent 62%)` }}
      />
      {/* An offset copy of the shard peeking out behind it, so the two cuts stay parallel. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-[44%]"
        style={{ clipPath: SHARD, background: hexA(color, 0.5), transform: 'translateX(-14px)' }}
      />
      {/* The shard: angled cut on the leading edge, spec gradient inside. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-[44%]"
        style={{ clipPath: SHARD, background: `linear-gradient(160deg, ${color}, ${color2})` }}
      />
      {/* Scanlines over everything for texture. */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 1px, transparent 1px 4px)',
        }}
      />
      {/* Lit bottom edge. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[2px]"
        style={{ background: color, boxShadow: `0 0 16px 1px ${hexA(color, 0.8)}` }}
      />

      <div className="relative flex h-full flex-col justify-end p-[14px] pb-[13px]">
        <span className="t-eyebrow text-[9.5px] tracking-[.18em]" style={{ color }}>
          {path.tree}
        </span>
        <h3 className="t-card-title mt-[4px]" style={{ color: 'var(--on-hue)' }}>
          {path.name}
        </h3>
      </div>
    </div>
  );
}

export function Leveling() {
  return (
    <section id="leveling" aria-label="Level 30 beta builds">
      <SectionHeading id="leveling" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">{copy.intro}</p>

      <div className="mt-[18px] grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
        {leveling.map((l) => (
          <article key={l.name} className="panel flex flex-col overflow-hidden">
            <Banner path={l} />
            <p className="flex-1 p-[14px] text-[12.5px] leading-[1.6] text-mute">{l.body}</p>
            <div className="px-[14px] pb-[14px]">
              {l.href ? (
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-[8px] border border-line px-[13px] py-[9px] text-center text-[12.5px] font-semibold text-mute transition-colors hover:border-accent hover:bg-accent-dim hover:text-accent"
                >
                  {copy.cta}
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-[8px] border border-line px-[13px] py-[9px] text-center text-[12.5px] font-semibold text-mute opacity-50"
                >
                  {copy.comingSoon}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
