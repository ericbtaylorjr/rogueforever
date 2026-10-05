import { useEffect, useState } from 'react';
import { leveling, specById, specDetail } from '../../content/content';
import { talents as copy } from '../../content/copy';
import type { LevelingPath, SpecId, TalentVariant } from '../../content/types';
import { hexA } from '../../lib/color';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { Callout } from '../ui/Callout';
import { SegmentedTabs } from '../ui/Pill';
import { SectionHeading } from '../ui/SectionHeading';

const TOTAL_POINTS = 51;

/** Tab ids share the page's tab namespace, so prefix them. */
const tabId = (id: string) => `build-${id}`;

/** Grey stand-in bar used by every "coming soon" state in this section. */
function GhostBar({ width = '100%' }: { width?: string }) {
  return (
    <div
      aria-hidden="true"
      className="h-[10px] rounded-full"
      style={{
        width,
        background:
          'repeating-linear-gradient(135deg, rgba(var(--fg-rgb),.07) 0 2px, transparent 2px 6px)',
      }}
    />
  );
}

/**
 * Point split, key talents and a calculator link for one build. Used for both
 * the level 60 and the leveling card. `total` is the points available at the
 * build's level; bars default to the build's own total.
 */
function BuildCard({
  title,
  variant,
  total,
}: {
  title: string;
  variant: TalentVariant | undefined;
  total?: number;
}) {
  const { tone } = useTheme();
  const points = total ?? variant?.talents.reduce((n, t) => n + t.pts, 0) ?? 0;
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [variant]);

  // Until a build exists, show the three trees with no points so the intent reads.
  const trees = variant?.talents ?? copy.trees.map((name) => ({ name, pts: 0, color: '' }));

  return (
    <div className="panel flex flex-col p-[18px]">
      <div className="flex items-baseline justify-between gap-[10px]">
        <span className="t-panel-label text-ink">{title}</span>
        {!variant && <span className="t-eyebrow text-[9px] text-faint">{copy.tbd}</span>}
      </div>

      <div className="mt-[16px] grid grid-cols-3 gap-[12px]">
        {trees.map((t) => (
          <div key={t.name}>
            <div
              className="t-num text-[26px] leading-none"
              style={{ color: variant ? tone(t.color) : 'var(--dim)' }}
            >
              {variant ? t.pts : '—'}
            </div>
            <div className="mt-[6px] text-[11px] text-faint">{t.name}</div>
            <div
              className="mt-[8px] h-[4px] overflow-hidden rounded-full"
              style={{ background: 'rgba(var(--fg-rgb),.06)' }}
            >
              {variant && (
                <div
                  className="h-full rounded-full"
                  style={{
                    width: grown && points ? `${(t.pts / points) * 100}%` : '0%',
                    background: tone(t.color, 3),
                    transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {variant ? (
        <>
          <p className="mt-[16px] border-t border-line pt-[14px] text-[12.5px] leading-[1.6] text-mute">
            {variant.talentNote}
          </p>
          <ul className="mt-[12px] flex flex-1 flex-col gap-[8px]">
            {variant.keyTalents.map((k) => (
              <li key={k} className="flex items-baseline gap-[9px] text-[12.5px] leading-[1.5] text-prose">
                <span
                  aria-hidden="true"
                  className="mt-[6px] size-[4px] shrink-0 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
                {k}
              </li>
            ))}
          </ul>
          {variant.link && (
            <a
              href={variant.link}
              target="_blank"
              rel="noreferrer"
              className="mt-[14px] text-[12.5px] font-semibold text-accent underline underline-offset-2"
            >
              {copy.calculator}
            </a>
          )}
        </>
      ) : (
        <div className="mt-[16px] flex flex-1 flex-col gap-[10px] border-t border-line pt-[14px]">
          <p className="text-[12.5px] italic text-dim">{copy.keyTalentsPending}</p>
          <GhostBar width="82%" />
          <GhostBar width="64%" />
          <GhostBar width="73%" />
        </div>
      )}
    </div>
  );
}

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

/**
 * The active spec's leveling build (level 30 beta for now): spec banner, why
 * it works, and the talent calculator link. Falls back to the placeholder card
 * when a spec has no build yet.
 */
function LevelingCard() {
  const { spec } = useHandbook();
  const path = leveling.find((l) => l.spec === spec);
  if (!path) return <BuildCard title={copy.levelingTitle} variant={undefined} />;

  return (
    <div className="panel flex flex-col p-[18px]">
      <div className="flex items-baseline justify-between gap-[10px]">
        <span className="t-panel-label text-ink">{copy.levelingTitle}</span>
        <span className="t-eyebrow text-[9px] text-faint">{copy.levelingTag}</span>
      </div>
      <div className="mt-[14px] overflow-hidden rounded-[10px] border border-line">
        <Banner path={path} />
      </div>
      <p className="mt-[14px] flex-1 text-[12.5px] leading-[1.6] text-mute">{path.body}</p>
      <p className="mt-[10px] text-[11.5px] leading-[1.55] text-faint">{copy.levelingNote}</p>
      <div className="mt-[14px]">
        {path.href ? (
          <a
            href={path.href}
            target="_blank"
            rel="noreferrer"
            className="block rounded-[8px] border border-line px-[13px] py-[9px] text-center text-[12.5px] font-semibold text-mute transition-colors hover:border-accent hover:bg-accent-dim hover:text-accent"
          >
            {copy.levelingCta}
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-[8px] border border-line px-[13px] py-[9px] text-center text-[12.5px] font-semibold text-mute opacity-50"
          >
            {copy.levelingComingSoon}
          </button>
        )}
      </div>
    </div>
  );
}

/** Build tabs, or a disabled stand-in showing where they will go. */
function BuildPicker({
  variants,
  active,
  onPick,
}: {
  variants: TalentVariant[];
  active: TalentVariant | undefined;
  onPick: (id: string) => void;
}) {
  const { tone } = useTheme();
  const { spec } = useHandbook();

  return (
    <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[8px]">
      <span className="t-eyebrow text-[9.5px] tracking-[.18em] text-faint">{copy.buildsLabel}</span>
      {variants.length ? (
        <SegmentedTabs
          tabs={variants.map((v) => ({ id: tabId(v.id), label: v.name }))}
          value={tabId(active!.id)}
          onChange={(id) => onPick(id.slice(tabId('').length))}
          label={`${copy.buildsLabel}: ${specById[spec].name}`}
        />
      ) : (
        <span
          className="flex items-center gap-[8px] rounded-[10px] border border-dashed border-line px-[14px] py-[9px] text-[12.5px] font-semibold text-dim"
        >
          <span
            aria-hidden="true"
            className="size-[7px] rounded-full"
            style={{ background: tone(specById[spec].color, 3) }}
          />
          {copy.buildsPending}
        </span>
      )}
      <p className="basis-full text-[12.5px] leading-[1.55] text-mute">
        {active ? active.niche : copy.buildsPendingNote}
      </p>
    </div>
  );
}

export function Talents() {
  const { spec } = useHandbook();
  const { tone } = useTheme();
  const [introBefore, introAfter] = copy.intro.split('{spec}');
  const { talentVariants } = specDetail[spec];
  // Remember the chosen build per spec, so flipping specs and back keeps your place.
  const [picked, setPicked] = useState<Partial<Record<SpecId, string>>>({});
  const active = talentVariants.find((v) => v.id === picked[spec]) ?? talentVariants[0];

  return (
    <section id="talents" aria-label="Talents">
      <SectionHeading id="talents" scope="spec" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute" aria-live="polite">
        {introBefore}
        {/* Same colour as the spec's dot in the Active Spec bar. */}
        <span className="font-semibold" style={{ color: tone(specById[spec].color) }}>
          {specById[spec].name}
        </span>
        {introAfter}
      </p>

      <div className="mt-[16px]">
        <Callout tone="accent" dashed label={copy.todoLabel}>
          {copy.todo}
        </Callout>
      </div>

      <div className="mt-[18px]">
        <BuildPicker
          variants={talentVariants}
          active={active}
          onPick={(id) => setPicked((p) => ({ ...p, [spec]: id }))}
        />
      </div>

      <div className="mt-[14px] grid gap-[14px] stack:grid-cols-2">
        <div
          className="flex flex-col [&>*]:flex-1"
          {...(active
            ? { id: `panel-${tabId(active.id)}`, role: 'tabpanel', 'aria-labelledby': `tab-${tabId(active.id)}` }
            : {})}
        >
          <BuildCard title={copy.endgameTitle} variant={active} total={TOTAL_POINTS} />
        </div>
        <LevelingCard />
      </div>
    </section>
  );
}
